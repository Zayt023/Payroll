"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, DollarSign, Plus, TrendingUp, CheckCircle, Clock, Loader2, Calendar } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { toast } from "sonner"

interface Batch {
  id: string; batchName: string; periodStart: string; periodEnd: string
  status: string; totalEmployees: number; totalNetPay: number; fileName: string
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    COMPLETED: { cls: "badge-success", label: "Completed" },
    DRAFT: { cls: "badge-warning", label: "Draft" },
    PROCESSING: { cls: "badge-info", label: "Processing" },
  }
  const s = map[status] || { cls: "badge-neutral", label: status }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export default function PayrollPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickLoading, setQuickLoading] = useState(false)
  const [quickStart, setQuickStart] = useState("")
  const [quickEnd, setQuickEnd] = useState("")

  useEffect(() => {
    fetch("/api/payroll").then(async r => {
      try { const d = await r.json(); setBatches(d) } catch { setBatches([]) }
    }).finally(() => setLoading(false))
  }, [])

  const completed = batches.filter(b => b.status === "COMPLETED").length
  const pending = batches.filter(b => b.status === "DRAFT" || b.status === "PROCESSING").length
  const totalDisbursed = batches.reduce((s, b) => s + b.totalNetPay, 0)

  async function handleQuickGenerate() {
    if (!quickStart || !quickEnd) { toast.error("Select a period"); return }
    setQuickLoading(true)
    try {
      const res = await fetch("/api/payroll/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodStart: quickStart, periodEnd: quickEnd }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      const data = await res.json()
      toast.success(`${data.records} payslip(s) generated`)
      setQuickOpen(false)
      router.push(`/payroll/${data.batch.id}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setQuickLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Payroll Batches</h1>
          <p>Manage payroll cycles or generate payslips instantly.</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setQuickOpen(true)} className="btn btn-primary btn-sm"><Calendar className="h-3.5 w-3.5" /> Quick Generate</button>
        </div>
      </div>

      {quickOpen && (
        <div className="section-card" style={{ borderColor: "#3d766d" }}>
          <div className="section-card-body">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-primary">Quick Payslip Generation</h3>
                <p className="text-xs text-muted mt-0.5">Select a period to generate payslips for all employees instantly — no file upload needed.</p>
              </div>
              <button onClick={() => setQuickOpen(false)} className="btn btn-ghost btn-sm text-xs text-muted">Cancel</button>
            </div>
            <div className="flex items-end gap-3">
              <div className="form-group">
                <label>Period Start</label>
                <DatePicker className="w-44" value={quickStart} onChange={setQuickStart} />
              </div>
              <div className="form-group">
                <label>Period End</label>
                <DatePicker className="w-44" value={quickEnd} onChange={setQuickEnd} />
              </div>
              <button onClick={handleQuickGenerate} disabled={quickLoading || !quickStart || !quickEnd} className="btn btn-primary btn-md">
                {quickLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                {quickLoading ? "Generating..." : "Generate Payslips"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Batches", value: batches.length.toLocaleString(), icon: TrendingUp, sub: `${completed} completed` },
          { label: "Pending Review", value: pending, icon: Clock, sub: `${batches.length > 0 ? ((pending / batches.length) * 100).toFixed(0) : 0}% of total` },
          { label: "Total Disbursed", value: formatCurrency(totalDisbursed), icon: DollarSign, sub: "Across all batches" },
          { label: "Completed", value: completed, icon: CheckCircle, sub: `${batches.length > 0 ? ((completed / batches.length) * 100).toFixed(0) : 0}% completion rate` },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-secondary" />
            </div>
            <div className="kpi-value" style={{ fontSize: "1.25rem" }}>{kpi.value}</div>
            <div className="kpi-trend"><span className="text-secondary">{kpi.sub}</span></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-[72px]" />)}
        </div>
      ) : batches.length === 0 && !quickOpen ? (
        <div className="section-card">
          <div className="section-card-body empty-state">
            <div className="w-14 h-14 rounded-xl surface-raised flex items-center justify-center mb-4">
              <DollarSign className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-base font-semibold text-primary mb-1">No payroll batches yet</h3>
            <p className="text-sm text-muted mb-1">Generate payslips instantly or upload a timesheet file.</p>
            <button onClick={() => setQuickOpen(true)} className="btn btn-primary btn-sm mt-2">Quick Generate</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {batches.map((b) => (
            <Link key={b.id} href={`/payroll/${b.id}`}>
              <div className="section-card p-4 flex items-center gap-5 group cursor-pointer hover:surface-raised transition-colors">
                <div className="w-10 h-10 rounded-xl surface-raised flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 items-center gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Batch</p>
                    <p className="text-sm font-medium text-primary">{b.batchName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Period</p>
                    <p className="text-sm text-secondary">{formatDateShort(b.periodStart)} — {formatDateShort(b.periodEnd)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Employees</p>
                    <p className="text-sm text-primary">{b.totalEmployees}</p>
                  </div>
                  <div className="justify-self-end flex items-center gap-3">
                    <span className="text-xs text-muted tabular-nums hidden md:inline">{formatCurrency(b.totalNetPay)}</span>
                    {statusBadge(b.status)}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
