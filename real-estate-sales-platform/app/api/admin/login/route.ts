import { NextResponse } from "next/server";
import { COOKIE, SESSION_MS, adminConfigured, makeToken, passwordOk } from "@/core/auth";
import { ipOf, limited } from "@/core/rate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (limited("login:" + ipOf(req), 6, 15 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (typeof b?.password !== "string" || !passwordOk(b.password)) return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MS / 1000 });
  return res;
}
