import { prisma } from "@/lib/prisma"

export async function getNotifications(limit = 20) {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getUnreadCount() {
  return prisma.notification.count({ where: { read: false } })
}

export async function createNotification(data: {
  type: string
  title: string
  message?: string
  link?: string
}) {
  return prisma.notification.create({ data })
}

export async function markAsRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { read: true } })
}

export async function markAllAsRead() {
  return prisma.notification.updateMany({ where: { read: false }, data: { read: true } })
}
