import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllBatches, processPayrollBatch } from "@/services/payroll"
import { createAuditLog } from "@/services/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const batches = await getAllBatches()
    return NextResponse.json(batches)
  } catch (error: any) {
    console.error("GET /api/payroll error:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { batchId, employeeData } = await req.json()

    const result = await processPayrollBatch(batchId, employeeData || [])

    await createAuditLog({
      userId: session.user.id!,
      action: "Processed payroll batch",
      entity: "PayrollBatch",
      entityId: batchId,
      details: `Processed ${result.count} payroll records`,
      batchId,
    })

    return NextResponse.json({
      batch: result.batch,
      records: result.count,
      totalGross: result.totalGross,
      totalNetPay: result.totalNetPay,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process payroll" }, { status: 500 })
  }
}
