"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Wallet,
  Edit3,
  Check,
  X,
  Clock,
  Shield,
  LogOut,
} from "lucide-react";

type Profile = {
  id: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
};

export default function ProfilePage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

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

  const fetchTransactions = () => {
    const token = localStorage.getItem("storefront_token");
    if (!token) return;
    fetch("/api/storefront/transactions?limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .finally(() => setLoadingTx(false));
  };

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, [subdomain, router]);

  const saveName = async () => {
    const token = localStorage.getItem("storefront_token");
    setSaving(true);
    setMsg("");
    try {
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
        setMsg("✅ Profile updated successfully");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ An error occurred");
    }
    setSaving(false);
  };

  const logout = () => {
    localStorage.removeItem("storefront_token");
    router.push(`/store/${subdomain}`);
  };

  if (!profile) {
    return (
      <div className="dark space-y-4">
        <Card className="bg-[#1F293D] border-[#2A364F] p-8 animate-pulse">
          <div className="h-8 bg-[#2A364F] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[#2A364F] rounded w-2/3" />
        </Card>
      </div>
    );
  }

  return (
    <div className="dark space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Avatar + Name */}
      <Card className="bg-[#1F293D] border-[#2A364F] p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#00E676] flex items-center justify-center text-2xl font-bold text-[#0B0F19]">
            {profile.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#121824] border-[#2A364F] text-white h-9 text-lg font-semibold"
                  autoFocus
                />
                <Button
                  size="sm"
                  className="bg-[#00E676] hover:bg-[#00E676]/90 text-white h-9 w-9 p-0"
                  onClick={saveName}
                  disabled={saving}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#2A364F] text-[#94A3B8] h-9 w-9 p-0"
                  onClick={() => {
                    setEditing(false);
                    setName(profile.name);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white truncate">
                  {profile.name}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-[#94A3B8] hover:text-[#00F0FF] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-[#94A3B8] text-sm flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#1F293D] to-[#121824] border-[#00E676]/30 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[#94A3B8] text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Current Balance
            </p>
            <p className="text-3xl font-bold text-[#00E676]">
              ${profile.balance.toFixed(2)}
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-[#00E676]/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-[#00E676]" />
          </div>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="bg-[#1F293D] border-[#2A364F] p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00F0FF]" />
          Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[#2A364F]">
            <span className="text-[#94A3B8] text-sm">User ID</span>
            <span className="text-white text-sm font-mono">
              {profile.id.slice(0, 12)}...
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#2A364F]">
            <span className="text-[#94A3B8] text-sm">Email</span>
            <span className="text-white text-sm">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#2A364F]">
            <span className="text-[#94A3B8] text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined
            </span>
            <span className="text-white text-sm">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[#94A3B8] text-sm">Balance</span>
            <span className="text-[#00E676] font-semibold text-sm">
              ${profile.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="bg-[#1F293D] border-[#2A364F] p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#94A3B8]" />
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx: any) => (
              <div
                key={tx.id}
                className="flex justify-between items-center py-2 border-b border-[#2A364F] last:border-0"
              >
                <div>
                  <p className="text-white text-sm">{tx.description || tx.type}</p>
                  <p className="text-[#94A3B8] text-xs">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`font-semibold text-sm ${
                    tx.amount > 0 ? "text-[#00E676]" : "text-red-400"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}${(tx.amount || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        onClick={logout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

      {msg && (
        <p
          className={`text-sm rounded-lg p-3 ${
            msg.startsWith("✅")
              ? "bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
