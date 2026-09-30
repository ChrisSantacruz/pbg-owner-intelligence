import { NextResponse } from "next/server";
import { COOKIE_NAME, DEMO_OWNER, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (email !== DEMO_OWNER.email || password !== DEMO_OWNER.password) {
    return NextResponse.json(
      { ok: false, error: "Credenciales inválidas." },
      { status: 401 },
    );
  }

  const token = await signSession({
    sub: DEMO_OWNER.email,
    name: DEMO_OWNER.name,
    role: DEMO_OWNER.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
