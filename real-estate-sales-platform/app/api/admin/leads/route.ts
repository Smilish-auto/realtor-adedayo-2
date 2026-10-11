import { NextResponse } from "next/server";
import { adminConfigured, isAdmin } from "@/core/auth";
import { getLeads } from "@/core/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try { return NextResponse.json({ leads: await getLeads() }); }
  catch (e) { console.error(e); return NextResponse.json({ error: "Could not load leads." }, { status: 500 }); }
}
