import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/constants";

function secret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "pbg-owner-intelligence-demo-secret",
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secret());
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (pathname.startsWith("/dashboard") && !valid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if ((pathname === "/login" || pathname === "/") && valid) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
