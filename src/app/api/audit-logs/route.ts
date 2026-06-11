import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAuditLogs } from "@/services/audit"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const logs = await getAuditLogs()
    return NextResponse.json(logs)
  } catch (error: any) {
    console.error("GET /api/audit-logs error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
