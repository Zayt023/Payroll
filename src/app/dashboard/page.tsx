import { getDashboardStats } from "@/services/dashboard"
import { getAllEmployees } from "@/services/employees"
import DashboardClient from "./dashboard-client"

export const revalidate = 300

export default async function DashboardPage() {
  let data = null
  let employees: any[] = []

  try {
    data = await getDashboardStats()
  } catch {
    // fall back to client-side fetch
  }

  try {
    employees = await getAllEmployees()
  } catch {
    // fall back to client-side fetch
  }

  return (
    <DashboardClient
      initialData={data ? JSON.parse(JSON.stringify(data)) : null}
      initialEmployees={employees.length ? JSON.parse(JSON.stringify(employees)) : undefined}
    />
  )
}
