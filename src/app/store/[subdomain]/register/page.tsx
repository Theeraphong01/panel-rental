"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Zap,
  AlertCircle,
  Store,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function RegisterPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/storefront/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("storefront_token", data.token);
        router.push(`/store/${subdomain}`);
      } else {
        setMsg(data.error || "Registration failed");
      }
    } catch {
      setMsg("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="dark min-h-[70vh] flex items-center justify-center py-12">
      <Card className="bg-[#1F293D] border-[#2A364F] p-8 w-full max-w-md shadow-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#00E676] items-center justify-center mb-4">
            <Store className="w-6 h-6 text-[#0B0F19]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            Join and start ordering services
          </p>
        </div>

        {/* Form */}
        <form onSubmit={register} className="space-y-4">
          {/* Name */}
          <label className="block">
            <span className="text-sm font-medium text-white mb-1.5 block">
              Name
            </span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="pl-10 bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8] h-11"
              />
            </div>
          </label>

          {/* Email */}
          <label className="block">
            <span className="text-sm font-medium text-white mb-1.5 block">
              Email
            </span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="pl-10 bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8] h-11"
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-sm font-medium text-white mb-1.5 block">
              Password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="At least 6 characters"
                className="pl-10 bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8] h-11"
              />
            </div>
          </label>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#121824] rounded-lg p-3">
            <Shield className="w-4 h-4 text-[#00E676] flex-shrink-0" />
            <span>
              We never ask for passwords. Your data is safe &amp; secure.
            </span>
          </div>

          {/* Error msg */}
          {msg && (
            <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0B0F19] font-semibold h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0B0F19]/30 border-t-[#0B0F19] rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2A364F]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#1F293D] px-3 text-[#94A3B8]">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login link */}
        <Link href={`/store/${subdomain}/login`}>
          <Button
            variant="outline"
            className="w-full border-[#2A364F] text-white hover:bg-[#2A364F] h-11"
          >
            <span className="flex items-center gap-2">
              Login
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href={`/store/${subdomain}`}
            className="text-sm text-[#94A3B8] hover:text-[#00F0FF] transition-colors"
          >
            ← Back to store
          </Link>
        </div>
      </Card>
    </div>
  );
}
