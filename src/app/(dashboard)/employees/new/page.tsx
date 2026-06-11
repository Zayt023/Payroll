"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DatePicker, Select } from "@/components/ui"

const SALARY_TYPES = ["Monthly", "Semi-Monthly", "Bi-Weekly", "Weekly", "Daily", "Hourly"]

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showGov, setShowGov] = useState(false)
  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", email: "", phone: "",
    department: "", position: "", dateHired: new Date().toISOString().split("T")[0], status: "Active",
    sssNumber: "", philhealthNumber: "", pagibigNumber: "", tinNumber: "",
    basicSalary: 0, dailyRate: 0, hourlyRate: 0, salaryType: "Monthly",
  })

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "basicSalary" || field === "salaryType") {
      const sType = field === "salaryType" ? value : form.salaryType
      const salary = field === "basicSalary" ? value : form.basicSalary
      let d = sType === "Daily" || sType === "Hourly" ? salary / 22 : salary / 22
      if (sType === "Hourly") d = salary / 22
      const h = sType === "Hourly" ? (form.hourlyRate || salary) : d / 8
      setForm((prev) => ({
        ...prev,
        [field]: value,
        dailyRate: Math.round((sType === "Daily" ? salary : d) * 100) / 100,
        hourlyRate: Math.round((sType === "Hourly" ? salary : h) * 100) / 100,
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dateHired: new Date(form.dateHired) }),
      })
      if (!res.ok) throw new Error()
      toast.success("Employee created")
      router.push("/employees")
    } catch { toast.error("Failed to create employee") }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/employees" className="btn btn-ghost btn-sm h-8 w-8 p-0"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="page-header flex-1 mb-0">
          <h1>Add Employee</h1>
          <p>Enter the details of the new team member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="section-card">
          <div className="section-card-header">
            <h2>Personal Information</h2>
          </div>
          <div className="section-card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Employee ID</label>
                <input className="input" value={form.employeeId} onChange={(e) => update("employeeId", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Date Hired</label>
                <DatePicker value={form.dateHired} onChange={(v) => update("dateHired", v)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>First Name</label>
                <input className="input" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="input" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2>Employment Information</h2>
          </div>
          <div className="section-card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Department</label>
                <input className="input" value={form.department} onChange={(e) => update("department", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Position</label>
                <Select value={form.position} onChange={(v) => update("position", v)} options={["President", "Team leader", "Team manager", "Medical Biller"]} placeholder="Select position" />
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <Select value={form.status || "Active"} onChange={(v) => update("status", v)} options={["Active", "On Leave", "Inactive", "Suspended", "Terminated"]} />
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2>Salary Information</h2>
          </div>
          <div className="section-card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Salary Type</label>
                <Select value={form.salaryType} onChange={(v) => update("salaryType", v)} options={SALARY_TYPES} />
              </div>
              <div className="form-group">
                <label>Basic Salary (₱)</label>
                <input type="number" className="input" value={form.basicSalary || ""} onChange={(e) => update("basicSalary", parseFloat(e.target.value) || 0)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Daily Rate (auto-calculated)</label>
                <input className="input" value={form.dailyRate ? `₱${form.dailyRate.toFixed(2)}` : ""} disabled />
              </div>
              <div className="form-group">
                <label>Hourly Rate (auto-calculated)</label>
                <input className="input" value={form.hourlyRate ? `₱${form.hourlyRate.toFixed(2)}` : ""} disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <button type="button" onClick={() => setShowGov(!showGov)} className="section-card-header w-full cursor-pointer">
            <h2>Government Numbers</h2>
            {showGov ? <ChevronUp className="h-4 w-4 text-secondary" /> : <ChevronDown className="h-4 w-4 text-secondary" />}
          </button>
          {showGov && (
            <div className="section-card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>SSS Number</label>
                  <input className="input" value={form.sssNumber} onChange={(e) => update("sssNumber", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>PhilHealth Number</label>
                  <input className="input" value={form.philhealthNumber} onChange={(e) => update("philhealthNumber", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Pag-IBIG Number</label>
                  <input className="input" value={form.pagibigNumber} onChange={(e) => update("pagibigNumber", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>TIN Number</label>
                  <input className="input" value={form.tinNumber} onChange={(e) => update("tinNumber", e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/employees"><button type="button" className="btn btn-secondary btn-md">Cancel</button></Link>
          <button type="submit" disabled={loading} className="btn btn-primary btn-md">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </form>
    </div>
  )
}
