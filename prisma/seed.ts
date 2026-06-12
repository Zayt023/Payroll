import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const adminPassword = await bcrypt.hash("0@hOQDx&!D", 12)
  const hrPassword = await bcrypt.hash("hr123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "a3mb@admin.com" },
    update: {},
    create: {
      email: "a3mb@admin.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      department: "Management",
    },
  })

  const hr = await prisma.user.upsert({
    where: { email: "hr@company.com" },
    update: {},
    create: {
      email: "hr@company.com",
      password: hrPassword,
      name: "HR Staff",
      role: "HR",
      department: "Human Resources",
    },
  })

  console.log(`Created admin: ${admin.email}`)
  console.log(`Created hr: ${hr.email}`)

  const defaultClients = [
    { name: "Manila Medical Center", code: "MMC" },
    { name: "Quezon City General Hospital", code: "QCG" },
    { name: "Makati Health Partners", code: "MHP" },
    { name: "San Juan Medical Clinic", code: "SJC" },
    { name: "Pasig Diagnostic Center", code: "PDC" },
  ]
  for (const c of defaultClients) {
    await prisma.client.upsert({
      where: { code: c.code },
      update: {},
      create: { name: c.name, code: c.code },
    })
    console.log(`Created client: ${c.name} (${c.code})`)
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
