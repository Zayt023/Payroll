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
  getYear,
} from "date-fns"
import { getPhilippineHolidays } from "@/lib/ph-holidays"

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarWidget() {
  const [viewDate, setViewDate] = React.useState(new Date())
  const [tooltip, setTooltip] = React.useState<{ top: number; left: number; name: string; type: string } | null>(null)
  const today = new Date()

  const holidays = React.useMemo(() => {
    const y = getYear(viewDate)
    const prev = getPhilippineHolidays(y - 1)
    const curr = getPhilippineHolidays(y)
    const next = getPhilippineHolidays(y + 1)
    return [...prev, ...curr, ...next]
  }, [viewDate])

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function getHoliday(dateStr: string) {
    return holidays.find(h => h.date === dateStr)
  }

  return (
    <div className="section-card">
      <div className="section-card-body p-4">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setViewDate(d => subMonths(d, 1))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold" style={{ color: "#1f2328" }}>{format(viewDate, "MMMM yyyy")}</span>
          <button type="button" onClick={() => setViewDate(d => addMonths(d, 1))} className="p-1 rounded hover:bg-[#bdc2c7] text-[#8f9192] hover:text-[#1f2328] transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-px relative">
          {dayLabels.map(d => (
            <div key={d} className="text-[0.6rem] font-medium text-center h-6 flex items-center justify-center" style={{ color: "#8f9192" }}>{d}</div>
          ))}
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const isSel = isSameDay(day, today)
            const isCur = isSameMonth(day, viewDate)
            const holiday = getHoliday(dateStr)
            const isHoliday = !!holiday
            const isRegHoliday = holiday?.type === "regular"

            let bg = "transparent"
            let txt = isCur ? "#1f2328" : "#bdc2c7"
            if (isSel && isHoliday) { bg = "#c0392b"; txt = "#ffffff" }
            else if (isSel) { bg = "#3d766d"; txt = "#ffffff" }
            else if (isRegHoliday && isCur) { bg = "#c0392b10"; txt = "#c0392b" }
            else if (isHoliday && isCur) { bg = "#e67e2210"; txt = "#8f5c1a" }

            return (
              <div
                key={i}
                className="h-7 text-xs rounded flex flex-col items-center justify-center relative"
                style={{ background: bg, color: txt, fontWeight: isSel ? 600 : isRegHoliday ? 600 : 400, cursor: isHoliday ? "pointer" : "default" }}
                onMouseEnter={(e) => {
                  if (!holiday) return
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  setTooltip({ top: r.bottom + 4, left: r.left + r.width / 2, name: holiday.name, type: holiday.type === "regular" ? "Regular Holiday" : "Special Holiday" })
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {format(day, "d")}
                {isHoliday && isCur && !isSel && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: isRegHoliday ? "#c0392b" : "#e67e22" }} />
                )}
              </div>
            )
          })}

          {tooltip && (
            <div
              className="fixed z-[9999] px-2.5 py-1.5 rounded-md shadow-lg border pointer-events-none"
              style={{ top: tooltip.top, left: tooltip.left, transform: "translateX(-50%)", background: "var(--surface-base)", borderColor: "var(--border-default)" }}
            >
              <p className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{tooltip.name}</p>
              <p className="text-[10px] whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{tooltip.type}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
