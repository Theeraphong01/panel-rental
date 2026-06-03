// In-memory rate limiter — resets on server restart, acceptable for moderate traffic
const orderLimits = new Map<string, { count: number; resetAt: number }>();
const refreshLimits = new Map<string, { count: number; resetAt: number }>();
const orderCooldowns = new Map<string, number>();

const MAX_ORDERS_PER_MIN = 5;
const MAX_REFRESHES_PER_MIN = 10;
const ORDER_COOLDOWN_MS = 30_000; // 30 seconds per service
const SLIP_LIMIT_PER_HOUR = 3;

export function checkOrderLimit(endUserId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = orderLimits.get(endUserId);
  if (!entry || now > entry.resetAt) {
    orderLimits.set(endUserId, { count: 1, resetAt: now + 60_000 });
    return { ok: true };
  }
  if (entry.count >= MAX_ORDERS_PER_MIN) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true };
}

export function checkRefreshLimit(endUserId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const entry = refreshLimits.get(endUserId);
  if (!entry || now > entry.resetAt) {
    refreshLimits.set(endUserId, { count: 1, resetAt: now + 60_000 });
    return { ok: true };
  }
  if (entry.count >= MAX_REFRESHES_PER_MIN) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true };
}

export function checkOrderCooldown(endUserId: string, serviceId: string): { ok: true } | { ok: false; retryAfter: number } {
  const key = `${endUserId}:${serviceId}`;
  const lastOrder = orderCooldowns.get(key);
  const now = Date.now();
  if (lastOrder && now - lastOrder < ORDER_COOLDOWN_MS) {
    return { ok: false, retryAfter: Math.ceil((ORDER_COOLDOWN_MS - (now - lastOrder)) / 1000) };
  }
  orderCooldowns.set(key, now);
  return { ok: true };
}

// Slip submission rate limit (per user)
const slipCounts = new Map<string, { count: number; resetAt: number }>();
export function checkSlipLimit(endUserId: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = slipCounts.get(endUserId);
  if (!entry || now > entry.resetAt) {
    slipCounts.set(endUserId, { count: 1, resetAt: now + 3_600_000 });
    return { ok: true };
  }
  if (entry.count >= SLIP_LIMIT_PER_HOUR) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true };
}
