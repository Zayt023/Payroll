import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export interface CreateUserParams {
  email: string
  password: string
  name: string
  role?: "ADMIN" | "HR" | "EMPLOYEE"
  department?: string
}

export async function createUser(params: CreateUserParams) {
  const hashed = await bcrypt.hash(params.password, 12)
  return prisma.user.create({
    data: {
      email: params.email,
      password: hashed,
      name: params.name,
      role: params.role || "HR",
      department: params.department,
    },
    select: { id: true, email: true, name: true, role: true },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  })
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashed = await bcrypt.hash(newPassword, 12)
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
    select: { id: true, email: true, name: true },
  })
}
