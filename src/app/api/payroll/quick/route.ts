import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPayrollBatch, processPayrollBatch } from "@/services/payroll"
import { createAuditLog } from "@/services/audit"
import { createNotification } from "@/services/notifications"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { periodStart, periodEnd, employeeIds } = await req.json()
    if (!periodStart || !periodEnd) {
      return NextResponse.json({ error: "periodStart and periodEnd are required" }, { status: 400 })
    }

    const batch = await createPayrollBatch({
      batchName: `Payroll ${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      uploadedBy: session.user.id!,
    })

    const where = employeeIds?.length ? { id: { in: employeeIds } } : {}
    const employees = await prisma.employee.findMany({ where })

    const employeeData = employees.map((emp) => ({
      employeeId: emp.employeeId,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      basicSalary: emp.basicSalary,
      attendance: [{
        date: new Date().toISOString(),
        totalHours: 176,
        overtime: 0,
        lateMinutes: 0,
      }],
      holidayPay: 0,
      cashAdvance: 0,
      allowances: [],
      additionalDeductions: [],
    }))

    const result = await processPayrollBatch(batch.id, employeeData)

    await createAuditLog({
      userId: session.user.id!,
      action: "Quick-generated payroll batch",
      entity: "PayrollBatch",
      entityId: batch.id,
      details: `Auto-created batch with ${result.count} employees from ${new Date(periodStart).toLocaleDateString()} to ${new Date(periodEnd).toLocaleDateString()}`,
      batchId: batch.id,
    })

    await createNotification({
      type: "payroll_created",
      title: "New Payroll Batch Created",
      message: `Quick batch — ${result.count} employees (${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()})`,
      link: `/payroll/${batch.id}`,
    })

    return NextResponse.json({
      batch: result.batch,
      records: result.count,
      totalGross: result.totalGross,
      totalNetPay: result.totalNetPay,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 })
  }
}
