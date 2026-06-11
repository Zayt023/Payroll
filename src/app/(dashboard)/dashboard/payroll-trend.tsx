"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

function formatCurrency(n: number) {
  return "₱" + n.toLocaleString()
}

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

const CHART_COLOR = "#3d766d"

export default function PayrollTrendChart({ data }: { data: { month: string; actual: number; projected: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-muted">No payroll data yet</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
  )
}
