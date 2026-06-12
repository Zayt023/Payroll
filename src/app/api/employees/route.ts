import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAllEmployees, createEmployee } from "@/services/employees"
import { createAuditLog } from "@/services/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const employees = await getAllEmployees()
    return NextResponse.json(employees, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } })
  } catch (error: any) {
    console.error("GET /api/employees error:", error)
    return NextResponse.json({ error: error?.message || "Unknown" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const data = await req.json()
    const employee = await createEmployee(data)
    await createAuditLog({
      userId: session.user.id!,
      action: "Created employee",
      entity: "Employee",
      entityId: employee.id,
      details: `${employee.firstName} ${employee.lastName} added`,
    })
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
