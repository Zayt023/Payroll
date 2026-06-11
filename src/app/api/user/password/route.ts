import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { updateUserPassword } from "@/services/auth"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

    await updateUserPassword(session.user.id!, newPassword)

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 })
  }
}
