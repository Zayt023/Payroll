import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getNotifications, getUnreadCount, markAllAsRead } from "@/services/notifications"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const [notifications, unread] = await Promise.all([getNotifications(10), getUnreadCount()])
    return NextResponse.json({ notifications, unread })
  } catch {
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await markAllAsRead()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
