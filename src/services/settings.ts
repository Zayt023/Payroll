import { prisma } from "@/lib/prisma"

export async function getSettings() {
  let settings = await prisma.companySettings.findUnique({ where: { id: "default" } })
  if (!settings) {
    settings = await prisma.companySettings.create({ data: { id: "default" } })
  }
  return settings
}

export async function updateSettings(data: { name?: string; address?: string; tin?: string }) {
  return prisma.companySettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  })
}
