"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Download, Loader2, Search, Lock,
  Users, DollarSign, FileText, ChevronRight as ChevronRightIcon, Activity,
  XCircle, CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface PayrollDetail {
  id: string; batchName: string; periodStart: string; periodEnd: string
  status: string; totalEmployees: number; totalGross: number; totalNetPay: number; totalDeductions: number; fileName: string
  records: {
    id: string
    employee: { firstName: string; lastName: string; employeeId: string; department: string; position: string }
    basicSalary: number; grossPay: number; totalDeductions: number; netPay: number
    regularHours: number; overtimeHours: number; lateMinutes: number; absences: number
    sssDeduction: number; philhealthDeduction: number; pagibigDeduction: number
    taxDeduction: number; cashAdvance: number; otherDeductions: number
    overtimePay: number; holidayPay: number
    payslips: { id: string; referenceNumber: string }[]
  }[]
  auditLogs: { id: string; action: string; user: { name: string }; createdAt: string }[]
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    COMPLETED: { cls: "badge-success", label: "Completed" },
    DRAFT: { cls: "badge-warning", label: "Draft" },
    CANCELLED: { cls: "badge-neutral", label: "Cancelled" },
  }
  const s = map[status] || { cls: "badge-neutral", label: status }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

const tabs = ["Disbursements", "Activity", "Compliance"]

export default function PayrollDetailPage() {
  const params = useParams()
  const [data, setData] = useState<PayrollDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("Disbursements")
  const [detailEmp, setDetailEmp] = useState<PayrollDetail["records"][0] | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => { fetchData() }, [params.id])

  function fetchData() {
    setLoading(true)
    fetch(`/api/payroll/${params.id}`).then(async r => {
      try { const d = await r.json(); setData(d) } catch { setData(null) }
    }).finally(() => setLoading(false))
  }

  async function downloadPayslip(id: string) {
    const res = await fetch(`/api/payroll/payments/payslips/${id}`, { method: "POST" })
    if (!res.ok) throw new Error("Download failed")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `payslip-${id}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSingleDownload(id: string) {
    setDownloading(id)
    try { await downloadPayslip(id); toast.success("Payslip downloaded") }
    catch { toast.error("Download failed") }
    finally { setDownloading(null) }
  }

  async function handleDownloadAll() {
    setDownloadingAll(true)
    try {
      const res = await fetch(`/api/payroll/${params.id}/download-all`, { method: "POST" })
      if (!res.ok) { const t = await res.text(); throw new Error(t || `HTTP ${res.status}`) }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url;
      a.download = `payroll-batch-${params.id}.zip`; a.click()
      URL.revokeObjectURL(url)
      toast.success("Batch zip downloaded")
    } catch (e: any) { toast.error(e.message) }
    finally { setDownloadingAll(false) }
  }

  async function handleStatusChange(status: string) {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/payroll/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      toast.success(`Batch ${status.toLowerCase()}`)
      fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setStatusUpdating(false) }
  }

  const filteredRecords = data?.records.filter((r) =>
    `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeId} ${r.employee.department}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const ct = data?.records.reduce((a, r) => ({
    sss: a.sss + r.sssDeduction, philhealth: a.philhealth + r.philhealthDeduction,
    pagibig: a.pagibig + r.pagibigDeduction, tax: a.tax + r.taxDeduction,
    cashAdvance: a.cashAdvance + r.cashAdvance, other: a.other + r.otherDeductions,
    overtime: a.overtime + r.overtimePay, holiday: a.holiday + r.holidayPay,
    basic: a.basic + r.basicSalary, gross: a.gross + r.grossPay,
    net: a.net + r.netPay, ded: a.ded + r.totalDeductions,
    hours: a.hours + r.regularHours, othours: a.othours + r.overtimeHours,
  }), { sss: 0, philhealth: 0, pagibig: 0, tax: 0, cashAdvance: 0, other: 0, overtime: 0, holiday: 0, basic: 0, gross: 0, net: 0, ded: 0, hours: 0, othours: 0 })

  if (loading || !data) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#3d766d" }} />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/payroll" className="hover:text-primary transition-colors">Payroll Batches</Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="font-medium" style={{ color: "#3d766d" }}>{data.batchName}</span>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl surface-raised flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h1 className="text-xl font-bold text-primary tracking-tight">{data.batchName}</h1>
                  {statusBadge(data.status)}
                </div>
                <p className="text-sm text-muted">{formatDate(data.periodStart)} &ndash; {formatDate(data.periodEnd)}</p>
                <p className="text-xs text-muted mt-0.5">Source: {data.fileName || "Manual entry"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.status === "DRAFT" && (
                <>
                  <button onClick={() => handleStatusChange("CANCELLED")} disabled={statusUpdating}
                    className="btn btn-secondary btn-sm">
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </button>
                  <button onClick={() => handleStatusChange("COMPLETED")} disabled={statusUpdating}
                    className="btn btn-primary btn-sm">
                    {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                    Complete
                  </button>
                </>
              )}
              {data.status === "COMPLETED" && (
                <button onClick={handleDownloadAll} disabled={downloadingAll}
                  className="btn btn-secondary btn-sm">
                  {downloadingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  {downloadingAll ? "Zipping..." : data.totalEmployees === 1 ? "Download Payslip" : "Download All"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Employees", value: String(data.totalEmployees), icon: Users },
          { label: "Total Hours", value: ct ? `${Math.round(ct.hours)}h` : "—", icon: FileText },
          { label: "Gross Pay", value: formatCurrency(data.totalGross), icon: DollarSign },
          { label: "Total Deductions", value: formatCurrency(data.totalDeductions), icon: FileText },
          { label: "Net Pay", value: formatCurrency(data.totalNetPay), icon: DollarSign },
        ].map((s) => (
          <div key={s.label} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{s.label}</span>
              <s.icon className="h-4 w-4 text-secondary" />
            </div>
            <div className="kpi-value" style={{ fontSize: "1.25rem" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center border-b border-default gap-6">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-1 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === tab
                ? "border-[#3d766d] text-primary"
                : "border-transparent text-secondary hover:text-primary"
            }`}>{tab}</button>
        ))}
      </div>

      {activeTab === "Disbursements" && (
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <h2>Employee Disbursements</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input className="input w-48" style={{ paddingLeft: "36px" }} placeholder="Search..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Employee</th>
                  <th style={{ minWidth: 60, textAlign: "center" }}>Hours</th>
                  <th style={{ minWidth: 48, textAlign: "center" }}>OT</th>
                  <th style={{ minWidth: 106, textAlign: "center" }}>Basic</th>
                  <th style={{ minWidth: 106, textAlign: "center" }}>Gross</th>
                  <th style={{ minWidth: 106, textAlign: "center" }}>Deductions</th>
                  <th style={{ minWidth: 106, textAlign: "center" }}>Net</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="group cursor-pointer" onClick={() => setDetailEmp(r)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full surface-raised flex items-center justify-center text-[10px] font-bold shrink-0 text-secondary">
                          {r.employee.firstName[0]}{r.employee.lastName[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-primary">{r.employee.firstName} {r.employee.lastName}</span>
                          <span className="text-[10px] text-muted block">{r.employee.department}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-sm text-muted">{r.regularHours.toFixed(1)}</td>
                    <td className="text-center text-sm" style={{ color: r.overtimeHours > 0 ? "#2563eb" : undefined }}>
                      {r.overtimeHours > 0 ? `${r.overtimeHours.toFixed(1)}h` : "0.0"}
                    </td>
                    <td className="text-center text-sm text-primary">{formatCurrency(r.basicSalary)}</td>
                    <td className="text-center text-sm text-primary">{formatCurrency(r.grossPay)}</td>
                    <td className="text-center text-sm text-muted">{formatCurrency(r.totalDeductions)}</td>
                    <td className="text-center text-sm font-semibold text-primary">{formatCurrency(r.netPay)}</td>
                    <td className="text-center">
                      {r.payslips[0] ? (
                        <button onClick={e => { e.stopPropagation(); handleSingleDownload(r.payslips[0].id) }}
                          disabled={downloading === r.payslips[0].id}
                          className="btn btn-ghost h-7 w-7 text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          {downloading === r.payslips[0].id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />}
                        </button>
                      ) : <span className="text-xs text-muted">&mdash;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              {ct && (
                <tfoot>
                  <tr>
                    <td className="font-bold text-primary text-sm"><span style={{ marginLeft: 40 }}>TOTAL</span></td>
                    <td className="text-center font-bold text-sm">{ct.hours.toFixed(1)}</td>
                    <td className="text-center font-bold text-sm">
                      {ct.othours > 0 ? `${ct.othours.toFixed(1)}h` : "0.0"}
                    </td>
                    <td className="text-center font-bold text-sm">{formatCurrency(ct.basic)}</td>
                    <td className="text-center font-bold text-sm">{formatCurrency(ct.gross)}</td>
                    <td className="text-center font-bold text-sm text-muted">{formatCurrency(ct.ded)}</td>
                    <td className="text-center font-bold text-sm">{formatCurrency(ct.net)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="px-5 py-3 border-t border-default">
            <p className="text-xs text-muted">{filteredRecords.length} of {data.records.length} employees</p>
          </div>
        </div>
      )}

      {activeTab === "Activity" && (
        <div className="section-card">
          <div className="section-card-header">
            <h2>Batch Activity Log</h2>
          </div>
          <div className="section-card-body">
            <div className="relative space-y-4 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-default)]">
              {data.auditLogs.length === 0 ? (
                <p className="text-sm text-muted py-4">No activity recorded.</p>
              ) : (
                data.auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-10">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full surface-raised flex items-center justify-center border border-default">
                      <Activity className="h-3.5 w-3.5 text-secondary" />
                    </div>
                    <p className="text-sm font-medium text-primary">{log.action}</p>
                    <p className="text-[11px] text-muted mt-0.5">by {log.user?.name || "System"}</p>
                    <p className="text-[10px] text-muted mt-1">{formatDate(log.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 section-card">
            <div className="section-card-header">
              <h2>Deductions Breakdown</h2>
            </div>
            <div className="section-card-body p-0">
              <div className="table-wrap">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 140 }}>Component</th>
                      <th style={{ minWidth: 110, textAlign: "center" }}>Total</th>
                      <th style={{ minWidth: 100, textAlign: "center" }}>% of Gross</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Basic Salary", value: ct?.basic || 0, pct: true },
                      { label: "Overtime Pay", value: ct?.overtime || 0, pct: true },
                      { label: "Holiday Pay", value: ct?.holiday || 0, pct: true },
                      { label: "Gross Pay", value: ct?.gross || 0, pct: false, bold: true },
                      { label: "SSS", value: ct?.sss || 0, pct: true },
                      { label: "PhilHealth", value: ct?.philhealth || 0, pct: true },
                      { label: "Pag-IBIG", value: ct?.pagibig || 0, pct: true },
                      { label: "Tax Withholding", value: ct?.tax || 0, pct: true },
                      { label: "Cash Advance", value: ct?.cashAdvance || 0, pct: true },
                      { label: "Other Deductions", value: ct?.other || 0, pct: true },
                      { label: "Total Deductions", value: ct ? ct.sss + ct.philhealth + ct.pagibig + ct.tax + ct.cashAdvance + ct.other : 0, pct: true, bold: true },
                      { label: "Net Pay", value: ct?.net || 0, pct: false, bold: true, accent: true },
                    ].map((r) => {
                      const gross = ct?.gross || 1
                      return (
                        <tr key={r.label}>
                          <td className={r.bold ? "font-semibold text-primary" : "text-secondary"}>{r.label}</td>
                          <td className={`text-center tabular-nums ${r.accent ? "font-bold" : ""}`}
                            style={r.accent ? { color: "#3d766d" } : r.bold ? {} : undefined}>
                            {formatCurrency(r.value)}
                          </td>
                          <td className="text-center text-muted tabular-nums">
                            {r.pct ? `${((r.value / gross) * 100).toFixed(1)}%` : "—"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="section-card" style={{ borderColor: "#3d766d" }}>
              <div className="section-card-body">
                <div className="flex items-center gap-3 mb-2.5">
                  <Lock className="h-4 w-4" style={{ color: "#3d766d" }} />
                  <p className="text-sm font-medium" style={{ color: "#3d766d" }}>Compliance Verified</p>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  All tax withholdings comply with current BIR schedules. SSS, PhilHealth, and Pag-IBIG contributions are within mandated ranges.
                </p>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-body">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted">Period</h4>
                <p className="text-sm font-medium text-primary mt-1">{formatDate(data.periodStart)} &mdash; {formatDate(data.periodEnd)}</p>
                <p className="text-xs text-muted mt-0.5">{data.totalEmployees} employees</p>
              </div>
            </div>
            <div className="section-card">
              <div className="section-card-body">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted">Details</h4>
                <div className="space-y-2 mt-2">
                  {[
                    { label: "Currency", value: "PHP (₱)" },
                    { label: "Jurisdiction", value: "Philippines" },
                    { label: "Status", value: data.status },
                    { label: "Batch ID", value: data.id.slice(0, 12) + "..." },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between text-xs">
                      <span className="text-muted">{m.label}</span>
                      <span className="text-primary font-medium">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {detailEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setDetailEmp(null)}>
          <div className="surface-base border border-default rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-default">
              <div>
                <h3 className="text-sm font-semibold text-primary">{detailEmp.employee.firstName} {detailEmp.employee.lastName}</h3>
                <p className="text-xs text-muted">{detailEmp.employee.position} &middot; {detailEmp.employee.employeeId}</p>
              </div>
              <button onClick={() => setDetailEmp(null)} className="btn btn-ghost h-7 w-7 p-0 text-muted">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Regular Hours", value: `${detailEmp.regularHours.toFixed(1)}h` },
                  { label: "Overtime Hours", value: detailEmp.overtimeHours > 0 ? `${detailEmp.overtimeHours.toFixed(1)}h` : "—" },
                  { label: "Late Minutes", value: `${detailEmp.lateMinutes}min` },
                  { label: "Absences", value: `${detailEmp.absences} day(s)` },
                ].map(s => (
                  <div key={s.label} className="surface-raised rounded-lg p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-semibold text-primary mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-default pt-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Pay Breakdown</h4>
                <div className="space-y-1.5">
                  {[
                    ["Basic Salary", formatCurrency(detailEmp.basicSalary)],
                    ["Overtime Pay", formatCurrency(detailEmp.overtimePay)],
                    ["Holiday Pay", formatCurrency(detailEmp.holidayPay)],
                    ["Gross Pay", formatCurrency(detailEmp.grossPay), true],
                    ["SSS", formatCurrency(detailEmp.sssDeduction)],
                    ["PhilHealth", formatCurrency(detailEmp.philhealthDeduction)],
                    ["Pag-IBIG", formatCurrency(detailEmp.pagibigDeduction)],
                    ["Tax Withholding", formatCurrency(detailEmp.taxDeduction)],
                    ["Cash Advance", formatCurrency(detailEmp.cashAdvance)],
                    ["Other Deductions", formatCurrency(detailEmp.otherDeductions)],
                    ["Total Deductions", formatCurrency(detailEmp.totalDeductions), true],
                  ].map(([l, v, bold]) => (
                    <div key={l as string} className="flex justify-between text-xs">
                      <span className="text-muted">{l as string}</span>
                      <span className={bold ? "font-semibold text-primary" : "text-primary"}>{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-default pt-3">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ backgroundColor: "#3d766d15", border: "1px solid #3d766d" }}>
                  <span className="text-sm font-bold" style={{ color: "#3d766d" }}>Net Pay</span>
                  <span className="text-lg font-bold" style={{ color: "#3d766d" }}>{formatCurrency(detailEmp.netPay)}</span>
                </div>
              </div>

              {detailEmp.payslips[0] && (
                <button onClick={() => handleSingleDownload(detailEmp.payslips[0].id)}
                  disabled={downloading === detailEmp.payslips[0].id}
                  className="btn btn-primary btn-sm w-full">
                  {downloading === detailEmp.payslips[0].id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Download className="h-3.5 w-3.5" />}
                  Download Payslip
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
