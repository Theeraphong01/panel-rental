import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  if (session) {
    if (session.user?.role === "admin") redirect("/admin");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-200/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-bold text-lg tracking-tight">Panel<span className="text-violet-600">Rental</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">เข้าสู่ระบบ</Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 h-9 px-5 text-sm font-medium hover:opacity-90 transition-opacity">สมัครฟรี</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/40 via-transparent to-transparent dark:from-violet-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 dark:bg-violet-950/50 dark:border-violet-800 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            เปิดร้านได้ใน 5 นาที — ไม่ต้องเขียนโค้ด
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
            เปิดร้าน
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> SMM Panel </span>
            ของคุณเอง
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            แพลตฟอร์ม White-Label ให้คุณเปิดหน้าร้านขายบริการปั้มไลค์ ผู้ติดตาม วิว แบบครบวงจร
            ใช้ API Key ของคุณเอง จัดการราคา ธีม สมาชิกเอง 100%
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl bg-violet-600 text-white h-12 px-8 text-base font-semibold hover:bg-violet-700 shadow-lg shadow-violet-600/25 transition-all hover:shadow-xl hover:shadow-violet-600/30 active:scale-[0.98]">เริ่มต้นใช้งานฟรี →</Link>
            <Link href="#features" className="inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-12 px-8 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">ดูฟีเจอร์</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "API รองรับ", value: "20+" },
            { label: "รูปแบบบริการ", value: "5,000+" },
            { label: "ร้านค้าเปิดแล้ว", value: "150+" },
            { label: "ออเดอร์ต่อวัน", value: "50,000+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{s.value}</div>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">ทุกอย่างที่คุณต้องการ</h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">ระบบจัดการร้าน SMM Panel แบบครบวงจร พร้อมฟีเจอร์ระดับ Enterprise</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🔌",
                title: "API Key ของคุณเอง",
                desc: "รองรับ SMM Panel API ทุกเจ้า — PumLF, SMMGen, SMMFollows และอื่นๆ ตั้งค่าราคาและส่วนต่างเอง",
              },
              {
                icon: "🎨",
                title: "ธีมปรับแต่งได้",
                desc: "เลือกธีมสำเร็จรูปหรือ Custom CSS ทั้งหมด ปรับสี ฟอนต์ โลโก้ ให้เป็นแบรนด์ของคุณ",
              },
              {
                icon: "👥",
                title: "จัดการสมาชิก",
                desc: "ระบบสมาชิกในตัว — สร้างบัญชีลูกค้า เติมเงิน ติดตามออเดอร์ และประวัติธุรกรรม",
              },
              {
                icon: "⚡",
                title: "Sync อัตโนมัติ",
                desc: "ซิงค์สถานะออเดอร์ทุก 3 นาที อัพเดตบริการทุก 1 ชั่วโมง — ไม่ต้อง manual",
              },
              {
                icon: "🛡️",
                title: "ปลอดภัยสูงสุด",
                desc: "API Key เข้ารหัส AES-256-GCM แบบ server-side proxy + Rate Limiting + 8 ชั้นป้องกัน spam",
              },
              {
                icon: "📱",
                title: "Responsive 100%",
                desc: "รองรับทุกอุปกรณ์ — มือถือ แท็บเล็ต เดสก์ท็อป ใช้งานได้ทุกที่ทุกเวลา",
              },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">เริ่มต้นใน 3 ขั้นตอน</h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">ง่ายกว่าที่คิด — ไม่ต้องติดตั้งอะไรเลย</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "สมัคร + เติม API", desc: "สร้างบัญชีฟรี ใส่ API Key ของ SMM Panel ที่คุณมีอยู่" },
              { step: "2", title: "ตั้งค่าร้าน", desc: "เลือกราคา ธีม ตั้งค่าโดเมนย่อย — ปรับแต่งให้เป็นแบรนด์ของคุณ" },
              { step: "3", title: "เริ่มขาย!", desc: "ส่งลิงก์ให้ลูกค้า รับออเดอร์ ระบบจัดการทุกอย่างอัตโนมัติ" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-lg font-bold text-violet-700 dark:text-violet-300">{s.step}</div>
                <h3 className="mt-4 font-semibold text-lg text-zinc-900 dark:text-zinc-100">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">แพ็คเกจราคา</h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">เลือกระดับที่เหมาะกับธุรกิจคุณ</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Basic",
                price: "499",
                desc: "สำหรับมือใหม่",
                features: ["3 API Keys", "สมาชิกสูงสุด 100 คน", "ธีมฟรี 1 ธีม", "ซับโดเมนฟรี", "ซิงค์อัตโนมัติ"],
              },
              {
                name: "Pro",
                price: "999",
                desc: "สำหรับร้านที่กำลังโต",
                features: ["10 API Keys", "สมาชิกสูงสุด 500 คน", "3 ธีม + พรีเมียม", "Domain ตัวเอง", "ระบบซองอั่งเปา", "ตรวจสลิปอัตโนมัติ"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "1,999",
                desc: "สำหรับธุรกิจขนาดใหญ่",
                features: ["ไม่จำกัด API Keys", "ไม่จำกัดสมาชิก", "ทุกธีม + Custom CSS", "API Access", "Priority Support", "Custom Features"],
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col ${
                  pkg.popular
                    ? "border-violet-600 bg-violet-50/50 dark:bg-violet-950/20 shadow-xl shadow-violet-600/10 scale-[1.02]"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 text-white px-3 py-0.5 text-xs font-semibold">ยอดนิยม</div>
                )}
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{pkg.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{pkg.desc}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">฿{pkg.price}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm">/เดือน</span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-violet-600 font-bold mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 inline-flex items-center justify-center rounded-lg h-10 px-6 text-sm font-semibold transition-all ${
                    pkg.popular
                      ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-600/25"
                      : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  เริ่มใช้งาน
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 bg-zinc-900 dark:bg-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">พร้อมเปิดร้านหรือยัง?</h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">สมัครฟรีวันนี้ ไม่มีค่าใช้จ่ายแอบแฝง ยกเลิกเมื่อไหร่ก็ได้</p>
          <Link href="/signup" className="mt-8 inline-flex items-center justify-center rounded-xl bg-violet-600 text-white h-12 px-10 text-base font-semibold hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-all">สมัครฟรีเลย →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">P</div>
              <span className="font-bold text-base">PanelRental</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">แพลตฟอร์ม White-Label SMM Panel อันดับ 1 ของไทย</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">ลิงก์</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="#features" className="hover:text-violet-600 transition-colors">ฟีเจอร์</Link></li>
              <li><Link href="#pricing" className="hover:text-violet-600 transition-colors">ราคา</Link></li>
              <li><Link href="/signin" className="hover:text-violet-600 transition-colors">เข้าสู่ระบบ</Link></li>
              <li><Link href="/signup" className="hover:text-violet-600 transition-colors">สมัครสมาชิก</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">ติดต่อ</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li>Line: @panelrental</li>
              <li>Email: support@panel-rental.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400">
          © 2026 PanelRental. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
