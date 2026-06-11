import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib"
import type { PayslipData } from "@/types"

export interface CompanyInfo {
  name: string
  address: string
  tin: string
}

const FALLBACK_COMPANY: CompanyInfo = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "A3MB Medical Services",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Unit 7, Future 7 Building, Good Earth, Tondo, Manila, Philippines 1013",
  tin: process.env.NEXT_PUBLIC_COMPANY_TIN || "000-000-000-000",
}

const C = {
  white: rgb(1, 1, 1),
  navy: rgb(0.10, 0.15, 0.22),
  navyLight: rgb(0.15, 0.22, 0.32),
  gold: rgb(0.72, 0.58, 0.32),
  slate900: rgb(0.11, 0.13, 0.16),
  slate800: rgb(0.18, 0.20, 0.24),
  slate700: rgb(0.28, 0.30, 0.35),
  slate600: rgb(0.40, 0.42, 0.47),
  slate500: rgb(0.52, 0.55, 0.60),
  slate400: rgb(0.66, 0.68, 0.73),
  slate300: rgb(0.80, 0.82, 0.86),
  slate200: rgb(0.90, 0.91, 0.94),
  slate150: rgb(0.945, 0.95, 0.96),
  slate100: rgb(0.965, 0.97, 0.98),
  red: rgb(0.75, 0.12, 0.12),
  green: rgb(0.06, 0.45, 0.20),
}

const m = 45
const pw = PageSizes.A4[0]
const ph = PageSizes.A4[1]
const cw = pw - m * 2

export async function generatePayslipPDF(data: PayslipData, company?: CompanyInfo): Promise<Uint8Array> {
  const c = company || FALLBACK_COMPANY
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const mono = await pdf.embedFont(StandardFonts.Courier)

  let page = pdf.addPage(PageSizes.A4)
  let y = ph - m

  function txt(text: string, x: number, yy: number, size: number = 9, opts: any = {}) {
    page.drawText(text, { x, y: yy, size, font: opts.font || (opts.bold ? bold : font), color: opts.color || C.slate900, ...opts })
  }
  function ln(yy: number, thick: number = 0.5, color: any = C.slate300) {
    page.drawLine({ start: { x: m, y: yy }, end: { x: pw - m, y: yy }, thickness: thick, color })
  }
  function bg(yy: number, h: number, color: any) {
    page.drawRectangle({ x: m, y: yy - h, width: cw, height: h, color })
  }
  function rnd(x: number, yy: number, w: number, h: number, color: any) {
    page.drawRectangle({ x, y: yy - h, width: w, height: h, color })
  }
  function center(text: string, yy: number, size: number = 9, opts: any = {}) {
    const f = opts.font || (opts.bold ? bold : font)
    const w = f.widthOfTextAtSize(text, size)
    txt(text, (pw - w) / 2, yy, size, opts)
  }

  // ── PAGE BORDER ──
  page.drawRectangle({ x: 18, y: 18, width: pw - 36, height: ph - 36, color: C.white, borderColor: C.slate300, borderWidth: 0.5 })

  // ── TOP DOUBLE LINE ──
  ln(y + 2, 2, C.navy)
  ln(y - 2, 0.5, C.gold)
  y -= 22

  // ── COMPANY LETTERHEAD ──
  center(c.name, y, 16, { bold: true, color: C.navy })
  y -= 14
  center(c.address, y, 8, { color: C.slate600 })
  y -= 12
  center(`TIN: ${c.tin}`, y, 8, { color: C.slate600 })
  y -= 18

  // ── TITLE ──
  center("PAYSLIP", y, 18, { bold: true, color: C.navy })
  y -= 13
  center(`#${data.referenceNumber}  |  Period: ${fmt(data.periodStart)} — ${fmt(data.periodEnd)}`, y, 7.5, { font: mono, color: C.slate500 })
  y -= 18

  // ── DECORATIVE SEPARATOR ──
  ln(y, 1.5, C.navy)
  ln(y - 3, 0.5, C.gold)
  y -= 18

  // ── EMPLOYEE INFO ──
  bg(y + 40, 40, C.slate150)
  page.drawRectangle({ x: m, y: y + 40 - 40, width: cw, height: 40, borderColor: C.slate200, borderWidth: 0.5 })
  txt("EMPLOYEE DETAILS", m + 14, y + 28, 8, { bold: true, color: C.navyLight })
  const empFields: [string, string, string, string][] = [
    ["Employee Name", `${data.employee.firstName} ${data.employee.lastName}`, "Employee ID", data.employee.employeeId],
    ["Department", data.employee.department, "Position", data.employee.position],
  ]
  let ey = y + 16
  empFields.forEach(([l1, v1, l2, v2]) => {
    txt(l1, m + 14, ey, 7, { color: C.slate500 })
    txt(v1, m + 95, ey, 9, { bold: true, color: C.slate900 })
    txt(l2, m + 290, ey, 7, { color: C.slate500 })
    txt(v2, m + 370, ey, 9, { bold: true, color: C.slate900 })
    ey -= 16
  })
  y -= 48

  // ── EARNINGS & DEDUCTIONS ──
  y -= 12
  const colW = 248
  const earnX = m
  const dedX = m + colW + 14

  // Table headers
  rnd(earnX, y + 20, colW, 20, C.navy)
  txt("EARNINGS", earnX + 12, y + 6, 9, { bold: true, color: C.white })
  txt("AMOUNT", earnX + colW - 12, y + 6, 9, { bold: true, color: C.white })
  rnd(dedX, y + 20, colW, 20, C.navy)
  txt("DEDUCTIONS", dedX + 12, y + 6, 9, { bold: true, color: C.white })
  txt("AMOUNT", dedX + colW - 12, y + 6, 9, { bold: true, color: C.white })
  y -= 26

  const earnings: [string, number][] = [
    ["Basic Salary", data.basicSalary],
    ["Overtime Pay", data.overtimePay],
    ["Holiday Pay", data.holidayPay],
  ]
  data.allowances.forEach((a) => earnings.push([a.name, a.amount]))

  const deductions: [string, number][] = [
    ["SSS", data.sssDeduction],
    ["PhilHealth", data.philhealthDeduction],
    ["Pag-IBIG", data.pagibigDeduction],
    ["Withholding Tax", data.taxDeduction],
    ["Cash Advance", data.cashAdvance],
  ]
  data.deductions.forEach((d) => deductions.push([d.name, d.amount]))

  const maxRows = Math.max(earnings.length, deductions.length, 6)
  const rowH = 17

  for (let i = 0; i < maxRows; i++) {
    if (i < earnings.length) {
      const [label, amt] = earnings[i]
      const isLast = i === earnings.length - 1
      if (i % 2 === 1) rnd(earnX, y + rowH, colW, rowH, C.slate150)
      txt(label, earnX + 12, y + 4, isLast ? 9 : 8, { bold: isLast, color: isLast ? C.slate800 : C.slate700 })
      txt(`PHP ${amt.toLocaleString()}`, earnX + colW - 12, y + 4, isLast ? 9 : 8, { bold: isLast, color: isLast ? C.slate800 : C.slate700 })
      if (isLast) ln(y - 1, 0.5, C.slate400)
    }
    if (i < deductions.length) {
      const [label, amt] = deductions[i]
      const isLast = i === deductions.length - 1
      if (i % 2 === 1) rnd(dedX, y + rowH, colW, rowH, C.slate150)
      txt(label, dedX + 12, y + 4, isLast ? 9 : 8, { bold: isLast, color: isLast ? C.slate800 : C.slate700 })
      txt(`PHP ${amt.toLocaleString()}`, dedX + colW - 12, y + 4, isLast ? 9 : 8, { bold: isLast, color: isLast ? C.slate800 : C.slate700 })
      if (isLast) ln(y - 1, 0.5, C.slate400)
    }
    y -= rowH
  }

  // ── GROSS & TOTAL DEDUCTIONS ──
  y -= 8
  bg(y + 22, 22, C.slate150)
  txt("GROSS PAY", earnX + 12, y + 7, 10, { bold: true, color: C.navyLight })
  txt(`PHP ${data.grossPay.toLocaleString()}`, earnX + colW - 12, y + 7, 10, { bold: true, color: C.navyLight })
  txt("Total Deductions", dedX + 12, y + 7, 9, { bold: true, color: C.slate700 })
  txt(`PHP ${data.totalDeductions.toLocaleString()}`, dedX + colW - 12, y + 7, 9, { bold: true, color: C.slate700 })
  y -= 30

  // ── NET PAY ──
  const netH = 46
  rnd(m, y, cw, netH, C.navy)
  txt("NET PAY", m + 20, y + netH - 12, 9, { color: C.slate400 })
  txt(`PHP ${data.netPay.toLocaleString()}`, m + 20, y + netH - 32, 18, { bold: true, color: C.white })
  txt(`Gross: PHP ${data.grossPay.toLocaleString()}  |  Deductions: PHP ${data.totalDeductions.toLocaleString()}`, m + cw - 20, y + netH - 14, 7.5, { color: C.slate400 })
  y -= 54

  // ── SUMMARY ──
  ln(y, 1, C.navy)
  y -= 18
  txt("SUMMARY", m, y, 9, { bold: true, color: C.navy })
  y -= 22

  const summaryItems: [string, string][] = [
    ["Regular Hours", `${data.regularHours.toFixed(1)}h`],
    ["Overtime Hours", `${data.overtimeHours.toFixed(1)}h`],
    ["Late Minutes", `${data.lateMinutes.toFixed(0)}min`],
    ["Absences", `${data.absences.toFixed(0)} day(s)`],
    ["Basic Salary", `PHP ${data.basicSalary.toLocaleString()}`],
    ["Daily Rate", `PHP ${data.employee.dailyRate.toLocaleString()}`],
  ]
  summaryItems.forEach(([l, v], i) => {
    const col = i % 3 === 0 ? m : i % 3 === 1 ? m + 195 : m + 390
    const ry = y - Math.floor(i / 3) * 18
    txt(l, col, ry, 7.5, { color: C.slate500 })
    txt(v, col + 110, ry, 7.5, { bold: true, color: C.slate900 })
  })

  // ── SIGNATURES ──
  const sumRows = Math.ceil(summaryItems.length / 3)
  y = Math.min(y - sumRows * 18 - 20, y - 55) - 20
  ln(y, 0.5, C.slate300)
  y -= 18

  txt("Prepared by:", m, y, 8, { color: C.slate600 })
  const prepX = m + 72
  page.drawLine({ start: { x: prepX, y }, end: { x: prepX + 155, y }, thickness: 0.5, color: C.slate400 })
  txt("HR Department", prepX, y - 12, 7, { color: C.slate500 })

  txt("Received by:", m + 275, y, 8, { color: C.slate600 })
  const recX = m + 355
  page.drawLine({ start: { x: recX, y }, end: { x: recX + 155, y }, thickness: 0.5, color: C.slate400 })
  txt("Employee Signature", recX, y - 12, 7, { color: C.slate500 })

  txt("Date:", m + 275, y - 32, 8, { color: C.slate600 })
  page.drawLine({ start: { x: m + 315, y: y - 32 }, end: { x: m + 510, y: y - 32 }, thickness: 0.5, color: C.slate400 })

  // ── FOOTER ──
  y = 40
  ln(y, 0.5, C.slate300)
  y -= 16
  const genDate = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
  txt(`Generated: ${genDate}  |  Ref: ${data.referenceNumber}`, m, y, 6.5, { color: C.slate500 })
  txt("This is a computer-generated payslip.", pw - m, y, 6.5, { color: C.slate500 })

  // ── BOTTOM DOUBLE LINE ──
  y = 18
  ln(y + 2, 0.5, C.gold)
  ln(y, 2, C.navy)

  return pdf.save()
}

function fmt(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}
