import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSettings, updateSettings } from "@/services/settings"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("GET /api/settings error:", error)
    return NextResponse.json({ name: "", address: "", tin: "" }, { status: 200 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const settings = await updateSettings(body)
    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 })
  }
}
