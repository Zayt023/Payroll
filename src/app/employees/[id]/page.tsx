"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Download, Edit2, CheckCircle, Copy, Shield, DollarSign, User, Save, X, Loader2,
  ChevronRight, MapPin, Briefcase, Calendar, Phone, Hash, Clock
} from "lucide-react"
import { DatePicker, Select } from "@/components/ui"
import Link from "next/link"
import { formatDate, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

const SALARY_TYPES = ["Monthly", "Semi-Monthly", "Bi-Weekly", "Weekly", "Daily", "Hourly"]

interface Employee {
  id: string; employeeId: string; firstName: string; lastName: string
  email: string; phone: string; department: string; position: string
  dateHired: string; address: string; status: string
  sssNumber: string; philhealthNumber: string; pagibigNumber: string; tinNumber: string
  basicSalary: number; dailyRate: number; hourlyRate: number; salaryType: string
  avatar: string; shiftStart: string; shiftEnd: string; payrollRecords: any[]; attendanceRecords: any[]
}

const tabs = ["Overview", "Compensation", "Government IDs", "Attendance", "Payroll History"]

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})
  const [activeTab, setActiveTab] = useState("Overview")
  const [showGen, setShowGen] = useState(false)
  const [genStart, setGenStart] = useState("")
  const [genEnd, setGenEnd] = useState("")
  const [genLoading, setGenLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/employees/${params.id}`).then(async r => {
      try { const d = await r.json(); setEmployee(d) } catch { setEmployee(null) }
    }).finally(() => setLoading(false))
  }, [params.id])

  function startEdit() {
    if (!employee) return
    setForm({ ...employee })
    setEditing(true)
  }

  function cancelEdit() { setEditing(false) }

  async function handleGeneratePayslip() {
    if (!genStart || !genEnd) { toast.error("Select a period"); return }
    setGenLoading(true)
    try {
      const res = await fetch("/api/payroll/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodStart: genStart, periodEnd: genEnd, employeeIds: [employee?.id] }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      const data = await res.json()
      toast.success(`Payslip generated`)
      setShowGen(false)
      router.push(`/payroll/${data.batch.id}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setGenLoading(false) }
  }

  const update = (field: string, value: any) => {
    setForm((prev: any) => {
      const next = { ...prev, [field]: value }
      if (field === "basicSalary" || field === "salaryType") {
        const sType = field === "salaryType" ? value : prev.salaryType
        const salary = field === "basicSalary" ? value : prev.basicSalary
        let d = sType === "Daily" || sType === "Hourly" ? salary / 22 : salary / 22
        const h = sType === "Hourly" ? (prev.hourlyRate || salary) : d / 8
        next.dailyRate = Math.round((sType === "Daily" ? salary : d) * 100) / 100
        next.hourlyRate = Math.round((sType === "Hourly" ? salary : h) * 100) / 100
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        phone: form.phone, department: form.department, position: form.position,
        dateHired: form.dateHired, address: form.address, status: form.status,
        sssNumber: form.sssNumber, philhealthNumber: form.philhealthNumber,
        pagibigNumber: form.pagibigNumber, tinNumber: form.tinNumber,
        basicSalary: form.basicSalary, dailyRate: form.dailyRate,
        hourlyRate: form.hourlyRate, salaryType: form.salaryType,
        shiftStart: form.shiftStart, shiftEnd: form.shiftEnd,
      }
      const res = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setEmployee(updated)
      setEditing(false)
      toast.success("Employee updated")
    } catch { toast.error("Failed to update employee") }
    finally { setSaving(false) }
  }

  if (loading || !employee) return (
    <div className="space-y-5">
      <div className="section-card h-20" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-52 lg:col-span-1" />
        <div className="skeleton h-52 lg:col-span-2" />
      </div>
    </div>
  )

  const disp = editing ? form : employee

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/employees" className="hover:text-primary transition-colors">Employees</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium" style={{ color: "#3d766d" }}>{employee.firstName} {employee.lastName}</span>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl surface-raised flex items-center justify-center text-2xl font-bold text-secondary">
                <span>{employee.firstName[0]}{employee.lastName[0]}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-primary tracking-tight">{employee.firstName} {employee.lastName}</h1>
                <span className="badge badge-info">{employee.position}</span>
                <span className={`badge ${employee.status === "Active" ? "badge-success" : "badge-neutral"}`}>{employee.status}</span>
              </div>
              <p className="text-sm text-secondary mt-1 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted" /> {employee.email}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {employee.address || "No address set"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" /> {employee.department}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Hired {formatDate(employee.dateHired)}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm gap-1.5">
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                    </button>
                    <button onClick={cancelEdit} className="btn btn-secondary btn-sm gap-1.5">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={startEdit} className="btn btn-secondary btn-sm"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                    <button className="btn btn-secondary btn-sm"><Download className="h-3.5 w-3.5" /> Export</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center border-b border-default gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-1 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === tab
                ? "border-[#3d766d] text-primary"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >{tab}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-4 section-card h-fit">
            <div className="section-card-header">
              <h2 className="flex items-center gap-2"><User className="h-4 w-4" style={{ color: "#3d766d" }} /> Personal Info</h2>
            </div>
            <div className="section-card-body space-y-4">
              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label>First Name</label>
                      <input className="input" value={disp.firstName} onChange={(e) => update("firstName", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input className="input" value={disp.lastName} onChange={(e) => update("lastName", e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="input" value={disp.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input className="input" value={disp.phone || ""} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input className="input" value={disp.address || ""} onChange={(e) => update("address", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label>Department</label>
                      <input className="input" value={disp.department || ""} onChange={(e) => update("department", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <Select value={disp.position || ""} onChange={(v) => update("position", v)} options={["President", "Team leader", "Team manager", "Medical Biller"]} placeholder="Select position" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label>Date Hired</label>
                      <input type="date" className="input" value={disp.dateHired?.split("T")[0] || ""} onChange={(e) => update("dateHired", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <Select value={disp.status || "Active"} onChange={(v) => update("status", v)} options={["Active", "On Leave", "Inactive", "Suspended", "Terminated"]} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label>Shift Start</label>
                      <input type="time" className="input" value={disp.shiftStart || "08:00"} onChange={(e) => update("shiftStart", e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Shift End</label>
                      <input type="time" className="input" value={disp.shiftEnd || "17:00"} onChange={(e) => update("shiftEnd", e.target.value)} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {[
                    { label: "Full Name", value: `${employee.firstName} ${employee.lastName}` },
                    { label: "Department", value: employee.department || "—" },
                    { label: "Position", value: employee.position || "—" },
                    { label: "Date Hired", value: formatDate(employee.dateHired) },
                    { label: "Address", value: employee.address || "—" },
                    { label: "Phone", value: employee.phone || "—" },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] uppercase tracking-wider text-muted font-medium">{f.label}</p>
                      <p className="text-sm text-primary mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 section-card">
            <div className="section-card-header">
              <h2>Employment Details</h2>
            </div>
            <div className="section-card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Employee ID", value: employee.employeeId, icon: Hash },
                    { label: "Department", value: employee.department, icon: Briefcase },
                    { label: "Position", value: employee.position, icon: User },
                    { label: "Status", value: employee.status, icon: Shield },
                    { label: "Date Hired", value: formatDate(employee.dateHired), icon: Calendar },
                    { label: "Work Schedule", value: `${employee.shiftStart || "08:00"} – ${employee.shiftEnd || "17:00"}`, icon: Clock },
                  ].map((f) => (
                  <div key={f.label} className="surface-raised border border-default rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <f.icon className="h-3.5 w-3.5 text-muted" />
                      <span className="text-[10px] uppercase tracking-wider text-muted font-medium">{f.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Compensation" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8 section-card">
            <div className="section-card-header">
              <h2>Compensation</h2>
            </div>
            <div className="section-card-body">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="form-group">
                    <label>Basic Salary (₱)</label>
                    <input type="number" className="input" value={disp.basicSalary || ""} onChange={(e) => update("basicSalary", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label>Salary Type</label>
                    <Select value={disp.salaryType} onChange={(v) => update("salaryType", v)} options={SALARY_TYPES} />
                  </div>
                  <div className="form-group">
                    <label>Daily Rate</label>
                    <input className="input" value={disp.dailyRate} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate</label>
                    <input className="input" value={disp.hourlyRate} readOnly />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: "Base Salary", value: formatCurrency(employee.basicSalary), sub: employee.salaryType || "Monthly" },
                    { label: "Daily Rate", value: formatCurrency(employee.dailyRate), sub: "Per Day" },
                    { label: "Hourly Rate", value: formatCurrency(employee.hourlyRate), sub: "Per Hour" },
                    { label: "Pay Frequency", value: employee.salaryType || "Monthly", sub: "Salary Type" },
                  ].map((c) => (
                    <div key={c.label} className="surface-raised border border-default rounded-xl p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1.5">{c.label}</p>
                      <p className="text-xl font-bold text-primary tracking-tight">{c.value}</p>
                      <p className="text-xs text-muted mt-0.5">{c.sub}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="surface-raised border border-default rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-secondary font-medium">Projected Annual Earnings</p>
                  <h4 className="text-2xl font-bold text-primary tracking-tight mt-0.5">
                    {formatCurrency(employee.basicSalary * 12)}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 section-card h-fit">
            <div className="section-card-header">
              <h2 className="flex items-center gap-2"><Shield className="h-4 w-4" style={{ color: "#3d766d" }} /> Government IDs</h2>
            </div>
            <div className="section-card-body space-y-2.5">
              {editing ? (
                <div className="space-y-3">
                  {[{ label: "TIN", field: "tinNumber" }, { label: "SSS", field: "sssNumber" }, { label: "PhilHealth", field: "philhealthNumber" }, { label: "Pag-IBIG", field: "pagibigNumber" }].map(({ label, field }) => (
                    <div key={field} className="form-group">
                      <label>{label}</label>
                      <input className="input" value={(disp as any)[field] || ""} onChange={(e) => update(field, e.target.value)} />
                    </div>
                  ))}
                </div>
              ) : (
                [
                  { label: "Tax ID / TIN", value: employee.tinNumber || "—" },
                  { label: "Social Security (SSS)", value: employee.sssNumber || "—" },
                  { label: "PhilHealth", value: employee.philhealthNumber || "—" },
                  { label: "Pag-IBIG", value: employee.pagibigNumber || "—" },
                ].map((g) => (
                  <div key={g.label} className="flex justify-between items-center p-3 surface-raised rounded-lg border border-default">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted font-medium">{g.label}</p>
                      <p className="text-sm font-mono text-primary mt-0.5">{g.value}</p>
                    </div>
                    <button className="text-muted hover:text-secondary transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Government IDs" && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="flex items-center gap-2"><Shield className="h-4 w-4" style={{ color: "#3d766d" }} /> Government Numbers</h2>
          </div>
          <div className="section-card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "TIN", value: employee.tinNumber },
                { label: "SSS", value: employee.sssNumber },
                { label: "PhilHealth", value: employee.philhealthNumber },
                { label: "Pag-IBIG", value: employee.pagibigNumber },
              ].map((g) => (
                <div key={g.label} className="surface-raised border border-default rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-medium">{g.label}</p>
                  <p className="text-sm font-mono text-primary mt-1">{g.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Attendance" && (
        <div className="section-card overflow-hidden flex flex-col">
          <div className="section-card-header">
            <h2 className="flex items-center gap-2"><Clock className="h-4 w-4" style={{ color: "#3d766d" }} /> Daily Attendance</h2>
            <span className="text-xs text-muted">Schedule: {employee.shiftStart || "08:00"} – {employee.shiftEnd || "17:00"}</span>
          </div>
          {employee.attendanceRecords.length === 0 ? (
            <div className="empty-state py-12">
              <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">No attendance records</h3>
              <p className="text-xs text-muted">No timesheet entries recorded for this employee.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 110, textAlign: "center" }}>Date</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Time In</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Time Out</th>
                    <th style={{ minWidth: 60, textAlign: "center" }}>Break</th>
                    <th style={{ minWidth: 60, textAlign: "center" }}>Total</th>
                    <th style={{ minWidth: 56, textAlign: "center" }}>Late</th>
                    <th style={{ minWidth: 56, textAlign: "center" }}>OT</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.attendanceRecords.map((r: any) => {
                    const d = new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    const ti = r.timeIn ? new Date(r.timeIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—"
                    const to = r.timeOut ? new Date(r.timeOut).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—"
                    const shiftStart = employee.shiftStart || "08:00"
                    const isLate = ti !== "—" && ti > shiftStart
                    const isOT = r.totalHours > 8
                    return (
                      <tr key={r.id}>
                        <td className="text-center text-sm text-primary">{d}</td>
                        <td className="text-center text-sm" style={{ color: isLate ? "#e74c3c" : "var(--text-primary)", fontWeight: isLate ? 600 : 400 }}>{ti}</td>
                        <td className="text-center text-sm text-primary">{to}</td>
                        <td className="text-center text-sm text-muted">{r.breakMinutes ? `${r.breakMinutes}m` : "—"}</td>
                        <td className="text-center text-sm font-medium" style={{ color: isOT ? "#2563eb" : "var(--text-primary)" }}>{r.totalHours.toFixed(1)}h</td>
                        <td className="text-center text-sm" style={{ color: isLate ? "#e74c3c" : "var(--text-muted)" }}>{isLate ? "Late" : "—"}</td>
                        <td className="text-center text-sm" style={{ color: isOT ? "#2563eb" : "var(--text-muted)" }}>{isOT ? `${(r.totalHours - 8).toFixed(1)}h` : "—"}</td>
                        <td className="text-center">
                          <span className={`badge ${r.status === "Present" ? "badge-success" : r.status === "Late" ? "badge-warning" : "badge-muted"}`}>{r.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "Payroll History" && (
        <div className="section-card overflow-hidden flex flex-col">
          <div className="section-card-header">
            <h2 className="flex items-center gap-2"><DollarSign className="h-4 w-4" style={{ color: "#3d766d" }} /> Disbursement History</h2>
            <div className="flex items-center gap-2">
              {!showGen && (
                <button onClick={() => setShowGen(true)} className="btn btn-primary btn-sm gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Generate Payslip
                </button>
              )}
            </div>
          </div>
          {showGen && (
            <div className="px-5 py-4 border-b border-default" style={{ background: "var(--surface-sunken)" }}>
              <div className="flex items-end gap-3">
                <div className="form-group mb-0">
                  <label className="text-[10px]">Period Start</label>
                  <DatePicker className="h-8 text-xs w-40" value={genStart} onChange={setGenStart} />
                </div>
                <div className="form-group mb-0">
                  <label className="text-[10px]">Period End</label>
                  <DatePicker className="h-8 text-xs w-40" value={genEnd} onChange={setGenEnd} />
                </div>
                <button onClick={handleGeneratePayslip} disabled={genLoading || !genStart || !genEnd}
                  className="btn btn-primary btn-sm h-8">
                  {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                  {genLoading ? "Generating..." : "Generate"}
                </button>
                <button onClick={() => setShowGen(false)} className="btn btn-ghost btn-sm h-8 text-xs">Cancel</button>
              </div>
            </div>
          )}
          {employee.payrollRecords.length === 0 ? (
            <div className="empty-state py-12">
              <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">No payroll records yet</h3>
              <p className="text-xs text-muted">This employee has not been included in any payroll runs.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 110, textAlign: "center" }}>Date</th>
                    <th style={{ minWidth: 140, textAlign: "center" }}>Batch</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Type</th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>Gross</th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>Deductions</th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>Net</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.payrollRecords.slice(0, 10).map((r: any) => (
                    <tr key={r.id} className="group">
                      <td className="text-center text-sm text-primary">{formatDate(r.createdAt)}</td>
                      <td className="text-center text-sm font-mono text-muted">{r.batch?.batchName || "—"}</td>
                      <td className="text-center"><span className="badge badge-neutral">REGULAR</span></td>
                      <td className="text-center text-sm text-primary tabular-nums">{formatCurrency(r.grossPay)}</td>
                      <td className="text-center text-sm text-muted tabular-nums">{formatCurrency(r.totalDeductions)}</td>
                      <td className="text-center text-sm font-semibold text-primary tabular-nums">{formatCurrency(r.netPay)}</td>
                      <td className="text-center"><CheckCircle className="h-4 w-4 text-success inline-block" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
