"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

function formatCurrency(n: number) {
  return "₱" + n.toLocaleString()
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

export default function OvertimeChart({ data }: { data: { month: string; amount: number }[] }) {
  if (!data || data.length === 0 || !data.some(o => o.amount > 0)) {
    return <div className="h-full flex items-center justify-center text-sm text-muted">No overtime data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} dx={-4} />
        <Tooltip content={<TooltipContentOT />} cursor={{ fill: "var(--surface-sunken)" }} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]} style={{ fill: "#e67e22" }} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
