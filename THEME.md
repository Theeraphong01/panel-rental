# 🎨 PanelRental ธีม — AI Developer Guide

> เวอร์ชัน 1.0 — สำหรับ AI และ Developer ที่ต้องการสร้าง/แก้ไขธีม

## How Themes Work

```
Theme (prisma) → ThemeConfig (per tenant) → Storefront Layout
                       ├── themeId        → ใช้ไฟล์ CSS ไหน
                       ├── primaryColor    → CSS variable --primary
                       ├── logoUrl         → รูป logo ร้าน
                       └── customCss       → CSS override อิสระ
```

**หลักการ:**
- 1 ร้าน = 1 ThemeConfig
- ThemeConfig ชี้ไป Theme (เลือกธีมที่ใช้)
- `primaryColor` ถูก inject เป็น CSS variable `--primary` → เปลี่ยนสีทั้งร้านได้ทันที
- `customCss` คือ CSS ดิบ — inject ตรงๆ เข้า storefront — override อะไรก็ได้
- `logoUrl` แสดงบน header ของ storefront

## Creating a New Theme

### Step 1: Add Theme to Database

```sql
-- or via Admin → Themes
INSERT INTO Theme (id, name, description, isPremium, priceMonthly, isActive)
VALUES ('my-theme', 'My Theme', 'คำอธิบายธีม', false, null, true);
```

### Step 2: Create CSS File (optional)

ถ้าธีมต้องการ CSS ใหม่:

```
src/styles/themes/my-theme.css
```

แล้ว inject ผ่าน `customCss` ใน ThemeConfig หรือเพิ่ม log
ic ใน storefront layout ให้โหลด CSS file ตาม themeId

### Step 3: Test

ไปที่ Dashboard → Theme → เลือกธีมใหม่ → ดูผลบน storefront

---

## ThemeConfig — Fields You Can Use

| Field | Type | Description |
|-------|------|-------------|
| `themeId` | FK → Theme | ชี้ไปธีมที่ใช้ |
| `primaryColor` | Hex color | `--primary` CSS variable |
| `logoUrl` | URL path | `/uploads/logos/...` |
| `customCss` | Raw CSS | inject เข้า `<style>` tag โดยตรง |

---

## CSS Variables Available in Storefront

CSS variables ที่มีอยู่ใน storefront.css:

```css
--primary: #000000;  /* มาจาก ThemeConfig.primaryColor */
```

**Pages ที่ใช้ `--primary`:**
- `src/app/store/[subdomain]/layout.tsx` — header, nav
- `src/app/store/[subdomain]/page.tsx` — category tabs, buttons
- `src/app/store/[subdomain]/topup/page.tsx` — package cards
- `src/app/store/[subdomain]/profile/page.tsx` — balance box

---

## Extending the Theme System

### Adding new CSS variable

1. Add field in `ThemeConfig` model (prisma/schema.prisma)
2. Update Dashboard → Theme API to save/load the field
3. Inject in storefront layout: `style={{ "--my-var": themeConfig.myField }}`
4. Use in CSS: `color: var(--my-var);`

### Adding theme-level CSS file

1. Create `src/styles/themes/[themeId].css`
2. In storefront layout, check `themeConfig.themeId` and import the CSS
3. Or use `customCss` field to paste the entire CSS directly (simpler for non-coders)

### Premium Themes

- `Theme.isPremium = true` → ต้อง subscribe ก่อนใช้งาน
- `Theme.priceMonthly` → ค่าเช่าธีมต่อเดือน
- Tenant ที่มี `Package.premiumThemes = true` → ใช้ premium themes ได้ฟรี

---

## Quick Reference: Files You May Need to Touch

| Purpose | File |
|---------|------|
| Theme model | `prisma/schema.prisma` → Theme, ThemeConfig |
| Theme API (admin) | `src/app/api/admin/themes/route.ts` |
| Theme API (dashboard) | `src/app/api/dashboard/theme/route.ts` |
| Storefront layout | `src/app/store/[subdomain]/layout.tsx` |
| Storefront CSS | `src/styles/storefront.css` |
| Theme deploy guides | `prisma/schema.prisma` → ThemeDeployGuide |
| New theme CSS | `src/styles/themes/[id].css` (create this) |

---

## 🚀 Coming Soon — Theme Marketplace

เร็วๆ นี้:
- หน้า marketplace ให้ tenant เลือกซื้อธีม
- ธีม premium แบบ subscription
- Preview ธีมก่อนซื้อ
- AI-assisted theme builder

---

## Example: Create a "Pink" Theme

```typescript
// 1. Add to DB
await prisma.theme.create({
  data: {
    id: 'pink',
    name: 'Pink',
    description: 'ธีมสีชมพูหวาน',
    isPremium: true,
    priceMonthly: 99,
  }
});

// 2. Add deploy guide
await prisma.themeDeployGuide.create({
  data: {
    themeId: 'pink',
    stepOrder: 1,
    title: 'ปรับสีชมพู',
    description: 'ใช้ primaryColor = #ec4899',
    targetFile: 'ThemeConfig',
    codeSnippet: `await prisma.themeConfig.update({
  where: { tenantId },
  data: { themeId: 'pink', primaryColor: '#ec4899' }
});`,
  }
});
```

**เท่านี้ tenant ก็เลือกธีม Pink แล้วใช้สี #ec4899 ได้ทันที**
