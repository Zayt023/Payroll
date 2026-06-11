import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getBatchById } from "@/services/payroll"
import { createAuditLog } from "@/services/audit"
import { createNotification } from "@/services/notifications"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const batch = await getBatchById(id)
  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(batch)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { status } = await req.json()
    if (!["DRAFT", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const batch = await prisma.payrollBatch.update({ where: { id }, data: { status } })

    await createAuditLog({
      userId: session.user.id!,
      action: `Batch status changed to ${status}`,
      entity: "PayrollBatch",
      entityId: id,
      details: `Status updated from previous to ${status}`,
      batchId: id,
    })

    const label = status === "COMPLETED" ? "Completed" : "Cancelled"
    await createNotification({
      type: `payroll_${status.toLowerCase()}`,
      title: `Payroll Batch ${label}`,
      message: `${batch.batchName} has been ${status.toLowerCase()}`,
      link: `/payroll/${id}`,
    })

    return NextResponse.json(batch)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 })
  }
}
