import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    if (session.user?.role === "admin") redirect("/admin");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          เปิดร้าน SMM Panel ของคุณ
          <br />
          <span className="text-primary">ใน 5 นาที</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          แพลตฟอร์มให้เช่าเว็บปั้มไลค์ White-Label 
          ใช้ API Key ของคุณเอง จัดการทุกอย่างเอง 100%
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { title: "Basic", price: "฿499", features: ["3 API Keys", "100 สมาชิก", "1 ธีมฟรี"] },
            { title: "Pro", price: "฿999", features: ["10 API Keys", "500 สมาชิก", "3 ธีม + พรีเมียม", "Domain ตัวเอง"] },
            { title: "Enterprise", price: "฿1,999", features: ["ไม่จำกัด API Keys", "ไม่จำกัดสมาชิก", "ทุกธีม", "API Access"] },
          ].map((pkg) => (
            <div key={pkg.title} className="border rounded-xl p-6 text-left hover:border-primary transition-colors">
              <h3 className="font-semibold text-lg">{pkg.title}</h3>
              <p className="text-3xl font-bold my-2">{pkg.price}<span className="text-sm font-normal text-muted-foreground">/เดือน</span></p>
              <ul className="text-sm text-muted-foreground space-y-1 mt-3">
                {pkg.features.map((f) => <li key={f}>✓ {f}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <a href="/signup" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-8 text-sm font-medium hover:bg-primary/90">
            เริ่มต้นใช้งาน
          </a>
          <a href="/signin" className="inline-flex items-center justify-center rounded-md border h-10 px-8 text-sm font-medium hover:bg-accent">
            เข้าสู่ระบบ
          </a>
        </div>
      </div>
    </div>
  );
}
