import { NextResponse } from "next/server";
import { getSettings, addLead } from "@/core/store";
import { notifyLead } from "@/core/notify";
import { ipOf, limited } from "@/core/rate";

export const dynamic = "force-dynamic";
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  if (limited("lead:" + ipOf(req), 5, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (clean(b.website, 100)) return NextResponse.json({ ok: true }); // honeypot: bots fill this, humans never see it

  const lead = {
    name: clean(b.name, 120), phone: clean(b.phone, 40), email: clean(b.email, 200), budget: clean(b.budget, 100),
    timeline: clean(b.timeline, 60), property: clean(b.property, 200), notes: clean(b.notes, 2000)
  };
  if (!lead.name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (lead.phone.replace(/\D/g, "").length < 6) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const message = [lead.property && `Property: ${lead.property}`, lead.budget && `Budget: ${lead.budget}`, lead.notes].filter(Boolean).join("\n");
  try { await addLead({ name: lead.name, phone: lead.phone, email: lead.email, timeline: lead.timeline, message }); }
  catch (e) { console.error("addLead failed", e); /* still try to notify so the lead is not lost */ }
  const s = await getSettings();
  await notifyLead(s, lead);
  return NextResponse.json({ ok: true });
}
