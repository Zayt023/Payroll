import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  setYear,
  getYear,
} from "date-fns"

export interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function DatePicker({ value, onChange, className, placeholder = "Pick a date" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  const [viewDate, setViewDate] = React.useState(() => value ? new Date(value + "T00:00:00") : new Date())
  const [mode, setMode] = React.useState<"calendar" | "year">("calendar")
  const btnRef = React.useRef<HTMLButtonElement>(null)

  const selectedDate = value ? new Date(value + "T00:00:00") : undefined
  const viewYear = getYear(viewDate)

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const displayValue = selectedDate ? format(selectedDate, "MMM d, yyyy") : ""

  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        const cal = document.getElementById("dp-calendar")
        if (cal && !cal.contains(e.target as Node)) setOpen(false)
        if (!cal) setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick, true)
    return () => document.removeEventListener("mousedown", handleClick, true)
  }, [open])

  function toggle() {
    if (!open) {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 4, left: r.left })
      }
      setMode("calendar")
    }
    setOpen(!open)
  }

  function selectDay(day: Date) {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  const decadeStart = Math.floor(viewYear / 12) * 12
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={className}
        style={{
          background: "var(--surface-base)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md, 6px)",
          padding: "0.5rem 0.75rem",
          color: displayValue ? "var(--text-primary)" : "var(--text-muted)",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-sans)",
          height: 36,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          textAlign: "left",
          cursor: "pointer",
          outline: "none",
          boxSizing: "border-box",
          lineHeight: 1.5,
          transition: "border-color 0.12s ease, box-shadow 0.12s ease",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget.style.borderColor = "var(--border-focus)") }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget.style.borderColor = "var(--border-default)") }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61, 118, 109, 0.08)" }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.boxShadow = "none" }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayValue || placeholder}
        </span>
      </button>
      {open && (
        <div
          id="dp-calendar"
          className="fixed z-[9999] w-auto rounded-lg border border-default p-3 shadow-xl"
          style={{ top: pos.top, left: pos.left, background: "#f0f3f5", opacity: 1 }}
        >
          <div className="w-[256px]">
            {mode === "calendar" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setViewDate(d => subMonths(d, 1))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => setMode("year")} className="text-sm font-medium hover:text-[#3d766d] transition-colors" style={{ color: "#1f2328" }}>
                    {format(viewDate, "MMMM yyyy")}
                  </button>
                  <button type="button" onClick={() => setViewDate(d => addMonths(d, 1))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {dayLabels.map(d => (
                    <div key={d} className="text-[0.65rem] font-medium text-center h-7 flex items-center justify-center" style={{ color: "#8f9192" }}>{d}</div>
                  ))}
                  {days.map((day, i) => {
                    const isSel = selectedDate && isSameDay(day, selectedDate)
                    const isCur = isSameMonth(day, viewDate)
                    const isTod = isToday(day)
                    let bg = "transparent"
                    let txt = isCur ? "#1f2328" : "#bdc2c7"
                    if (isSel) { bg = "#3d766d"; txt = "#ffffff" }
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectDay(day)}
                        className="h-8 w-9 text-xs rounded flex items-center justify-center transition-colors hover:bg-[#bdc2c7]"
                        style={{ background: bg, color: txt, outline: isTod && !isSel ? "1px solid #d6d9df" : "none", outlineOffset: "-1px" }}
                      >
                        {format(day, "d")}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
            {mode === "year" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setViewDate(d => setYear(d, getYear(d) - 12))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium" style={{ color: "#1f2328" }}>{decadeStart} &ndash; {decadeStart + 11}</span>
                  <button type="button" onClick={() => setViewDate(d => setYear(d, getYear(d) + 12))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {years.map(y => {
                    const isSel = getYear(selectedDate ?? new Date()) === y
                    const isCur = y === getYear(new Date())
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => { setViewDate(d => setYear(d, y)); setMode("calendar") }}
                        className="h-9 text-sm rounded transition-colors"
                        style={{
                          background: isSel ? "#3d766d" : "transparent",
                          color: isSel ? "#ffffff" : isCur ? "#3d766d" : "#1f2328",
                          fontWeight: isSel || isCur ? 600 : 400,
                        }}
                      >
                        {y}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
