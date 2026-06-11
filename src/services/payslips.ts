import { prisma } from "@/lib/prisma"
import { createElement } from "react"
import { computePayroll } from "@/lib/payroll/calculator"
import { generateReference } from "@/lib/utils"
import type { PayslipData } from "@/types"

export async function generatePayslipForEmployee(employeeId: string, batchId?: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { allowances: true, deductions: true },
  })
  if (!employee) throw new Error("Employee not found")

  const periodStart = new Date()
  periodStart.setMonth(periodStart.getMonth() - 1)
  const periodEnd = new Date()

  let batch = batchId
    ? await prisma.payrollBatch.findUnique({ where: { id: batchId } })
    : null

  if (!batch) {
    batch = await prisma.payrollBatch.create({
      data: {
        batchName: `Payslip - ${employee.firstName} ${employee.lastName} ${periodStart.toLocaleDateString()}`,
        periodStart,
        periodEnd,
        status: "COMPLETED",
        uploadedBy: "system",
        totalEmployees: 1,
      },
    })
  }

  const activeAllowances = employee.allowances
    .filter((a) => a.frequency === "monthly")
    .map((a) => ({ name: a.name, amount: a.amount }))

  const activeDeductions = employee.deductions
    .filter((d) => d.frequency === "monthly")
    .map((d) => ({ name: d.name, amount: d.amount }))

  const result = computePayroll({
    basicSalary: employee.basicSalary,
    dailyRate: employee.dailyRate,
    hourlyRate: employee.hourlyRate,
    salaryType: employee.salaryType || "Monthly",
    overtimeHours: 0,
    overtimeRate: 1.25,
    lateMinutes: 0,
    absences: 0,
    holidayPay: 0,
    allowances: activeAllowances,
    deductions: activeDeductions,
    cashAdvance: 0,
  })

  const record = await prisma.payrollRecord.create({
    data: {
      batchId: batch.id,
      employeeId: employee.id,
      regularHours: 176,
      overtimeHours: 0,
      lateMinutes: 0,
      absences: 0,
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
      periodStart,
      periodEnd,
    },
  })

  await prisma.payrollBatch.update({
    where: { id: batch.id },
    data: {
      totalEmployees: { increment: 1 },
      totalGross: { increment: result.grossPay },
      totalDeductions: { increment: result.totalDeductions },
      totalNetPay: { increment: result.netPay },
    },
  })

  return payslip
}

export async function getAllPayslips() {
  return prisma.generatedPayslip.findMany({
    orderBy: { generatedAt: "desc" },
    take: 100,
    include: {
      employee: {
        select: { firstName: true, lastName: true, employeeId: true, department: true },
      },
      payrollRecord: {
        select: { netPay: true, grossPay: true, basicSalary: true },
      },
      batch: {
        select: { batchName: true, periodStart: true, periodEnd: true },
      },
    },
  })
}

export async function getPayslipById(id: string) {
  return prisma.generatedPayslip.findUnique({
    where: { id },
    include: {
      employee: true,
      payrollRecord: true,
    },
  })
}

export async function downloadPayslipPDF(id: string) {
  const payslip = await prisma.generatedPayslip.findUnique({
    where: { id },
    include: {
      employee: true,
      payrollRecord: true,
    },
  })

  if (!payslip) throw new Error("Payslip not found")

  const record = payslip.payrollRecord
  const employee = payslip.employee

  const allowances = await prisma.allowance.findMany({
    where: { payrollRecordId: record.id },
  })
  const deductions = await prisma.deduction.findMany({
    where: { payrollRecordId: record.id },
  })

  const pdfData: PayslipData = {
    id: payslip.id,
    referenceNumber: payslip.referenceNumber,
    employee: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeId: employee.employeeId,
      department: employee.department,
      position: employee.position,
      basicSalary: employee.basicSalary,
      dailyRate: employee.dailyRate,
      hourlyRate: employee.hourlyRate,
    },
    periodStart: payslip.periodStart,
    periodEnd: payslip.periodEnd,
    regularHours: record.regularHours,
    overtimeHours: record.overtimeHours,
    lateMinutes: record.lateMinutes,
    absences: record.absences,
    basicSalary: record.basicSalary,
    overtimePay: record.overtimePay,
    holidayPay: record.holidayPay,
    grossPay: record.grossPay,
    sssDeduction: record.sssDeduction,
    philhealthDeduction: record.philhealthDeduction,
    pagibigDeduction: record.pagibigDeduction,
    taxDeduction: record.taxDeduction,
    cashAdvance: record.cashAdvance,
    otherDeductions: record.otherDeductions,
    totalDeductions: record.totalDeductions,
    netPay: record.netPay,
    allowances: allowances.map((a) => ({ name: a.name, amount: a.amount })),
    deductions: deductions.map((d) => ({ name: d.name, amount: d.amount })),
  }

  const company = await prisma.companySettings.findUnique({ where: { id: "default" } })

  const { renderToStream } = await import("@react-pdf/renderer")
  const { PayslipPDF } = await import("@/lib/pdf/react-payslip")
  const stream = await renderToStream(createElement(PayslipPDF, { data: pdfData, company: company || undefined }) as any)
  const chunks: Buffer[] = []
  for await (const chunk of stream as any) { chunks.push(Buffer.from(chunk)) }
  const pdf = Buffer.concat(chunks)

  await prisma.generatedPayslip.update({
    where: { id },
    data: { downloadedAt: new Date() },
  })

  return { pdf, filename: `payslip-${employee.firstName}-${employee.lastName}-${payslip.referenceNumber}.pdf` }
}
