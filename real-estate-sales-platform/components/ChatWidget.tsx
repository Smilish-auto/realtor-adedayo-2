"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import type { PublicSettings } from "@/core/types";

type Msg = { role: "bot" | "me"; text: string };

export default function ChatWidget({ cfg }: { cfg: PublicSettings["chatbot"] }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: cfg.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sid, setSid] = useState("anon");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { let id = localStorage.getItem("rad_chat_sid"); if (!id) { id = crypto.randomUUID(); localStorage.setItem("rad_chat_sid", id); } setSid(id); }
    catch { setSid(Math.random().toString(36).slice(2)); }
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim(); if (!text || busy) return;
    setInput(""); setMsgs((m) => [...m, { role: "me", text }]); setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, sessionId: sid }) });
      const d = await r.json().catch(() => ({}));
      setMsgs((m) => [...m, { role: "bot", text: r.ok ? d.reply : d.error || cfg.offlineMessage }]);
    } catch { setMsgs((m) => [...m, { role: "bot", text: cfg.offlineMessage }]); }
    setBusy(false);
  }

  return (
    <div className={`chat chat-${cfg.position}`}>
      {open && (
        <section className="chat-panel" role="dialog" aria-label={cfg.title}>
          <header><div className="chat-avatar"><MessageCircle size={18} /></div><div><strong>{cfg.title}</strong><span>{cfg.subtitle}</span></div><button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></header>
          <div className="chat-body" aria-live="polite">
            {msgs.map((m, i) => <p key={i} className={`bubble bubble-${m.role}`}>{m.text}</p>)}
            {busy && <p className="bubble bubble-bot typing"><i /><i /><i /></p>}
            <div ref={end} />
          </div>
          <form onSubmit={send}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder={cfg.placeholder} maxLength={1000} aria-label="Message" /><button type="submit" disabled={busy || !input.trim()} aria-label="Send"><Send size={17} /></button></form>
        </section>
      )}
      <button className="chat-launcher gloss" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close chat" : "Open chat"} aria-expanded={open}>
        {open ? <X size={22} /> : <MessageCircle size={22} />}{!open && cfg.launcherLabel && <span>{cfg.launcherLabel}</span>}
      </button>
    </div>
  );
}
