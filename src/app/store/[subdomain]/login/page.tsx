"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("storefront_token", data.token);
        router.push(`/store/${subdomain}`);
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>เข้าสู่ระบบ</h1>
        <form onSubmit={login}>
          <label>
            อีเมล
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </label>
          <label>
            รหัสผ่าน
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 16 }}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        {msg && <p className="msg">{msg}</p>}
        <p className="auth-switch">
          ยังไม่มีบัญชี?{" "}
          <Link href={`/store/${subdomain}/register`}>สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
