import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";

export { COOKIE_NAME };

export const DEMO_OWNER = {
  email: "owner@pbg.agency",
  password: "pulse2026",
  name: "Director de Agencia",
  role: "agency_owner",
};

function secret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "pbg-owner-intelligence-demo-secret",
  );
}

export type SessionPayload = {
  sub: string;
  name: string;
  role: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload as SessionPayload & { exp: number; iat: number };
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}
