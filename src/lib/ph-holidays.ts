const FIXED_HOLIDAYS: { month: number; day: number; name: string; type: "regular" | "special" }[] = [
  { month: 1,  day: 1,  name: "New Year's Day", type: "regular" },
  { month: 2,  day: 25, name: "EDSA People Power Revolution", type: "special" },
  { month: 4,  day: 9,  name: "Araw ng Kagitingan", type: "regular" },
  { month: 5,  day: 1,  name: "Labor Day", type: "regular" },
  { month: 6,  day: 12, name: "Independence Day", type: "regular" },
  { month: 8,  day: 21, name: "Ninoy Aquino Day", type: "special" },
  { month: 11, day: 1,  name: "All Saints' Day", type: "special" },
  { month: 11, day: 2,  name: "All Souls' Day", type: "special" },
  { month: 11, day: 30, name: "Bonifacio Day", type: "regular" },
  { month: 12, day: 8,  name: "Feast of Immaculate Conception", type: "regular" },
  { month: 12, day: 24, name: "Christmas Eve", type: "special" },
  { month: 12, day: 25, name: "Christmas Day", type: "regular" },
  { month: 12, day: 30, name: "Rizal Day", type: "regular" },
  { month: 12, day: 31, name: "New Year's Eve", type: "special" },
]

function getEaster(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

export interface Holiday {
  date: string
  name: string
  type: "regular" | "special"
}

export function getPhilippineHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = FIXED_HOLIDAYS.map(h => ({
    date: `${year}-${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`,
    name: h.name,
    type: h.type,
  }))

  const easter = getEaster(year)
  const easterDate = new Date(year, easter.month - 1, easter.day)

  const holyWed = new Date(easterDate)
  holyWed.setDate(holyWed.getDate() - 3)
  holidays.push({
    date: `${year}-${String(holyWed.getMonth() + 1).padStart(2, "0")}-${String(holyWed.getDate()).padStart(2, "0")}`,
    name: "Maundy Thursday",
    type: "regular",
  })

  const goodFri = new Date(easterDate)
  goodFri.setDate(goodFri.getDate() - 2)
  holidays.push({
    date: `${year}-${String(goodFri.getMonth() + 1).padStart(2, "0")}-${String(goodFri.getDate()).padStart(2, "0")}`,
    name: "Good Friday",
    type: "regular",
  })

  const blackSat = new Date(easterDate)
  blackSat.setDate(blackSat.getDate() - 1)
  holidays.push({
    date: `${year}-${String(blackSat.getMonth() + 1).padStart(2, "0")}-${String(blackSat.getDate()).padStart(2, "0")}`,
    name: "Black Saturday",
    type: "special",
  })

  holidays.sort((a, b) => a.date.localeCompare(b.date))

  return holidays
}
