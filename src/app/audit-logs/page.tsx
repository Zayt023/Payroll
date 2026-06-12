"use client"

import { useEffect, useState } from "react"
import { History, Search, Download, Filter, ChevronLeft, ChevronRight, Clock, User, FileText, Settings, LogIn, DollarSign } from "lucide-react"
import { Select } from "@/components/ui"

interface AuditLog {
  id: string; action: string; entity: string; entityId: string
  details: string | null; performedById: string | null
  performedBy: { firstName: string; lastName: string } | null
  createdAt: string
}

const actionIcons: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="h-3.5 w-3.5 text-primary" />,
  CREATE: <FileText className="h-3.5 w-3.5 text-secondary" />,
  UPDATE: <Settings className="h-3.5 w-3.5 text-secondary" />,
  DELETE: <History className="h-3.5 w-3.5 text-secondary" />,
  PAYROLL_PROCESS: <DollarSign className="h-3.5 w-3.5 text-secondary" />,
}

const actionColors: Record<string, string> = {
  LOGIN: "#3d766d", CREATE: "#3d766d", UPDATE: "#3d766d",
  DELETE: "#8f9192", PAYROLL_PROCESS: "#3d766d",
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("")

  useEffect(() => {
    fetch("/api/audit-logs").then(async r => {
      try { setLogs(await r.json()) } catch { setLogs([]) }
    }).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    const name = l.performedBy ? `${l.performedBy.firstName} ${l.performedBy.lastName}`.toLowerCase() : ""
    const matchSearch = !search || name.includes(q) || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q)
    const matchAction = !actionFilter || l.action === actionFilter
    return matchSearch && matchAction
  })

  const actions = [...new Set(logs.map((l) => l.action))].sort()

  function exportCSV() {
    const rows = [["Action", "Entity", "Details", "Performed By", "Date"]]
    filtered.forEach((l) => {
      rows.push([l.action, l.entity, l.details || "", l.performedBy ? `${l.performedBy.firstName} ${l.performedBy.lastName}` : "System", new Date(l.createdAt).toLocaleDateString()])
    })
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  function groupByDate(logs: AuditLog[]) {
    const groups: Record<string, AuditLog[]> = {}
    logs.forEach((l) => {
      const date = new Date(l.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      if (!groups[date]) groups[date] = []
      groups[date].push(l)
    })
    return groups
  }

  return (
    <div className="space-y-5">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Audit Logs</h1>
          <p>Track system activity and user actions.</p>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary btn-sm gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input className="input" style={{ paddingLeft: "36px" }} placeholder="Search users, actions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 w-44">
          <Filter className="h-3.5 w-3.5 text-muted shrink-0" />
          <Select value={actionFilter} onChange={setActionFilter} options={["", ...actions].map(a => ({ value: a, label: a ? a.replace(/_/g, " ") : "All Actions" }))} />
        </div>
        <span className="text-xs text-muted ml-auto">{filtered.length} events</span>
      </div>

      <div className="section-card overflow-hidden">
        <div className="px-4 py-3 border-b border-default flex justify-between items-center">
          <span className="text-xs font-medium text-secondary flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Event Timeline
          </span>
          <div className="flex gap-1">
            <button className="btn btn-ghost h-7 w-7"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button className="btn btn-ghost h-7 w-7"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="divide-y divide-default">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4"><div className="skeleton h-10" /></div>)
            : filtered.length === 0
            ? <div className="empty-state py-12">
                <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                  <History className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-sm font-semibold text-primary mb-1">No audit logs found</h3>
                <p className="text-xs text-muted">Try adjusting your search or filter.</p>
              </div>
            : Object.entries(groupByDate(filtered)).map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-2 surface-raised border-b border-default sticky top-0">
                    <span className="text-[11px] font-medium text-muted uppercase tracking-wider">{date}</span>
                  </div>
                  {items.map((log) => (
                    <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:surface-raised transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full surface-raised flex items-center justify-center shrink-0">
                          {actionIcons[log.action] || <History className="h-3.5 w-3.5 text-secondary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="badge" style={{ color: actionColors[log.action] || "var(--text-secondary)" }}>
                              {log.action.replace(/_/g, " ")}
                            </span>
                            <span className="text-sm text-primary font-medium">{log.entity}</span>
                            <span className="text-[11px] font-mono text-muted">#{log.entityId.slice(0, 8)}</span>
                          </div>
                          {log.details && <p className="text-xs text-muted mt-0.5">{log.details}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <User className="h-3 w-3" />
                          {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : "System"}
                        </div>
                        <span className="text-[11px] text-muted w-16 text-right tabular-nums">
                          {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
