import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) return NextResponse.json({ error: "start and end required" }, { status: 400 })

  const periodStart = new Date(start)
  const periodEnd = new Date(end)

  const employees = await prisma.employee.findMany({
    where: { status: "Active" },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, department: true, employeeId: true, shiftStart: true, shiftEnd: true, basicSalary: true },
  })

  const records = await prisma.attendanceRecord.findMany({
    where: { date: { gte: periodStart, lte: periodEnd } },
    include: { clientHours: { include: { client: { select: { id: true, name: true, code: true } } } } },
  })

  const clients = await prisma.client.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })

  const recordsByEmployee: Record<string, typeof records> = {}
  for (const r of records) {
    if (!recordsByEmployee[r.employeeId]) recordsByEmployee[r.employeeId] = []
    recordsByEmployee[r.employeeId].push(r)
  }

  return NextResponse.json({ employees, records: recordsByEmployee, clients, periodStart, periodEnd })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { entries } = await req.json()
    if (!entries || !Array.isArray(entries)) return NextResponse.json({ error: "entries array required" }, { status: 400 })

    for (const entry of entries) {
      let { id, employeeId, date, hours, breakMinutes, status, remarks, clientHours } = entry
      breakMinutes = breakMinutes || 0
      hours = hours || 0
      const totalHours = hours
      const overtime = Math.max(0, totalHours - 8)
      const data = { breakMinutes, totalHours, overtime, lateMinutes: 0, status: status || (totalHours > 0 ? "Present" : "Absent"), remarks }

      let recordId = id
      if (id) {
        await prisma.attendanceRecord.update({ where: { id }, data })
      } else {
        const created = await prisma.attendanceRecord.create({ data: { employeeId, date: new Date(date), ...data } })
        recordId = created.id
      }

      if (recordId && clientHours && clientHours.length > 0) {
        await prisma.attendanceClientHour.deleteMany({ where: { attendanceRecordId: recordId } })
        for (const ch of clientHours) {
          if (ch.clientId && ch.hours > 0) {
            await prisma.attendanceClientHour.create({ data: { attendanceRecordId: recordId, clientId: ch.clientId, hours: ch.hours } })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
