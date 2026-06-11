import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markAsRead } from "@/services/notifications"

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const id = url.pathname.split("/").pop()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    await markAsRead(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
