export type Role = "ADMIN" | "HR" | "EMPLOYEE"

export interface UserSession {
  id: string
  email: string
  name: string
  role: Role
}

export type SalaryType = "Monthly" | "Semi-Monthly" | "Bi-Weekly" | "Weekly" | "Daily" | "Hourly"

export interface EmployeeData {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  phone?: string
  department: string
  position: string
  dateHired: Date
  basicSalary: number
  dailyRate: number
  hourlyRate: number
  salaryType: SalaryType
  status: string
}

export interface PayrollSummary {
  totalEmployees: number
  totalGross: number
  totalDeductions: number
  totalNetPay: number
  batchCount: number
}

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalBatches: number
  pendingBatches: number
  totalPayslips: number
  monthlyPayroll: number
  previousMonthlyPayroll: number
  recentActivity: AuditLogEntry[]
  departmentBreakdown: { department: string; count: number }[]
  payrollTrend: { month: string; actual: number; projected: number }[]
  overtimeTrend: { month: string; amount: number }[]
  recentBatches: {
    id: string
    batchName: string
    periodStart: Date
    periodEnd: Date
    status: string
    totalEmployees: number
    totalGross: number
    totalNetPay: number
    totalDeductions: number
    createdAt: Date
  }[]
}

export interface AuditLogEntry {
  id: string
  user?: { name: string; email: string }
  action: string
  entity: string
  details?: string
  createdAt: Date
}

export interface PayslipData {
  id: string
  referenceNumber: string
  employee: {
    firstName: string
    lastName: string
    employeeId: string
    department: string
    position: string
    basicSalary: number
    dailyRate: number
    hourlyRate: number
  }
  periodStart: Date
  periodEnd: Date
  regularHours: number
  overtimeHours: number
  lateMinutes: number
  absences: number
  basicSalary: number
  overtimePay: number
  holidayPay: number
  grossPay: number
  sssDeduction: number
  philhealthDeduction: number
  pagibigDeduction: number
  taxDeduction: number
  cashAdvance: number
  otherDeductions: number
  allowances: { name: string; amount: number }[]
  deductions: { name: string; amount: number }[]
  totalDeductions: number
  netPay: number
}

export interface ColumnMapping {
  employeeName?: string
  employeeId?: string
  department?: string
  position?: string
  date?: string
  timeIn?: string
  timeOut?: string
  totalHours?: string
  overtime?: string
  lateMinutes?: string
  absences?: string
  holidayPay?: string
  allowances?: string
  deductions?: string
  salaryType?: string
}

export interface NotificationData {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}
