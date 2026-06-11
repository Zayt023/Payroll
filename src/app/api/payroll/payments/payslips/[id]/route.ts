import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { downloadPayslipPDF } from "@/services/payslips"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { pdf, filename } = await downloadPayslipPDF(id)
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error("Payslip download error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
  }
}
