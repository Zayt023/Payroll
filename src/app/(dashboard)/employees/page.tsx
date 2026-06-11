"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, ChevronRight, Download, Users, UserCheck, Building2, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Employee {
  id: string; employeeId: string; firstName: string; lastName: string
  email: string; department: string; position: string; status: string; basicSalary: number; salaryType: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [page, setPage] = useState(0)
  const perPage = 10

  useEffect(() => {
    fetch("/api/employees").then(async r => {
      try { const d = await r.json(); setEmployees(d) } catch { setEmployees([]) }
    }).finally(() => setLoading(false))
  }, [])

  const filtered = employees.filter((e) => {
    const ms = [e.firstName, e.lastName, e.employeeId, e.department, e.email].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return ms && (filter === "All" || e.status === filter)
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice(page * perPage, (page + 1) * perPage)

  const activeCount = employees.filter(e => e.status === "Active").length
  const deptCount = [...new Set(employees.map(e => e.department))].length
  const avgSalary = employees.length ? Math.round(employees.reduce((s, e) => s + e.basicSalary, 0) / employees.length) : 0

  useEffect(() => { setPage(0) }, [search, filter])

  return (
    <div className="space-y-5">

      <div className="page-header flex items-start justify-between">
        <div>
          <h1>Employees</h1>
          <p>Manage your workforce directory.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="btn btn-secondary btn-sm"><Download className="h-3.5 w-3.5" /> Export</button>
          <Link href="/employees/new"><button className="btn btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Add Employee</button></Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: employees.length.toLocaleString(), icon: Users, sub: `${activeCount} active` },
          { label: "Active", value: activeCount.toLocaleString(), icon: UserCheck, sub: `${((activeCount / (employees.length || 1)) * 100).toFixed(0)}% of total` },
          { label: "Departments", value: deptCount, icon: Building2, sub: `${employees.length} employees` },
          { label: "Avg. Salary", value: formatCurrency(avgSalary), icon: Wallet, sub: "Across all roles" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-secondary" />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-trend"><span className="text-secondary">{kpi.sub}</span></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 surface-raised border border-default rounded-md p-0.5">
          {["All", "Active", "On Leave"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer border transition-all ${filter === f ? "surface-base text-primary border-default" : "text-secondary hover:text-primary border-transparent"}`}
            >{f}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input className="input" style={{ paddingLeft: "36px" }} placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-muted ml-auto">{filtered.length} of {employees.length}</span>
      </div>

      <div className="section-card overflow-hidden">
        <div className="table-wrap">
          <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Employee</th>
                  <th style={{ minWidth: 110, textAlign: "center" }}>Department</th>
                  <th style={{ minWidth: 120, textAlign: "center" }}>Position</th>
                  <th style={{ minWidth: 100, textAlign: "center" }}>Salary Type</th>
                  <th style={{ minWidth: 110, textAlign: "center" }}>Salary</th>
                  <th style={{ minWidth: 90, textAlign: "center" }}>Status</th>
                  <th style={{ width: 36 }} />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="p-4"><div className="skeleton h-10" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-secondary" />
                        </div>
                        <h3 className="text-sm font-semibold text-primary mb-1">No employees found</h3>
                        <p className="text-xs text-muted mb-4">Add your first team member to get started.</p>
                        <Link href="/employees/new"><button className="btn btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Add Employee</button></Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((emp) => (
                    <tr key={emp.id} className="group cursor-pointer" onClick={() => router.push(`/employees/${emp.id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full surface-raised flex items-center justify-center text-[11px] font-bold shrink-0 text-secondary">
                            <span>{emp.firstName[0]}{emp.lastName[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-muted">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center"><span className="badge badge-neutral">{emp.department}</span></td>
                      <td className="text-center text-sm text-secondary">{emp.position}</td>
                      <td className="text-center"><span className="badge badge-neutral">{emp.salaryType || "Monthly"}</span></td>
                      <td className="text-center text-sm font-semibold text-primary tabular-nums">{formatCurrency(emp.basicSalary)}</td>
                      <td className="text-center">
                        <span className={`badge ${emp.status === "Active" ? "badge-success" : "badge-neutral"}`}>{emp.status}</span>
                      </td>
                      <td className="text-center"><ChevronRight className="h-4 w-4 text-muted mx-auto" /></td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-ghost btn-sm h-7 px-2 text-xs">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="h-7 min-w-[28px] px-1 rounded text-xs font-medium cursor-pointer transition-all"
                style={{ background: i === page ? "#3d766d" : "transparent", color: i === page ? "#fff" : "var(--text-secondary)" }}
              >{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn btn-ghost btn-sm h-7 px-2 text-xs">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
