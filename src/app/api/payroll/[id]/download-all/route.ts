import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { downloadPayslipPDF } from "@/services/payslips"
import JSZip from "jszip"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const batch = await prisma.payrollBatch.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            employee: { select: { firstName: true, lastName: true } },
            payslips: { select: { id: true, referenceNumber: true } },
          },
        },
      },
    })
    if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const zip = new JSZip()

    for (const record of batch.records) {
      if (!record.payslips[0]) continue
      try {
        const { pdf, filename } = await downloadPayslipPDF(record.payslips[0].id)
        zip.file(filename, pdf)
      } catch (e) {
        console.error(`Failed to generate payslip ${record.payslips[0].id}:`, e)
      }
    }

    const ab = await zip.generateAsync({ type: "arraybuffer" })
    const filename = `payslips-${batch.batchName.replace(/[^a-zA-Z0-9]/g, "_")}.zip`

    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Download all error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate zip" }, { status: 500 })
  }
}
