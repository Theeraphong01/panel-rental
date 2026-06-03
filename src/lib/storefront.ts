import { prisma } from "./prisma";

export async function getTenantByHost(host: string) {
  // Strip port if present
  const hostname = host.split(":")[0];

  // Try exact subdomain match
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        name: true,
        status: true,
        topupMethods: true,
        themeConfig: {
          include: { theme: true },
        },
      },
    });
    if (tenant) return tenant;
  }

  // Fallback: check custom domains
  const domain = await prisma.customDomain.findUnique({
    where: { domain: hostname },
    include: {
      tenant: {
        select: {
          id: true,
          subdomain: true,
          name: true,
          status: true,
          topupMethods: true,
          themeConfig: {
            include: { theme: true },
          },
        },
      },
    },
  });
  return domain?.tenant ?? null;
}
