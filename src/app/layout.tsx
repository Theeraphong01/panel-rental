import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/auth-provider";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panel Rental — แพลตฟอร์มให้เช่าเว็บ SMM Panel",
  description: "เปิดร้าน SMM Panel ของคุณใน 5 นาที ด้วย API key ของคุณเอง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
