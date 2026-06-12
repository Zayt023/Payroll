"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Clock, Save, Loader2, Play, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select } from "@/components/ui/select"

interface Employee {
  id: string; firstName: string; lastName: string; department: string; employeeId: string; basicSalary: number
}

interface Client {
  id: string; name: string; code: string
}

interface Entry {
  id?: string; employeeId: string; date: string; hours: number; breakMinutes: number; overtime: number; lateMinutes: number; status: string; remarks?: string; clientHours: Record<string, number>
}

function getWeekDates(year: number, month: number, weekIndex: number) {
  const firstDay = new Date(year, month, 1)
  const dayOfWeek = firstDay.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(year, month, 1 + mondayOffset + weekIndex * 7)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

function getWeeksInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const dayOfWeek = firstDay.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const firstMonday = new Date(year, month, 1 + mondayOffset)
  const diff = Math.ceil((lastDay.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(diff, 1)
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function TimesheetPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [activeTab, setActiveTab] = useState<number | "summary">(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<Record<string, Entry>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [clientModal, setClientModal] = useState<{ empId: string; date: string } | null>(null)
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const tableWrapRef = useRef<HTMLDivElement>(null)

  const weeksInMonth = getWeeksInMonth(year, month)
  const weeks = Array.from({ length: weeksInMonth }, (_, i) => getWeekDates(year, month, i))
  const tabs = weeks.map((_, i) => `Week ${i + 1}`).concat("Summary")
  const tabCount = tabs.length

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const ms = new Date(year, month, 1).toISOString().split("T")[0]
      const me = new Date(year, month + 1, 0).toISOString().split("T")[0]
      const res = await fetch(`/api/timesheet?start=${ms}&end=${me}`)
      const data = await res.json()
      setEmployees(data.employees || [])
      setClients(data.clients || [])
      const map: Record<string, Entry> = {}
      if (data.records) {
        for (const [empId, recs] of Object.entries(data.records)) {
          for (const r of recs as any[]) {
            const key = `${empId}_${r.date.split("T")[0]}`
            const ch: Record<string, number> = {}
            if (r.clientHours) for (const c of r.clientHours) ch[c.clientId] = c.hours
            map[key] = {
              id: r.id, employeeId: empId, date: r.date.split("T")[0],
              hours: r.totalHours || 0, breakMinutes: r.breakMinutes || 0,
              overtime: r.overtime || 0, lateMinutes: r.lateMinutes || 0,
              status: r.status || "Present", remarks: r.remarks || "",
              clientHours: ch,
            }
          }
        }
      }
      setEntries(map)
    } catch { setEmployees([]) }
    finally { setLoading(false) }
  }, [year, month])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (activeTab !== "summary" && activeTab >= weeksInMonth) {
      setActiveTab(Math.max(0, weeksInMonth - 1))
    }
  }, [weeksInMonth, activeTab])

  function updateEntry(empId: string, date: string, value: number) {
    const key = `${empId}_${date}`
    const prev = entries[key] || { employeeId: empId, date, hours: 0, breakMinutes: 60, overtime: 0, lateMinutes: 0, status: "Present", remarks: "", clientHours: {} }
    setEntries({ ...entries, [key]: { ...prev, hours: value, overtime: Math.max(0, value - 8) } })
  }

  function updateClientHour(empId: string, date: string, clientId: string, hours: number) {
    const key = `${empId}_${date}`
    const prev = entries[key] || { employeeId: empId, date, hours: 0, breakMinutes: 60, overtime: 0, lateMinutes: 0, status: "Present", remarks: "", clientHours: {} }
    setEntries({ ...entries, [key]: { ...prev, clientHours: { ...prev.clientHours, [clientId]: hours } } })
  }

  async function autoSave(empId: string, date: string) {
    const key = `${empId}_${date}`
    const entry = entries[key]
    if (!entry || !entry.hours) return
    const ch = Object.entries(entry.clientHours).filter(([, h]) => h > 0).map(([c, h]) => ({ clientId: c, hours: h }))
    try {
      await fetch("/api/timesheet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: [{ id: entry.id || undefined, employeeId: empId, date, hours: entry.hours, breakMinutes: entry.breakMinutes || 0, status: entry.status || "Present", remarks: entry.remarks || "", clientHours: ch.length > 0 ? ch : undefined }] }),
      })
      setEntries(prev => ({ ...prev, [key]: { ...prev[key], id: key } }))
    } catch {}
  }

  function getMonthLabel() { return `${MONTHS[month]} ${year}` }

  function changeMonth(d: number) {
    const nm = month + d
    if (nm < 0) { setYear(y => y - 1); setMonth(11) }
    else if (nm > 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(nm)
  }

  function goToToday() {
    const n = new Date()
    const targetYear = n.getFullYear()
    const targetMonth = n.getMonth()
    const dayOfMonth = n.getDate()
    const firstDay = new Date(targetYear, targetMonth, 1)
    const dow = firstDay.getDay()
    const mondayOff = dow === 0 ? -6 : 1 - dow
    const weekIndex = Math.max(0, Math.floor((dayOfMonth - 1 - mondayOff) / 7))
    setYear(targetYear)
    setMonth(targetMonth)
    setActiveTab(weekIndex)
    requestAnimationFrame(() => {
      const todayStr = n.toISOString().split("T")[0]
      document.querySelector(`[data-date="${todayStr}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    })
  }
  async function handleSave() {
    setSaving(true)
    try {
      const ms = new Date(year, month, 1).toISOString().split("T")[0]
      const me = new Date(year, month + 1, 0).toISOString().split("T")[0]
      const p = Object.values(entries).filter(e => e.date >= ms && e.date <= me && e.hours > 0).map(e => ({
        id: e.id || undefined, employeeId: e.employeeId, date: e.date,
        hours: e.hours, breakMinutes: e.breakMinutes || 0,
        status: e.status || "Present", remarks: e.remarks || "",
        clientHours: Object.entries(e.clientHours).filter(([, h]) => h > 0).map(([c, h]) => ({ clientId: c, hours: h })),
      }))
      if (!p.length) { toast.error("No entries"); return }
      const res = await fetch("/api/timesheet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries: p }) })
      if (!res.ok) throw new Error("Save failed")
      toast.success("Saved"); fetchData()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleProcessMonth() {
    setProcessing(true)
    try {
      const ms = new Date(year, month, 1).toISOString().split("T")[0]
      const me = new Date(year, month + 1, 0).toISOString().split("T")[0]
      const res = await fetch("/api/timesheet/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ periodStart: ms, periodEnd: me }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Failed")
      toast.success(`Payroll processed: ${d.message}`)
      router.push(`/payroll/${d.batchId}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setProcessing(false) }
  }

  const hasEntries = Object.values(entries).some(e => weeks.some(w => w.includes(e.date)) && e.hours > 0)
  const modelKey = clientModal ? `${clientModal.empId}_${clientModal.date}` : null
  const modalEntry = modelKey ? entries[modelKey] : null

  const sortedEmployees = [...employees].sort((a, b) => {
    const sa = empSummary(a.id), sb = empSummary(b.id)
    switch (sortBy) {
      case "name-asc": return a.firstName.localeCompare(b.firstName)
      case "name-desc": return b.firstName.localeCompare(a.firstName)
      case "hours-desc": return sb.h - sa.h
      case "hours-asc": return sa.h - sb.h
      case "days-desc": return sb.days - sa.days
      case "ot-desc": return sb.ot - sa.ot
      case "salary-desc": return b.basicSalary - a.basicSalary
      case "billable-desc": return sb.bill - sa.bill
      default: return 0
    }
  })

  function empSummary(id: string) {
    let h = 0, ot = 0, brk = 0, bill = 0, days = 0
    for (const e of Object.values(entries)) {
      if (e.employeeId !== id) continue
      if (e.hours > 0) { h += e.hours; ot += Math.max(0, e.hours - 8); brk += e.breakMinutes || 0; days++ }
      bill += Object.values(e.clientHours).reduce((s, v) => s + v, 0)
    }
    return { h: Math.round(h * 10) / 10, ot: Math.round(ot * 10) / 10, brk, bill: Math.round(bill * 10) / 10, days }
  }

  function grandTotal() {
    let h = 0, ot = 0, brk = 0, bill = 0, days = 0
    for (const e of employees) { const s = empSummary(e.id); h += s.h; ot += s.ot; brk += s.brk; bill += s.bill; days += s.days }
    return { h: Math.round(h * 10) / 10, ot: Math.round(ot * 10) / 10, brk, bill: Math.round(bill * 10) / 10, days }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1>Timesheet</h1>
          <p className="text-sm text-secondary">{getMonthLabel()} — Enter hours per day. Auto-saves on blur.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving || !hasEntries} className="btn btn-secondary btn-sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
          </button>
          <button onClick={handleProcessMonth} disabled={processing} className="btn btn-primary btn-sm">
            {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Process Payroll
          </button>
        </div>
      </div>

      {/* Month nav + Tabs */}
      <div className="section-card">
        <div className="section-card-body flex items-center gap-3 pb-3 border-b border-default">
          <button onClick={() => changeMonth(-1)} className="btn btn-ghost h-7 w-7 p-0"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <span className="text-sm font-semibold text-primary min-w-[160px] text-center">{getMonthLabel()}</span>
          <button onClick={() => changeMonth(1)} className="btn btn-ghost h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></button>
          <button onClick={goToToday} className="btn btn-ghost text-xs h-7 px-2">Today</button>
        </div>
        <div className="flex gap-1 px-4 pt-3 pb-3 overflow-x-auto">
          {tabs.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i === tabCount - 1 ? "summary" : i)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeTab === (i === tabCount - 1 ? "summary" : i)
                  ? "text-white font-semibold" : "text-secondary hover:surface-raised"
              }`}
              style={activeTab === (i === tabCount - 1 ? "summary" : i) ? { background: "#3d766d" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Week Table */}
      {activeTab !== "summary" && (
        <div className="section-card overflow-hidden">
          <div className="table-wrap">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
              </div>
            ) : employees.length === 0 ? (
              <div className="empty-state py-10">
                <Clock className="h-8 w-8 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">No employees found. Add employees first.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 140, width: 140, position: "sticky", left: 0, zIndex: 2, background: "var(--surface-card)" }}>Employee</th>
                    {weeks[activeTab].map((d, i) => {
                      const dt = new Date(d + "T00:00:00")
                      const isWE = dt.getDay() === 0 || dt.getDay() === 6
                      const isOff = dt.getMonth() !== month
                      return (
                        <th key={d} style={{ minWidth: 48, width: 48, padding: "4px 2px", textAlign: "center", opacity: isOff ? 0.55 : 1 }}>
                          <div className="text-[10px] font-medium text-secondary">{DAYS[i]}</div>
                          <div className={`text-[9px] ${isWE ? "text-muted" : isOff ? "text-tertiary" : "text-tertiary"}`}>{dt.getDate()}</div>
                          {isOff && <div className="text-[8px] text-muted leading-tight">{MONTHS[dt.getMonth()].slice(0, 3)}</div>}
                        </th>
                      )
                    })}
                    <th style={{ minWidth: 52, width: 52, position: "sticky", right: 0, zIndex: 2, backgroundColor: "var(--surface-card)", textAlign: "center", fontSize: 10, color: "var(--text-muted)" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const wd = weeks[activeTab]
                    const wkHrs = wd.reduce((s, d) => s + (entries[`${emp.id}_${d}`]?.hours || 0), 0)
                    return (
                      <tr key={emp.id}>
                        <td style={{ position: "sticky", left: 0, zIndex: 1, background: "var(--surface-card)" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full surface-raised flex items-center justify-center text-[9px] font-bold text-secondary shrink-0">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span className="text-xs font-medium text-primary truncate">{emp.firstName}</span>
                          </div>
                        </td>
                        {wd.map(d => {
                          const e = entries[`${emp.id}_${d}`]
                          const hrs = e?.hours || 0
                          const isOT = hrs > 8
                          const dt = new Date(d + "T00:00:00")
                          const isWE = dt.getDay() === 0 || dt.getDay() === 6
                          const isTD = d === new Date().toISOString().split("T")[0]
                          const isOff = dt.getMonth() !== month
                          const hasClientHours = hrs > 0 && clients.length > 0
                          const billableTotal = Object.values(e?.clientHours || {}).reduce((s, v) => s + v, 0)
                          return (
                            <td key={d} data-date={d} className="p-0 relative" style={{ background: isTD ? "var(--surface-raised)" : isWE ? "var(--surface-sunken)" : isOff ? "var(--surface-sunken)" : undefined, opacity: isOff ? 0.65 : 1 }}>
                              {isOff && <div className="absolute top-0 left-0 text-[8px] text-muted leading-none px-0.5" style={{ opacity: 0.6 }}>{MONTHS[dt.getMonth()].slice(0, 3)}</div>}
                              <input type="number" min="0" step="0.5" disabled={isOff}
                                className="input h-8 text-xs px-0.5 py-0 w-full text-center border-0 rounded-none"
                                value={hrs || ""} placeholder={isOff ? "—" : "—"}
                                style={{ color: isOT ? "#3d766d" : undefined, fontWeight: hrs > 0 ? 600 : 400, background: "transparent", cursor: isOff ? "not-allowed" : undefined, borderBottom: hasClientHours ? "1.5px solid #3d766d44" : undefined }}
                                onChange={e => updateEntry(emp.id, d, parseFloat(e.target.value) || 0)}
                                onBlur={() => autoSave(emp.id, d)}
                                onDoubleClick={() => hasClientHours && setClientModal({ empId: emp.id, date: d })} />
                            </td>
                          )
                        })}
                        <td className="text-center text-xs font-semibold text-primary" style={{ position: "sticky", right: 0, zIndex: 1, background: "var(--surface-card)" }}>
                          {wkHrs > 0 ? `${wkHrs.toFixed(1)}` : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "summary" && employees.length > 0 && (
        <div className="section-card">
          <div className="section-card-header flex items-center justify-between">
            <h2>Monthly Summary</h2>
            <Select value={sortBy} onChange={setSortBy} className="h-7 text-xs w-auto" options={[
              { value: "name-asc", label: "Name A–Z" },
              { value: "name-desc", label: "Name Z–A" },
              { value: "hours-desc", label: "Most Hours" },
              { value: "hours-asc", label: "Least Hours" },
              { value: "days-desc", label: "Most Days" },
              { value: "ot-desc", label: "Most OT" },
              { value: "salary-desc", label: "Highest Basic Pay" },
              { value: "billable-desc", label: "Most Billable" },
            ]} />
          </div>
          <div className="section-card-body p-0">
            <div className="table-wrap">
              <table className="table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th style={{ textAlign: "center" }}>Days</th>
                    <th style={{ textAlign: "center" }}>Hours</th>
                    <th style={{ textAlign: "center" }}>OT</th>
                    <th style={{ textAlign: "center" }}>Avg Break</th>
                    <th style={{ textAlign: "center" }}>Billable</th>
                    <th style={{ textAlign: "center" }}>Non-Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEmployees.map(emp => {
                    const s = empSummary(emp.id)
                    const nb = Math.max(0, Math.round((s.h - s.bill) * 10) / 10)
                    return (
                      <tr key={emp.id}>
                        <td className="text-sm font-medium text-primary">{emp.firstName} {emp.lastName}</td>
                        <td className="text-center text-sm">{s.days}</td>
                        <td className="text-center text-sm font-semibold">{s.h}h</td>
                        <td className="text-center text-sm" style={{ color: "#3d766d" }}>{s.ot > 0 ? `${s.ot}h` : "—"}</td>
                        <td className="text-center text-sm text-muted">{s.days > 0 ? `${Math.round(s.brk / s.days)}m` : "—"}</td>
                        <td className="text-center text-sm">{s.bill > 0 ? `${s.bill}h` : "—"}</td>
                        <td className="text-center text-sm">{nb > 0 ? `${nb}h` : "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
                {(() => { const g = grandTotal(); const nb = Math.max(0, Math.round((g.h - g.bill) * 10) / 10)
                  return (
                    <tfoot>
                      <tr>
                        <td className="font-bold text-primary">TOTAL</td>
                        <td className="text-center font-bold">{g.days}</td>
                        <td className="text-center font-bold">{g.h}h</td>
                        <td className="text-center font-bold" style={{ color: "#3d766d" }}>{g.ot > 0 ? `${g.ot}h` : "—"}</td>
                        <td className="text-center text-muted">{g.days > 0 ? `${Math.round(g.brk / g.days)}m` : "—"}</td>
                        <td className="text-center font-bold">{g.bill > 0 ? `${g.bill}h` : "—"}</td>
                        <td className="text-center font-bold">{nb > 0 ? `${nb}h` : "—"}</td>
                      </tr>
                    </tfoot>
                  )})()}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {clientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setClientModal(null)}>
          <div className="surface-base border border-default rounded-xl shadow-lg p-5 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-primary">Billable Hours</h3>
              <button onClick={() => setClientModal(null)} className="btn btn-ghost h-7 w-7 p-0"><X className="h-3.5 w-3.5" /></button>
            </div>
            {clientModal.date ? (
              <p className="text-xs text-muted mb-4">
                {employees.find(e => e.id === clientModal.empId)?.firstName} &mdash; {clientModal.date}
              </p>
            ) : null}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clients.map(cl => {
                const val = modalEntry?.clientHours[cl.id] || 0
                return (
                  <div key={cl.id} className="flex items-center gap-3">
                    <span className="text-xs text-primary font-medium min-w-[60px] shrink-0">{cl.code}</span>
                    <div className="flex items-center gap-1 flex-1">
                      <input type="number" min="0" step="0.25" className="input h-8 text-sm w-full min-w-0"
                        value={val}
                        onChange={e => updateClientHour(clientModal.empId, clientModal.date, cl.id, parseFloat(e.target.value) || 0)} />
                      <span className="text-[11px] text-muted w-7 shrink-0 text-center">hrs</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
