import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@panel-rental.com' },
    update: {},
    create: { email: 'admin@panel-rental.com', passwordHash: adminPassword, name: 'Admin', role: 'admin' },
  });

  // Combo Packages (เช่าเว็บ + สลิป)
  const packages = [
    { id: 'combo-1', name: 'Combo 1: Starter', priceMonthly: 29900, maxApiKeys: 3, maxEndUsers: 200, slipQuota: 200, packageType: 'combo' },
    { id: 'combo-2', name: 'Combo 2: Growth', priceMonthly: 38900, maxApiKeys: 5, maxEndUsers: 500, slipQuota: 450, packageType: 'combo' },
    { id: 'combo-3', name: 'Combo 3: Pro 🔥', priceMonthly: 46900, maxApiKeys: 10, maxEndUsers: 1000, slipQuota: 750, packageType: 'combo' },
    { id: 'combo-4', name: 'Combo 4: VIP 👑', priceMonthly: 59900, maxApiKeys: 999, maxEndUsers: null, slipQuota: 1450, premiumThemes: true, customDomain: true, packageType: 'combo' },
    // Slip Topup Packages (เติมสลิปอย่างเดียว)
    { id: 'slip-1', name: 'BASIC-1 (200 สลิป)', priceMonthly: 99, maxApiKeys: 0, maxEndUsers: 0, slipQuota: 200, packageType: 'slip_topup', isActive: false },
    { id: 'slip-2', name: 'BASIC-2 (450 สลิป)', priceMonthly: 199, maxApiKeys: 0, maxEndUsers: 0, slipQuota: 450, packageType: 'slip_topup', isActive: false },
    { id: 'slip-3', name: 'BASIC-3 (750 สลิป)', priceMonthly: 299, maxApiKeys: 0, maxEndUsers: 0, slipQuota: 750, packageType: 'slip_topup', isActive: false },
    { id: 'slip-4', name: 'BASIC-4 (1,450 สลิป)', priceMonthly: 499, maxApiKeys: 0, maxEndUsers: 0, slipQuota: 1450, packageType: 'slip_topup', isActive: false },
  ];
  for (const pkg of packages) {
    await prisma.package.upsert({ where: { id: pkg.id }, update: pkg, create: pkg });
  }

  // Themes
  const themes = [
    { id: 'default', name: 'Default', description: 'ธีมพื้นฐาน สะอาด เรียบง่าย', isPremium: false },
    { id: 'minimal', name: 'Minimal', description: 'มินิมอล เน้นเนื้อหา', isPremium: false },
    { id: 'dark-gaming', name: 'Dark Gaming', description: 'โทนเข้ม สำหรับสายเกมเมอร์', isPremium: true, priceMonthly: 199 },
    { id: 'neon', name: 'Neon', description: 'สีนีออน สดใส โดดเด่น', isPremium: true, priceMonthly: 199 },
    { id: 'coming-soon', name: 'ธีมใหม่ เร็วๆ นี้', description: 'ธีมพรีเมียมใหม่กำลังพัฒนา', isPremium: true, priceMonthly: 299, isActive: false },
  ];
  for (const theme of themes) {
    await prisma.theme.upsert({ where: { id: theme.id }, update: theme, create: theme });
  }

  // Theme deploy guides (AI-readable instructions)
  const guides = [
    { id: 'guide-1', themeId: 'default', stepOrder: 1, title: 'สลับธีม', description: 'ไปที่ Dashboard → Theme → เลือกธีมที่ต้องการ → กด "ใช้งาน"', targetFile: 'src/app/store/[subdomain]/layout.tsx' },
    { id: 'guide-2', themeId: 'default', stepOrder: 2, title: 'ปรับแต่งสี', description: 'แก้ primaryColor ใน ThemeConfig → CSS variables จะอัพเดททั้ง storefront อัตโนมัติ', targetFile: 'prisma/schema.prisma → ThemeConfig.primaryColor' },
    { id: 'guide-3', themeId: 'default', stepOrder: 3, title: 'เพิ่ม CSS เอง', description: 'customCss ใน ThemeConfig จะถูก inject เข้า storefront โดยตรง — ใช้ override สี/ฟอนต์/ขนาดได้', targetFile: 'src/app/store/[subdomain]/layout.tsx' },
  ];
  for (const g of guides) {
    await prisma.themeDeployGuide.upsert({ where: { id: g.id }, update: g, create: g });
  }

  // System Config defaults
  const sysConfigs = [
    { id: 'slip2go_api_secret', value: '' },
    { id: 'slip2go_base_url', value: 'https://connect.slip2go.com' },
    { id: 'voucher_api_url', value: 'https://pumlf.pum-shop.com/tw/tw_api.php' },
    { id: 'voucher_api_key', value: 'admin' },
    { id: 'cloudflare_api_key', value: '' },
    { id: 'cloudflare_zone_id', value: '' },
  ];
  for (const cfg of sysConfigs) {
    await prisma.systemConfig.upsert({ where: { id: cfg.id }, update: { value: cfg.value }, create: cfg });
  }

  // Demo tenant
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', passwordHash: demoPassword, name: 'Demo Store', role: 'customer' },
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: { userId: demoUser.id, subdomain: 'demo', name: 'Demo SMM Store', status: 'active', slipCredits: 750 },
  });

  await prisma.subscription.upsert({
    where: { id: 'demo-sub' },
    update: {},
    create: { id: 'demo-sub', tenantId: demoTenant.id, packageId: 'combo-3', status: 'active', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });

  await prisma.themeConfig.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: { tenantId: demoTenant.id, themeId: 'default' },
  });

  // Sample bank account
  await prisma.bankAccount.upsert({
    where: { id: 'demo-bank-1' },
    update: {},
    create: { id: 'demo-bank-1', tenantId: demoTenant.id, bankName: 'ธนาคารกสิกรไทย', accountNumber: '1234567890', accountNameTh: 'สมชาย ใจดี', accountNameEn: 'Somchai Jaidee' },
  });

  // Sample contact
  await prisma.contactInfo.upsert({
    where: { id: 'demo-contact-1' },
    update: {},
    create: { id: 'demo-contact-1', tenantId: demoTenant.id, type: 'line', value: '@demostore', label: 'Line Official' },
  });

  console.log('✅ Seed complete!');
  console.log('   Admin: admin@panel-rental.com / admin123');
  console.log('   Demo:  demo@example.com / demo123 (Combo 3: Pro, 750 slips)');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
