import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "dev-jwt-secret-change-me"
);

export async function signEndUserToken(payload: {
  id: string;
  tenantId: string;
  email: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyEndUserToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as { id: string; tenantId: string; email: string };
}
