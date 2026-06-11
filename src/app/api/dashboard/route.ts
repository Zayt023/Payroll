import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDashboardStats } from "@/services/dashboard"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 })
  }
}
