import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllPayslips, generatePayslipForEmployee } from "@/services/payslips"
import { createAuditLog } from "@/services/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const payslips = await getAllPayslips()
    return NextResponse.json(payslips, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } })
  } catch (error: any) {
    console.error("GET /api/payslips error:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { employeeId, batchId } = await req.json()
    if (!employeeId) return NextResponse.json({ error: "employeeId is required" }, { status: 400 })

    const payslip = await generatePayslipForEmployee(employeeId, batchId)

    await createAuditLog({
      userId: session.user.id!,
      action: "Generated payslip",
      entity: "GeneratedPayslip",
      entityId: payslip.id,
      details: `Payslip ${payslip.referenceNumber} generated`,
    })

    return NextResponse.json(payslip)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate payslip" }, { status: 500 })
  }
}
