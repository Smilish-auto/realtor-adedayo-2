import { NextResponse } from "next/server";
import { adminConfigured, isAdmin } from "@/core/auth";
import { getSettings, saveSettings, storageMode } from "@/core/store";
import { sanitizeSettings } from "@/core/settings";

export const dynamic = "force-dynamic";

function guard() {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET() {
  const g = guard(); if (g) return g;
  return NextResponse.json({ settings: await getSettings(), storage: storageMode, onVercel: !!process.env.VERCEL, emailReady: !!process.env.RESEND_API_KEY });
}

export async function PUT(req: Request) {
  const g = guard(); if (g) return g;
  if (!(req.headers.get("content-type") || "").includes("application/json")) return NextResponse.json({ error: "Bad content type" }, { status: 415 });
  const raw = await req.text();
  if (raw.length > 800_000) return NextResponse.json({ error: "Settings too large." }, { status: 413 });
  let body: unknown; try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const settings = sanitizeSettings(body);
  try { await saveSettings(settings); }
  catch (e) {
    console.error("saveSettings failed", e);
    return NextResponse.json({ error: process.env.VERCEL && storageMode === "file"
      ? "Can't save: this host has a read-only disk. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (and run the SQL in supabase/schema.sql)."
      : "Could not save settings. Check your server logs." }, { status: 500 });
  }
  return NextResponse.json({ settings });
}
