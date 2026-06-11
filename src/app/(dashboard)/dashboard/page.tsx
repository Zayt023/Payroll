"use client"

import { useEffect, useState, useCallback } from "react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import {
  Users, Wallet, FileText, TrendingUp, Plus, RefreshCw, AlertCircle,
  ArrowUpRight, ArrowDownRight, Building2, Activity, MapPin, Calendar,
  Briefcase, Circle, Search, Mail, ChevronRight, DollarSign
} from "lucide-react"
import Link from "next/link"
import { CalendarWidget } from "@/components/ui/calendar-widget"
import { formatDateShort } from "@/lib/utils"

interface DashboardData {
  totalEmployees: number
  activeEmployees: number
  totalBatches: number
  pendingBatches: number
  totalPayslips: number
  monthlyPayroll: number
  previousMonthlyPayroll: number
  recentActivity: { id: string; user?: { name: string; email: string }; action: string; entity: string; details?: string; createdAt: string }[]
  departmentBreakdown: { department: string; count: number }[]
  payrollTrend: { month: string; actual: number; projected: number }[]
  overtimeTrend: { month: string; amount: number }[]
  recentBatches: {
    id: string; batchName: string; periodStart: string; periodEnd: string
    status: string; totalEmployees: number; totalGross: number; totalNetPay: number; totalDeductions: number; createdAt: string
  }[]
}

interface Employee {
  id: string; firstName: string; lastName: string; email: string
  department: string; position: string; status: string; avatar: string
}

function formatCurrency(n: number) {
  return "₱" + n.toLocaleString()
}

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (sec < 60) return "just now"
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

function pctChange(current: number, previous: number): { value: string; up: boolean } | null {
  if (!previous) return null
  const pct = ((current - previous) / previous) * 100
  return { value: `${Math.abs(pct).toFixed(1)}%`, up: pct >= 0 }
}

const CHART_COLOR = "#3d766d"

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="surface-base border border-default rounded-lg px-3 py-2 text-xs">
      <p className="text-secondary mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-primary font-medium tabular-nums">
          {p.name === "actual" ? "Actual" : "Projected"}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function TooltipContentOT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="surface-base border border-default rounded-lg px-3 py-2 text-xs">
      <p className="text-secondary mb-1">{label}</p>
      <p className="text-primary font-medium tabular-nums" style={{ color: "#e67e22" }}>OT Cost: {formatCurrency(payload[0].value)}</p>
    </div>
  )
}

const tabs = ["Overview", "Employees", "Payroll", "Reports"]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState("Overview")
  const [memberSearch, setMemberSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true); setError(false)
    try {
      const [dr, er] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/employees"),
      ])
      if (!dr.ok) { setError(true); return }
      setData(await dr.json())
      if (er.ok) setEmployees(await er.json())
    } catch { setError(true) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (error) return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-error text-error">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-primary">Unable to load dashboard</h2>
      <p className="text-sm text-secondary">Check your connection and try again.</p>
      <button onClick={fetchData} className="btn btn-primary btn-sm">
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </button>
    </div>
  )

  if (loading || !data) return (
    <div className="space-y-5">
      <div className="section-card h-24 rounded-xl surface-raised" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl surface-raised" />)}
      </div>
      <div className="h-10 w-96 rounded-md surface-raised" />
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 h-72 rounded-xl surface-raised" />
        <div className="h-72 rounded-xl surface-raised" />
      </div>
    </div>
  )

  const payrollPct = pctChange(data.monthlyPayroll, data.previousMonthlyPayroll)
  const deptBreakdown = data?.departmentBreakdown || []
  const recentActivity = data?.recentActivity || []
  const chartData = data?.payrollTrend || []

  const filteredMembers = employees.filter((e) =>
    [e.firstName, e.lastName, e.department, e.position].some((f) =>
      f?.toLowerCase().includes(memberSearch.toLowerCase())
    )
  )

  function entityIcon(entity: string) {
    switch (entity) {
      case "PayrollBatch": case "Payroll": return FileText
      case "Employee": return Users
      default: return Activity
    }
  }

  return (
    <div className="space-y-5">

      {/* SECTION 1: Workspace Header Card */}
      <div className="section-card">
        <div className="section-card-body flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#3d766d" }}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <h2 className="text-base font-semibold text-primary">A3MB Medical Billing Services</h2>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-xs text-secondary">
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted" /> Manila, Philippines</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-muted" /> Est. 2018</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3 text-muted" /> {data.totalEmployees} Employees</span>
                <span className="flex items-center gap-1.5"><Wallet className="h-3 w-3 text-muted" /> {data.totalBatches} Payroll Runs</span>
                <span className="flex items-center gap-1.5"><Circle className="h-3 w-3 text-muted" /> {deptBreakdown.length} Departments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Batches Banner */}
      {data.pendingBatches > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border" style={{ background: "#fff8e6", borderColor: "#e6c952" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#e6c95220" }}>
            <AlertCircle className="h-4 w-4" style={{ color: "#b8860b" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#6b5200" }}>
              {data.pendingBatches} pending payroll {data.pendingBatches === 1 ? "batch needs" : "batches need"} your attention
            </p>
            <p className="text-xs" style={{ color: "#8f7a30" }}>Review and complete them to finalize payslips</p>
          </div>
          <Link href="/payroll" className="btn btn-sm shrink-0" style={{ background: "#b8860b", color: "#fff", border: "none" }}>
            View Batches
          </Link>
        </div>
      )}

      {/* SECTION 2: KPI Summary Bar */}
      <div className="grid grid-cols-5 gap-4">
        {[
          {
            label: "Total Employees",
            value: data.totalEmployees.toLocaleString(),
            sub: `${data.activeEmployees} active`,
          },
          {
            label: "Monthly Payroll",
            value: formatCurrency(data.monthlyPayroll),
            trend: payrollPct,
            sub: "vs last month",
          },
          {
            label: "Payroll Runs",
            value: data.totalBatches.toLocaleString(),
            sub: data.pendingBatches > 0
              ? <><span className="font-medium" style={{ color: "#b8860b" }}>{data.pendingBatches} pending</span></>
              : "All completed",
          },
          {
            label: "Departments",
            value: deptBreakdown.length,
            sub: `${data.totalEmployees} employees`,
          },
          {
            label: "Payslips",
            value: data.totalPayslips.toLocaleString(),
            sub: "Generated this period",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-trend">
              {kpi.trend ? (
                <>
                  <span className={`font-medium flex items-center gap-0.5 ${kpi.trend.up ? "text-success" : "text-error"}`}>
                    {kpi.trend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend.value}
                  </span>
                  <span className="text-secondary">vs last month</span>
                </>
              ) : kpi.sub ? (
                <span className="text-secondary">{kpi.sub}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: Tab Navigation */}
      <div className="flex items-center border-b border-default">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === tab
                ? "border-[#3d766d] text-primary"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SECTION 4: Data Area */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-4 gap-5">
          {/* Left: Charts + Batches */}
          <div className="col-span-3 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5 shrink-0">
              <div className="section-card">
                <div className="section-card-header">
                  <div>
                    <h2>Payroll Trend</h2>
                    <p className="text-xs text-muted mt-0.5">Monthly expenditure</p>
                  </div>
                </div>
                <div className="section-card-body">
                  <div className="h-52">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted">No payroll data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.08} />
                            <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dy={6} />
                        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} dx={-4} />
                        <Tooltip content={<TooltipContent />} cursor={{ stroke: "var(--border-default)", strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="actual" stroke={CHART_COLOR} strokeWidth={2} fill="url(#actualGrad)" dot={{ r: 3, fill: CHART_COLOR, stroke: "var(--surface-base)", strokeWidth: 2 }} activeDot={{ r: 4.5, fill: CHART_COLOR, stroke: "var(--surface-base)", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <div>
                  <h2>Overtime Cost</h2>
                  <p className="text-xs text-muted mt-0.5">Monthly overtime pay over the last 6 months</p>
                </div>
              </div>
              <div className="section-card-body">
                <div className="h-52">
                  {data.overtimeTrend?.length === 0 || !data.overtimeTrend?.some(o => o.amount > 0) ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted">No overtime data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.overtimeTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dy={6} />
                        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} dx={-4} />
                        <Tooltip content={<TooltipContentOT />} cursor={{ fill: "var(--surface-sunken)" }} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} style={{ fill: "#e67e22" }} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="section-card flex-1 min-h-0 flex flex-col">
              <div className="section-card-header shrink-0">
                <div>
                  <h2>Recent Payroll Batches</h2>
                  <p className="text-xs text-muted mt-0.5">{data.recentBatches?.length || 0} latest batches</p>
                </div>
                <Link href="/payroll" className="btn btn-ghost btn-sm text-xs">View all</Link>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto flex-1">
                {!data.recentBatches || data.recentBatches.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No batches yet</p>
                ) : (
                  data.recentBatches.map((batch) => {
                    const statusColor = batch.status === "COMPLETED" ? "#3d766d" : batch.status === "DRAFT" ? "#b8860b" : "#8f9192"
                    return (
                      <Link
                        key={batch.id}
                        href={`/payroll/${batch.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:surface-raised transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md surface-raised flex items-center justify-center shrink-0">
                          <Wallet className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary truncate">{batch.batchName}</span>
                            <span className="text-[11px] py-0.5 px-1.5 rounded font-medium" style={{ background: `${statusColor}15`, color: statusColor }}>
                              {batch.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted">{formatDateShort(batch.periodStart)} &ndash; {formatDateShort(batch.periodEnd)}</span>
                            <span className="text-[11px] text-muted">&middot;</span>
                            <span className="text-[11px] text-muted">{batch.totalEmployees} employees</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>{formatCurrency(batch.totalNetPay)}</p>
                          <p className="text-[10px] text-muted">net pay</p>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Calendar + Recent Activity */}
          <div className="flex flex-col gap-5">
            <CalendarWidget />
            <div className="section-card flex-1 min-h-0 flex flex-col">
              <div className="section-card-header shrink-0">
                <div>
                  <h2>Recent Activity</h2>
                  <p className="text-xs text-muted mt-0.5">Latest events across the platform</p>
                </div>
                <Link href="/audit-logs" className="btn btn-ghost btn-sm text-xs">View all</Link>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto flex-1 max-h-none">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted text-center py-6">No recent activity</p>
                ) : (
                  recentActivity.slice(0, 10).map((act) => {
                    const Icon = entityIcon(act.entity)
                    return (
                      <div key={act.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-md surface-raised flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-primary truncate">{act.action}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-neutral">{act.entity}</span>
                            <span className="text-[11px] text-muted">{timeAgo(act.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Employees" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2>Departments</h2>
                <p className="text-xs text-muted mt-0.5">{deptBreakdown.length} departments &middot; {data.totalEmployees} employees</p>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {deptBreakdown.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No departments</p>
              ) : (
                deptBreakdown.map((d) => (
                  <div key={d.department} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-primary">{d.department}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full" style={{ width: Math.max(20, (d.count / Math.max(...deptBreakdown.map(x => x.count))) * 80), background: "#3d766d" }} />
                      <span className="text-sm font-medium tabular-nums" style={{ color: "#3d766d" }}>{d.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2>Status Overview</h2>
                <p className="text-xs text-muted mt-0.5">Employee distribution by status</p>
              </div>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {["Active", "On Leave", "Inactive", "Suspended", "Terminated"].map((s) => {
                const count = employees.filter((e) => e.status === s).length
                if (count === 0) return null
                return (
                  <div key={s} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s === "Active" ? "bg-[#3d766d]" : "bg-[#bdc2c7]"}`} />
                      <span className="text-sm text-primary">{s}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-secondary">{count}</span>
                  </div>
                )
              })}
              {employees.length === 0 && <p className="text-sm text-muted text-center py-8">No employees</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payroll" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Batches", value: data.totalBatches.toLocaleString(), sub: `${data.pendingBatches} pending` },
              { label: "This Month", value: formatCurrency(data.monthlyPayroll), sub: "Current period" },
              { label: "Payslips Generated", value: data.totalPayslips.toLocaleString(), sub: "All time" },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card">
                <div className="kpi-header"><span className="kpi-label">{kpi.label}</span></div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-trend"><span className="text-secondary">{kpi.sub}</span></div>
              </div>
            ))}
          </div>
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2>Quick Actions</h2>
                <p className="text-xs text-muted mt-0.5">Manage payroll runs</p>
              </div>
            </div>
            <div className="section-card-body flex gap-3">
              <Link href="/payroll" className="btn btn-primary btn-md">
                <Wallet className="h-4 w-4" /> View Payroll Runs
              </Link>
              <Link href="/payroll" className="btn btn-secondary btn-md">
                <Plus className="h-4 w-4" /> New Batch
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Reports" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FileText, label: "Audit Logs", desc: "Track all system actions and changes", href: "/audit-logs" },
              { icon: DollarSign, label: "Payroll Summary", desc: "View payroll batch details and payslips", href: "/payroll" },
              { icon: Users, label: "Employee Roster", desc: "Employee directory and profiles", href: "/employees" },
            ].map((r) => (
              <Link key={r.label} href={r.href} className="section-card hover:surface-raised transition-colors">
                <div className="section-card-body text-center py-8">
                  <r.icon className="h-7 w-7 text-secondary mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-primary mb-1">{r.label}</h3>
                  <p className="text-xs text-muted">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
