import { prisma } from "@/lib/prisma"
import type { Employee } from "@prisma/client"

type CreateEmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt" | "overtimeRate" | "avatar" | "dateOfBirth" | "address" | "city" | "province" | "zipCode" | "middleName">

export async function createEmployee(data: CreateEmployeeInput) {
  const salaryType = data.salaryType || "Monthly"
  let daily = data.dailyRate || 0
  let hourly = data.hourlyRate || 0
  if (!daily) {
    if (salaryType === "Monthly" || salaryType === "Semi-Monthly" || salaryType === "Bi-Weekly" || salaryType === "Weekly") {
      daily = data.basicSalary / 22
    }
  }
  if (!hourly) {
    hourly = daily / 8
  }
  return prisma.employee.create({
    data: {
      ...data,
      salaryType,
      dailyRate: Math.round(daily * 100) / 100,
      hourlyRate: Math.round(hourly * 100) / 100,
    },
  })
}

export async function getAllEmployees() {
  return prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      position: true,
      basicSalary: true,
      salaryType: true,
      avatar: true,
      status: true,
      dateHired: true,
      _count: { select: { payrollRecords: true } },
    },
  })
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
      payrollRecords: {
        include: { batch: { select: { batchName: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      allowances: true,
      deductions: true,
    },
  })
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  return prisma.employee.update({
    where: { id },
    data,
    include: {
      attendanceRecords: { orderBy: { date: "desc" }, take: 30 },
      payrollRecords: {
        include: { batch: { select: { batchName: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      allowances: true,
      deductions: true,
    },
  })
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({ where: { id } })
}
