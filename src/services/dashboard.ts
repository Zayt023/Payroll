import { prisma } from "@/lib/prisma"
import type { DashboardStats } from "@/types"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const [
    totalEmployees,
    activeEmployees,
    totalBatches,
    pendingBatches,
    totalPayslips,
    monthlyNetPay,
    prevMonthlyNetPay,
    recentActivity,
    departments,
    batchesThisYear,
    recentBatches,
    overtimeRecords,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "Active" } }),
    prisma.payrollBatch.count(),
    prisma.payrollBatch.count({ where: { status: "DRAFT" } }),
    prisma.generatedPayslip.count(),
    prisma.payrollBatch.aggregate({
      _sum: { totalNetPay: true },
      where: { createdAt: { gte: firstOfThisMonth }, status: "COMPLETED" },
    }),
    prisma.payrollBatch.aggregate({
      _sum: { totalNetPay: true },
      where: { createdAt: { gte: firstOfLastMonth, lt: firstOfThisMonth }, status: "COMPLETED" },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.employee.groupBy({
      by: ["department"],
      _count: true,
    }),
    prisma.payrollBatch.findMany({
      where: { createdAt: { gte: startOfYear }, status: "COMPLETED" },
      select: { totalNetPay: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payrollBatch.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, batchName: true, periodStart: true, periodEnd: true,
        status: true, totalEmployees: true, totalGross: true, totalNetPay: true,
        totalDeductions: true, createdAt: true,
      },
    }),
    prisma.payrollRecord.findMany({
      where: { overtimePay: { gt: 0 } },
      select: { overtimePay: true, batch: { select: { createdAt: true } } },
    }),
  ])

  const monthlyMap: Record<string, number> = {}
  for (const batch of batchesThisYear) {
    const key = `${batch.createdAt.getFullYear()}-${batch.createdAt.getMonth()}`
    monthlyMap[key] = (monthlyMap[key] || 0) + batch.totalNetPay
  }

  const payrollTrend: { month: string; actual: number; projected: number }[] = []
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  for (let m = 0; m < 6; m++) {
    const targetMonth = (currentMonth - 5 + m + 12) % 12
    const year = currentYear + (targetMonth > currentMonth && m < 5 ? -1 : 0)
    const key = `${year}-${targetMonth}`
    const actual = monthlyMap[key] || 0
    const projected = targetMonth <= currentMonth ? actual : Math.round(monthlyNetPay._sum.totalNetPay || 0)
    payrollTrend.push({ month: MONTHS[targetMonth], actual, projected })
  }

  const otMonthlyMap: Record<string, number> = {}
  for (const rec of overtimeRecords) {
    const d = rec.batch.createdAt
    const key = `${d.getFullYear()}-${d.getMonth()}`
    otMonthlyMap[key] = (otMonthlyMap[key] || 0) + rec.overtimePay
  }

  const overtimeTrend: { month: string; amount: number }[] = []
  for (let m = 0; m < 6; m++) {
    const targetMonth = (currentMonth - 5 + m + 12) % 12
    const year = currentYear + (targetMonth > currentMonth && m < 5 ? -1 : 0)
    const key = `${year}-${targetMonth}`
    overtimeTrend.push({ month: MONTHS[targetMonth], amount: otMonthlyMap[key] || 0 })
  }

  return {
    totalEmployees,
    activeEmployees,
    totalBatches,
    pendingBatches,
    totalPayslips,
    monthlyPayroll: monthlyNetPay._sum.totalNetPay || 0,
    previousMonthlyPayroll: prevMonthlyNetPay._sum.totalNetPay || 0,
    recentActivity: recentActivity.map((log) => ({
      id: log.id,
      user: log.user ? { name: log.user.name, email: log.user.email } : undefined,
      action: log.action,
      entity: log.entity,
      details: log.details || undefined,
      createdAt: log.createdAt,
    })),
    departmentBreakdown: departments.map((d) => ({
      department: d.department,
      count: d._count,
    })),
    payrollTrend,
    overtimeTrend,
    recentBatches: recentBatches.map((b) => ({
      ...b,
      periodStart: b.periodStart,
      periodEnd: b.periodEnd,
      createdAt: b.createdAt,
    })),
  }
}
