import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSettings } from "@/services/settings"
import { createElement } from "react"

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const company = await getSettings()
    const { renderToStream } = await import("@react-pdf/renderer")
    const { PayslipPDF } = await import("@/lib/pdf/react-payslip")

    const sample: any = {
      id: "preview",
      referenceNumber: "PRV-2026-0001",
      employee: {
        firstName: "Juan", lastName: "Dela Cruz",
        employeeId: "EMP-2026-001", department: "Medical Services",
        position: "Senior Nurse",
        basicSalary: 45000, dailyRate: 1730.77, hourlyRate: 216.35,
      },
      periodStart: new Date("2026-05-01"),
      periodEnd: new Date("2026-05-31"),
      regularHours: 176, overtimeHours: 8, lateMinutes: 15, absences: 0,
      basicSalary: 45000, overtimePay: 2163.46, holidayPay: 1730.77,
      grossPay: 48894.23,
      sssDeduction: 1125, philhealthDeduction: 562.50, pagibigDeduction: 200,
      taxDeduction: 3215.47, cashAdvance: 0, otherDeductions: 1500,
      totalDeductions: 6602.97, netPay: 42291.26,
      allowances: [{ name: "Rice Allowance", amount: 1500 }],
      deductions: [{ name: "Uniform Deduction", amount: 1500 }],
    }

    const stream = await renderToStream(createElement(PayslipPDF, { data: sample, company }) as any)
    const chunks: Buffer[] = []
    for await (const chunk of stream as any) { chunks.push(Buffer.from(chunk)) }
    const pdf = Buffer.concat(chunks)

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="payslip-preview.pdf"',
      },
    })
  } catch (error: any) {
    console.error("Payslip preview error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate preview" }, { status: 500 })
  }
}
