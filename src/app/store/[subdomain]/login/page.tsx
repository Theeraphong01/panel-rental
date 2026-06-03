"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LogIn,
  Mail,
  Lock,
  Zap,
  AlertCircle,
  Store,
  ArrowRight,
} from "lucide-react";

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
        setMsg(data.error || "Login failed");
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
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            Login to your store account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={login} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="pl-10 bg-[#121824] border-[#2A364F] text-white placeholder:text-[#94A3B8] h-11"
              />
            </div>
          </label>

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
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
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
              Don't have an account?
            </span>
          </div>
        </div>

        {/* Register link */}
        <Link href={`/store/${subdomain}/register`}>
          <Button
            variant="outline"
            className="w-full border-[#2A364F] text-white hover:bg-[#2A364F] h-11"
          >
            <span className="flex items-center gap-2">
              Create Account
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
