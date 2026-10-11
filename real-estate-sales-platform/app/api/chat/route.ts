import { NextResponse } from "next/server";
import { getSettings } from "@/core/store";
import { ipOf, limited } from "@/core/rate";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick(d: any, depth = 0): string | null {
  if (typeof d === "string") return d.trim() || null;
  if (Array.isArray(d)) return d.length ? pick(d[0], depth) : null;
  if (d && typeof d === "object" && depth < 3) {
    for (const k of ["output", "reply", "text", "message", "response", "answer"]) if (typeof d[k] === "string" && d[k].trim()) return d[k];
    for (const k of ["data", "json", "body"]) if (d[k]) { const r = pick(d[k], depth + 1); if (r) return r; }
  }
  return null;
}

export async function POST(req: Request) {
  const s = await getSettings();
  const c = s.chatbot;
  if (!c.enabled || !c.webhookUrl) return NextResponse.json({ error: c.offlineMessage }, { status: 503 });
  if (limited("chat:" + ipOf(req), 30, 10 * 60 * 1000)) return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment." }, { status: 429 });
  const b = await req.json().catch(() => null);
  const message = typeof b?.message === "string" ? b.message.trim().slice(0, 1000) : "";
  const sessionId = typeof b?.sessionId === "string" ? b.sessionId.slice(0, 80) : "anon";
  if (!message) return NextResponse.json({ error: "Empty message." }, { status: 400 });
  try {
    const r = await fetch(c.webhookUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      // chatInput + sessionId match n8n's chat conventions; message is there for any other tool
      body: JSON.stringify({ message, chatInput: message, sessionId, source: "website" }), signal: AbortSignal.timeout(25000)
    });
    const raw = await r.text();
    if (!r.ok) throw new Error("webhook status " + r.status);
    let reply: string | null = null;
    try { reply = pick(JSON.parse(raw)); } catch { reply = raw.trim() || null; }
    return NextResponse.json({ reply: reply || "Thanks! We received your message." });
  } catch (e) {
    console.error("chat webhook failed", e);
    return NextResponse.json({ error: c.offlineMessage }, { status: 502 });
  }
}
