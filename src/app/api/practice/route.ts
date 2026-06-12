import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(clients, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { name, code } = await req.json()
    if (!name || !code) return NextResponse.json({ error: "name and code required" }, { status: 400 })
    const client = await prisma.client.create({ data: { name, code } })
    return NextResponse.json(client)
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Client code already exists" }, { status: 409 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
