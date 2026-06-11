import { prisma } from "@/lib/prisma"

export async function createAuditLog(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: string
  batchId?: string
}) {
  return prisma.auditLog.create({ data: params })
}

export async function getAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function getAuditLogsByBatch(batchId: string) {
  return prisma.auditLog.findMany({
    where: { batchId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })
}
