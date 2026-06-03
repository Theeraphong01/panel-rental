import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import { SmmPanelClient } from "./smm-panel";

export async function syncServices() {
  const apiKeys = await prisma.apiKey.findMany({
    where: { isActive: true },
    include: { services: { where: { isActive: true } } },
  });

  let totalDisabled = 0;
  let totalUpdated = 0;

  for (const apiKey of apiKeys) {
    try {
      const plainKey = decrypt(apiKey.apiKeyEncrypted);
      const client = new SmmPanelClient(apiKey.panelUrl, plainKey);
      const liveServices = await client.services();

      const liveIds = new Set(liveServices.map((s) => s.service));

      for (const dbService of apiKey.services) {
        if (!liveIds.has(dbService.serviceId)) {
          await prisma.storefrontService.update({
            where: { id: dbService.id },
            data: { isActive: false },
          });
          totalDisabled++;

          await prisma.notification.create({
            data: {
              recipientType: "tenant",
              recipientId: apiKey.tenantId,
              type: "service_removed",
              title: "บริการถูกปิดโดยอัตโนมัติ",
              message: `บริการ "${dbService.name}" (ID: ${dbService.serviceId}) ถูกลบจาก panel — ระบบปิดอัตโนมัติ`,
              link: "/dashboard/services",
            },
          });
        } else {
          const live = liveServices.find((s) => s.service === dbService.serviceId);
          if (live && parseFloat(live.rate) !== dbService.panelRate) {
            await prisma.storefrontService.update({
              where: { id: dbService.id },
              data: { panelRate: parseFloat(live.rate) },
            });
            totalUpdated++;
          }
        }
      }

      // Log sync activity
      await prisma.activityLog.create({
        data: {
          tenantId: apiKey.tenantId,
          action: "service.sync",
          metadata: JSON.stringify({
            apiKeyId: apiKey.id,
            liveCount: liveServices.length,
            dbCount: apiKey.services.length,
            disabled: apiKey.services.filter((s) => !liveIds.has(s.serviceId)).length,
          }),
        },
      });
    } catch (err) {
      console.error(`Service sync failed for api_key ${apiKey.id}:`, err);
    }
  }

  return { apis: apiKeys.length, disabled: totalDisabled, updated: totalUpdated };
}
