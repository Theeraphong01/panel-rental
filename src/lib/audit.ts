import { prisma } from "./prisma";

type LogAction = string;
type LogTarget = "service" | "order" | "slip" | "end_user" | "api_key" | "tenant";

export async function logActivity(params: {
  tenantId: string;
  userId?: string;
  action: LogAction;
  targetType?: LogTarget;
  targetId?: string;
  metadata?: Record<string, any>;
}) {
  return prisma.activityLog.create({
    data: {
      tenantId: params.tenantId,
      userId: params.userId ?? null,
      action: params.action,
      targetType: params.targetType ?? null,
      targetId: params.targetId ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
