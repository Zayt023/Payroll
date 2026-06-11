import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEmployeeById, updateEmployee, deleteEmployee } from "@/services/employees"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const employee = await getEmployeeById(id)
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(employee)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const data = await req.json()
    const employee = await updateEmployee(id, data)
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await deleteEmployee(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
