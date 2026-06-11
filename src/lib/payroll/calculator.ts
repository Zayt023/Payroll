interface PayrollInput {
  basicSalary: number
  dailyRate: number
  hourlyRate: number
  salaryType: string
  overtimeHours: number
  overtimeRate: number
  lateMinutes: number
  absences: number
  holidayPay: number
  allowances: { name: string; amount: number }[]
  deductions: { name: string; amount: number }[]
  cashAdvance: number
  sssNumber?: string
  philhealthNumber?: string
  pagibigNumber?: string
  tinNumber?: string
}

interface PayrollResult {
  basicSalary: number
  dailyRate: number
  hourlyRate: number
  periodSalary: number
  overtimePay: number
  holidayPay: number
  grossPay: number
  sssDeduction: number
  philhealthDeduction: number
  pagibigDeduction: number
  taxDeduction: number
  cashAdvance: number
  otherDeductions: number
  totalDeductions: number
  netPay: number
  breakdown: {
    lateDeduction: number
    absenceDeduction: number
  }
}

export function computePayroll(input: PayrollInput): PayrollResult {
  const { basicSalary, dailyRate, hourlyRate, salaryType, overtimeHours, overtimeRate, lateMinutes, absences, holidayPay, allowances, deductions, cashAdvance } = input

  const periodSalary = computePeriodSalary(basicSalary, dailyRate, hourlyRate, salaryType)

  const absenceDeduction = absences * dailyRate
  const lateDeduction = (lateMinutes / 60) * hourlyRate

  const adjustedBasic = periodSalary - absenceDeduction - lateDeduction
  const overtimePay = overtimeHours * (hourlyRate * (overtimeRate || 1.25))
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0)
  const grossPay = adjustedBasic + overtimePay + holidayPay + totalAllowances

  const sssDeduction = computeSSS(grossPay)
  const philhealthDeduction = computePhilHealth(grossPay)
  const pagibigDeduction = computePagIBIG(grossPay)
  const taxDeduction = computeWithholdingTax(grossPay, sssDeduction + philhealthDeduction + pagibigDeduction)
  const otherDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
  const totalDeductions = sssDeduction + philhealthDeduction + pagibigDeduction + taxDeduction + cashAdvance + otherDeductions

  const netPay = grossPay - totalDeductions

  return {
    basicSalary: adjustedBasic,
    dailyRate,
    hourlyRate,
    periodSalary,
    overtimePay,
    holidayPay,
    grossPay,
    sssDeduction,
    philhealthDeduction,
    pagibigDeduction,
    taxDeduction,
    cashAdvance,
    otherDeductions,
    totalDeductions,
    netPay,
    breakdown: {
      lateDeduction,
      absenceDeduction,
    },
  }
}

function computePeriodSalary(basicSalary: number, dailyRate: number, hourlyRate: number, salaryType: string): number {
  switch (salaryType) {
    case "Semi-Monthly": return basicSalary / 2
    case "Bi-Weekly": return Math.round((basicSalary * 12 / 26) * 100) / 100
    case "Weekly": return Math.round((basicSalary * 12 / 52) * 100) / 100
    case "Daily": return dailyRate * 22
    case "Hourly": return hourlyRate * 176
    default: return basicSalary
  }
}

function computeSSS(grossPay: number): number {
  if (grossPay <= 3250) return 135
  if (grossPay <= 3750) return 157.5
  if (grossPay <= 4250) return 180
  if (grossPay <= 4750) return 202.5
  if (grossPay <= 5250) return 225
  if (grossPay <= 5750) return 247.5
  if (grossPay <= 6250) return 270
  if (grossPay <= 6750) return 292.5
  if (grossPay <= 7250) return 315
  if (grossPay <= 7750) return 337.5
  if (grossPay <= 8250) return 360
  if (grossPay <= 8750) return 382.5
  if (grossPay <= 9250) return 405
  if (grossPay <= 9750) return 427.5
  if (grossPay <= 10250) return 450
  if (grossPay <= 10750) return 472.5
  if (grossPay <= 11250) return 495
  if (grossPay <= 11750) return 517.5
  if (grossPay <= 12250) return 540
  if (grossPay <= 12750) return 562.5
  if (grossPay <= 13250) return 585
  if (grossPay <= 13750) return 607.5
  if (grossPay <= 14250) return 630
  if (grossPay <= 14750) return 652.5
  if (grossPay <= 15250) return 675
  if (grossPay <= 15750) return 697.5
  if (grossPay <= 16250) return 720
  if (grossPay <= 16750) return 742.5
  if (grossPay <= 17250) return 765
  if (grossPay <= 17750) return 787.5
  if (grossPay <= 18250) return 810
  if (grossPay <= 18750) return 832.5
  if (grossPay <= 19250) return 855
  if (grossPay <= 19750) return 877.5
  if (grossPay <= 20250) return 900
  if (grossPay <= 20750) return 922.5
  if (grossPay <= 21250) return 945
  if (grossPay <= 21750) return 967.5
  if (grossPay <= 22250) return 990
  if (grossPay <= 22750) return 1012.5
  if (grossPay <= 23250) return 1035
  if (grossPay <= 23750) return 1057.5
  if (grossPay <= 24250) return 1080
  if (grossPay <= 24750) return 1102.5
  return 1125
}

function computePhilHealth(grossPay: number): number {
  const premium = grossPay * 0.05
  const share = premium / 2
  if (share < 50) return 50
  if (share > 900) return 900
  return Math.round(share * 100) / 100
}

function computePagIBIG(grossPay: number): number {
  if (grossPay <= 1500) return grossPay * 0.01
  return Math.min(grossPay * 0.02, 100)
}

function computeWithholdingTax(grossPay: number, governmentDeductions: number): number {
  const taxableIncome = grossPay - governmentDeductions
  if (taxableIncome <= 20833) return 0
  if (taxableIncome <= 33333) return (taxableIncome - 20833) * 0.2
  if (taxableIncome <= 66667) return 2500 + (taxableIncome - 33333) * 0.25
  if (taxableIncome <= 166667) return 10833.33 + (taxableIncome - 66667) * 0.3
  if (taxableIncome <= 666667) return 40833.33 + (taxableIncome - 166667) * 0.32
  return 200833.33 + (taxableIncome - 666667) * 0.35
}
