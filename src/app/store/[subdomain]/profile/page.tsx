"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Profile = { id: string; email: string; name: string; balance: number; createdAt: string };

export default function ProfilePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const fetchProfile = () => {
    const token = localStorage.getItem("storefront_token");
    if (!token) {
      router.push(`/store/${subdomain}/login`);
      return;
    }
    fetch("/api/storefront/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
        } else {
          localStorage.removeItem("storefront_token");
          router.push(`/store/${subdomain}/login`);
        }
      });
  };

  useEffect(fetchProfile, [subdomain, router]);

  const saveName = async () => {
    const token = localStorage.getItem("storefront_token");
    const res = await fetch("/api/storefront/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data.user);
      setEditing(false);
      setMsg("✅ อัพเดทโปรไฟล์เรียบร้อย");
    } else {
      setMsg(`❌ ${data.error}`);
    }
  };

  if (!profile) return <div className="skeleton-card" />;

  return (
    <div className="profile-page">
      <h1>โปรไฟล์</h1>
      <div className="profile-card">
        <div className="balance-box">
          <span>ยอดเงินคงเหลือ</span>
          <strong>฿{profile.balance.toLocaleString()}</strong>
        </div>
        <div className="profile-fields">
          <div className="pf-row">
            <span>อีเมล</span>
            <span>{profile.email}</span>
          </div>
          <div className="pf-row">
            <span>ชื่อ</span>
            {editing ? (
              <div className="inline-edit">
                <input value={name} onChange={(e) => setName(e.target.value)} />
                <button onClick={saveName} style={{ background: "var(--primary)" }}>
                  บันทึก
                </button>
                <button onClick={() => setEditing(false)}>ยกเลิก</button>
              </div>
            ) : (
              <span>
                {profile.name}{" "}
                <button className="btn-link" onClick={() => setEditing(true)}>
                  แก้ไข
                </button>
              </span>
            )}
          </div>
          <div className="pf-row">
            <span>สมัครเมื่อ</span>
            <span>{new Date(profile.createdAt).toLocaleDateString("th")}</span>
          </div>
        </div>
        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}
