"use client"

import { useEffect, useState } from "react"
import { Building2, Plus, Loader2, Pencil, Trash2, X, Check } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Client {
  id: string; name: string; code: string; isActive: boolean
}

export default function PracticePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchClients() {
    setLoading(true)
    try {
      const res = await fetch("/api/practice")
      if (res.ok) setClients(await res.json())
    } catch { setClients([]) }
    finally { setLoading(false) }
  }

  async function fetchClientsFresh() {
    try {
      const res = await fetch(`/api/practice?_=${Date.now()}`)
      if (res.ok) setClients(await res.json())
    } catch { setClients([]) }
  }

  useEffect(() => { fetchClients() }, [])

  function openNew() { setEditing(null); setName(""); setCode(""); setShowForm(true) }

  function openEdit(c: Client) { setEditing(c); setName(c.name); setCode(c.code); setShowForm(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !code.trim()) { toast.error("Name and code required"); return }
    setSaving(true)
    try {
      const url = editing ? `/api/practice/${editing.id}` : "/api/practice"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), code: code.trim() }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed") }
      toast.success(editing ? "Practice updated" : "Practice created")
      setShowForm(false)
      fetchClientsFresh()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/practice/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Practice deleted")
      fetchClientsFresh()
    } catch (e: any) { toast.error(e.message) }
    finally { setDeleteId(null) }
  }

  async function toggleActive(c: Client) {
    try {
      const res = await fetch(`/api/practice/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: c.name, code: c.code, isActive: !c.isActive }) })
      if (!res.ok) throw new Error("Update failed")
      fetchClientsFresh()
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Practice</h1>
          <p>Manage practice accounts for billing allocation.</p>
        </div>
        <button onClick={openNew} className="btn btn-primary btn-sm">
          <Plus className="h-3.5 w-3.5" /> New Practice
        </button>
      </div>

      {showForm && (
        <div className="section-card">
          <div className="section-card-body">
            <form onSubmit={handleSave} className="flex items-end gap-3">
              <div className="form-group flex-1">
                <label>Practice Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Manila Medical Center" required />
              </div>
              <div className="form-group w-40">
                <label>Code</label>
                <input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. MMC" required />
              </div>
              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-card overflow-hidden">
        <div className="table-wrap">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <div className="w-12 h-12 rounded-xl surface-raised flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-primary mb-1">No practices yet</h3>
              <p className="text-xs text-muted">Add practices to allocate timesheet hours for billing.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Name</th>
                  <th style={{ minWidth: 120, textAlign: "center" }}>Code</th>
                  <th style={{ minWidth: 100, textAlign: "center" }}>Status</th>
                  <th style={{ width: 100, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-primary">{c.name}</td>
                    <td className="text-center"><code className="text-xs surface-raised px-2 py-0.5 rounded text-secondary">{c.code}</code></td>
                    <td className="text-center">
                      <button onClick={() => toggleActive(c)} className={`badge ${c.isActive ? "badge-success" : "badge-muted"} cursor-pointer`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => openEdit(c)} className="btn btn-ghost h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="btn btn-ghost h-7 w-7 p-0"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete practice"
        message="Are you sure you want to delete this practice? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
