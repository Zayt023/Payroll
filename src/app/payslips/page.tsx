"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Download, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Payslip {
  id: string; referenceNumber: string
  employee: { firstName: string; lastName: string; department: string }
  periodStart: string; periodEnd: string; downloadedAt: string | null
  payrollRecord: { netPay: number; grossPay: number; basicSalary: number } | null
  batch: { batchName: string; periodStart: string; periodEnd: string } | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadingMultiple, setDownloadingMultiple] = useState(false)
  const [filter, setFilter] = useState("All")

  useEffect(() => {
    fetch("/api/payslips").then(async r => {
      try { const d = await r.json(); setPayslips(d) } catch { setPayslips([]) }
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = payslips.filter((p) =>
      [p.employee.firstName, p.employee.lastName, p.referenceNumber, p.employee.department]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()))
    )
    if (filter === "New") list = list.filter(p => !p.downloadedAt)
    if (filter === "Downloaded") list = list.filter(p => p.downloadedAt)
    return list
  }, [payslips, search, filter])

  async function handleDownload(id: string) {
    setDownloading(id)
    try {
      const res = await fetch(`/api/payroll/payments/payslips/${id}`, { method: "POST" })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a"); a.href = url; a.download = `payslip-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success("Payslip downloaded")
    } catch (e: any) { toast.error(e.message) }
    finally { setDownloading(null) }
  }

  async function handleDownloadSelected() {
    if (selected.size === 0) return
    setDownloadingMultiple(true)
    const ids = Array.from(selected)
    for (const id of ids) {
      try {
        const res = await fetch(`/api/payroll/payments/payslips/${id}`, { method: "POST" })
        if (!res.ok) continue
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a"); a.href = url; a.download = `payslip-${id}.pdf`; a.click()
        URL.revokeObjectURL(url)
      } catch {}
    }
    toast.success(`${ids.length} payslip(s) downloaded`)
    setDownloadingMultiple(false)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  const newCount = payslips.filter(p => !p.downloadedAt).length
  const downloadedCount = payslips.filter(p => p.downloadedAt).length
  const downloadPct = payslips.length ? Math.round((downloadedCount / payslips.length) * 100) : 0
  const totalNetPay = payslips.reduce((s, p) => s + (p.payrollRecord?.netPay ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1>Payslips</h1>
        <p>Review and download payslips for all cycles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Payslips", value: payslips.length },
          { label: "New", value: newCount, sub: `${downloadedCount} Downloaded` },
          { label: "Download Rate", value: `${downloadPct}%`, bar: downloadPct },
          { label: "Total Net Pay", value: payslips.length ? formatCurrency(totalNetPay) : "—" },
        ].map((s) => (
          <div key={s.label} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{s.label}</span>
            </div>
            <div className="kpi-value" style={{ fontSize: "1.25rem" }}>{s.value}</div>
            {s.sub && <div className="kpi-trend"><span className="text-secondary">{s.sub}</span></div>}
            {s.bar !== undefined && (
              <div className="mt-3 w-full h-1 surface-raised rounded-full overflow-hidden">
                <div className="h-full rounded-full animate-progress-fill" style={{ width: `${s.bar}%`, background: "#3d766d" }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 surface-raised border border-default rounded-md p-0.5">
          {["All", "New", "Downloaded"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer border transition-all ${filter === f ? "surface-base text-primary border-default" : "text-secondary hover:text-primary border-transparent"}`}
            >{f}</button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input className="input w-full" style={{ paddingLeft: "36px" }} placeholder="Search employee or payslip ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="section-card overflow-hidden">
        <div className="px-4 py-3 border-b border-default flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-default"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={() => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(p => p.id))) }}
              />
              Select All
            </label>
            <span className="text-muted">|</span>
            <span className="text-xs text-muted">{filtered.length} of {payslips.length} payslips</span>
          </div>
          {selected.size > 0 && (
            <button onClick={handleDownloadSelected} disabled={downloadingMultiple} className="btn btn-primary btn-sm">
              {downloadingMultiple ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download ({selected.size})
            </button>
          )}
        </div>
        <div className="table-wrap">
            <table className="table">
            <thead>
              <tr>
                <th style={{ width: 44, textAlign: "center" }}></th>
                <th style={{ minWidth: 180 }}>Employee</th>
                <th style={{ minWidth: 130, textAlign: "center" }}>Ref No.</th>
                <th style={{ minWidth: 100, textAlign: "center" }}>Status</th>
                <th style={{ minWidth: 110, textAlign: "center" }}>Net Pay</th>
                <th style={{ width: 50, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><div className="skeleton h-10" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="text-sm font-semibold text-primary mb-1">No payslips found</h3>
                    <p className="text-xs text-muted">Payslips appear once payroll batches are processed.</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="text-center"><input type="checkbox" className="w-4 h-4 rounded border-default" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full surface-raised flex items-center justify-center text-[10px] font-bold shrink-0 text-secondary">
                          {p.employee.firstName[0]}{p.employee.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">{p.employee.firstName} {p.employee.lastName}</p>
                          <p className="text-[11px] text-muted">{p.employee.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center text-sm font-mono text-muted">{p.referenceNumber}</td>
                    <td className="text-center">
                      <span className={`badge ${p.downloadedAt ? "badge-success" : "badge-warning"}`}>
                        {p.downloadedAt ? "Downloaded" : "New"}
                      </span>
                    </td>
                    <td className="text-center text-sm font-semibold text-primary">{p.payrollRecord ? formatCurrency(p.payrollRecord.netPay) : "—"}</td>
                    <td className="text-center">
                      <button onClick={() => handleDownload(p.id)} disabled={downloading === p.id}
                        className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-[var(--surface-raised)] text-[var(--text-muted)] cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                      >
                        {downloading === p.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Download className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
