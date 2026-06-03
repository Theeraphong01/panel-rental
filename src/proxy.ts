import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantByHost } from "@/lib/storefront";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;
  const host = req.headers.get("host") || "";

  // --- Storefront routes: resolve tenant from subdomain ---
  const isStorefront = pathname.startsWith("/store") || pathname.startsWith("/api/storefront");

  if (isStorefront) {
    const tenant = await getTenantByHost(host);
    if (!tenant) {
      if (pathname.startsWith("/api/storefront")) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (tenant.status === "suspended") {
      if (pathname.startsWith("/api/storefront")) {
        return NextResponse.json({ error: "Account suspended" }, { status: 403 });
      }
      return NextResponse.rewrite(new URL("/store/suspended", req.url));
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-tenant-id", tenant.id);
    requestHeaders.set("x-tenant-name", tenant.name);
    requestHeaders.set("x-tenant-status", tenant.status);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self';"
    );
    return response;
  }

  // --- Admin / Dashboard auth gates ---
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  if (pathname.startsWith("/dashboard") && !isAuth) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Global security headers for all routes
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/store/:path*",
    "/api/storefront/:path*",
  ],
};
