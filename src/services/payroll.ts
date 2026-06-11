import { prisma } from "@/lib/prisma"
import { computePayroll } from "@/lib/payroll/calculator"
import { generateReference } from "@/lib/utils"

export async function createPayrollBatch(data: {
  batchName: string
  periodStart: Date
  periodEnd: Date
  uploadedBy: string
  fileName?: string
}) {
  return prisma.payrollBatch.create({ data: { ...data, status: "DRAFT" } })
}

export async function getAllBatches() {
  return prisma.payrollBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { records: true } },
    },
  })
}

export async function getBatchById(id: string) {
  return prisma.payrollBatch.findUnique({
    where: { id },
    include: {
      records: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              department: true,
              position: true,
            },
          },
          payslips: {
            select: { id: true, referenceNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      auditLogs: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
}

export async function processPayrollBatch(
  batchId: string,
  employees: { employeeId?: string; name?: string; email?: string; department?: string; position?: string; basicSalary?: number; attendance?: any[]; holidayPay?: number; cashAdvance?: number; allowances?: { name: string; amount: number }[]; additionalDeductions?: { name: string; amount: number }[] }[]
) {
  const batch = await prisma.payrollBatch.findUnique({ where: { id: batchId } })
  if (!batch) throw new Error("Batch not found")

  const records = []
  let totalGross = 0, totalDeductions = 0, totalNetPay = 0

  for (const emp of employees) {
    let employee = await prisma.employee.findFirst({
      where: { OR: [{ employeeId: emp.employeeId }, { email: emp.email || "" }] },
    })

    if (!employee && emp.name) {
      const parts = String(emp.name).split(" ")
      employee = await prisma.employee.create({
        data: {
          employeeId: emp.employeeId || `EMP-${Date.now()}`,
          firstName: parts[0] || "Unknown",
          lastName: parts.slice(1).join(" ") || "Employee",
          email: emp.email || `${emp.employeeId || "emp"}@company.com`,
          department: emp.department || "General",
          position: emp.position || "Staff",
          dateHired: new Date(),
          basicSalary: emp.basicSalary || 20000,
          dailyRate: (emp.basicSalary || 20000) / 22,
          hourlyRate: (emp.basicSalary || 20000) / 176,
        },
      })
    }

    if (!employee) continue

    const attendance = emp.attendance || []
    const totalHours = attendance.reduce((s: number, a: any) => s + (a.totalHours || 0), 0)
    const overtimeHours = attendance.reduce((s: number, a: any) => s + (a.overtime || 0), 0)
    const lateMinutes = attendance.reduce((s: number, a: any) => s + (a.lateMinutes || 0), 0)
    const absences = attendance.filter((a: any) => !a.totalHours).length

    const result = computePayroll({
      basicSalary: employee.basicSalary,
      dailyRate: employee.dailyRate,
      hourlyRate: employee.hourlyRate,
      salaryType: employee.salaryType || "Monthly",
      overtimeHours,
      overtimeRate: employee.overtimeRate || 1.25,
      lateMinutes,
      absences,
      holidayPay: emp.holidayPay || 0,
      allowances: emp.allowances || [],
      deductions: emp.additionalDeductions || [],
      cashAdvance: emp.cashAdvance || 0,
    })

    const record = await prisma.payrollRecord.create({
      data: {
        batchId: batch.id,
        employeeId: employee.id,
        regularHours: totalHours,
        overtimeHours,
        lateMinutes,
        absences,
        basicSalary: result.basicSalary,
        overtimePay: result.overtimePay,
        holidayPay: result.holidayPay,
        grossPay: result.grossPay,
        sssDeduction: result.sssDeduction,
        philhealthDeduction: result.philhealthDeduction,
        pagibigDeduction: result.pagibigDeduction,
        taxDeduction: result.taxDeduction,
        cashAdvance: result.cashAdvance,
        otherDeductions: result.otherDeductions,
        totalDeductions: result.totalDeductions,
        netPay: result.netPay,
      },
    })

    const payslip = await prisma.generatedPayslip.create({
      data: {
        payrollRecordId: record.id,
        employeeId: employee.id,
        batchId: batch.id,
        referenceNumber: generateReference(),
        periodStart: batch.periodStart,
        periodEnd: batch.periodEnd,
      },
    })

    totalGross += result.grossPay
    totalDeductions += result.totalDeductions
    totalNetPay += result.netPay
    records.push({ record, payslip })
  }

  await prisma.payrollBatch.update({
    where: { id: batch.id },
    data: {
      totalEmployees: records.length,
      totalGross,
      totalDeductions,
      totalNetPay,
      status: "COMPLETED",
    },
  })

  return { batch, count: records.length, totalGross, totalNetPay }
}
