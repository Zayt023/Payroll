import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computePayroll } from "@/lib/payroll/calculator"
import { generateReference } from "@/lib/utils"
import { createNotification } from "@/services/notifications"

export async function POST(req: Request) {
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { periodStart, periodEnd } = await req.json()
    if (!periodStart || !periodEnd) return NextResponse.json({ error: "periodStart and periodEnd required" }, { status: 400 })

    const start = new Date(periodStart)
    const end = new Date(periodEnd)

    const employees = await prisma.employee.findMany({
      where: { status: "Active" },
      include: { allowances: true, deductions: true, attendanceRecords: { where: { date: { gte: start, lte: end } } } },
    })

    if (!employees.length) return NextResponse.json({ error: "No active employees found" }, { status: 400 })

    const batch = await prisma.payrollBatch.create({
      data: {
        batchName: `Payroll ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        periodStart: start,
        periodEnd: end,
        status: "DRAFT",
        uploadedBy: session.user.id!,
        totalEmployees: employees.length,
      },
    })

    let expectedWorkDays = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) expectedWorkDays++
    }
    const STANDARD_HOURS = 8

    for (const employee of employees) {
      const records = employee.attendanceRecords
      let totalRegularHours = 0
      let totalOvertimeHours = 0
      let totalLateMinutes = 0
      let workingDays = 0

      for (const r of records) {
        const hrs = r.totalHours || 0
        if (hrs > 0) {
          workingDays++
          const ot = Math.max(0, hrs - STANDARD_HOURS)
          const reg = hrs - ot
          totalRegularHours += reg
          totalOvertimeHours += ot
          totalLateMinutes += r.lateMinutes || 0
        }
      }

      const totalAbsences = Math.max(0, expectedWorkDays - workingDays)

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
        overtimeHours: totalOvertimeHours,
        overtimeRate: 1.25,
        lateMinutes: totalLateMinutes,
        absences: totalAbsences,
        holidayPay: 0,
        allowances: activeAllowances,
        deductions: activeDeductions,
        cashAdvance: 0,
      })

      const record = await prisma.payrollRecord.create({
        data: {
          batchId: batch.id,
          employeeId: employee.id,
          regularHours: totalRegularHours,
          overtimeHours: totalOvertimeHours,
          lateMinutes: totalLateMinutes,
          absences: totalAbsences,
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

      await prisma.generatedPayslip.create({
        data: {
          payrollRecordId: record.id,
          employeeId: employee.id,
          batchId: batch.id,
          referenceNumber: generateReference(),
          periodStart: start,
          periodEnd: end,
        },
      })

      await prisma.payrollBatch.update({
        where: { id: batch.id },
        data: {
          totalGross: { increment: result.grossPay },
          totalDeductions: { increment: result.totalDeductions },
          totalNetPay: { increment: result.netPay },
        },
      })
    }

    await createNotification({
      type: "payroll_created",
      title: "New Payroll Batch Created",
      message: `${batch.batchName} — ${employees.length} employees`,
      link: `/payroll/${batch.id}`,
    })

    return NextResponse.json({ batchId: batch.id, message: `Payroll processed for ${employees.length} employees` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process timesheet" }, { status: 500 })
  }
}
