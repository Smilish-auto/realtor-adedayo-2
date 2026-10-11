"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, LogOut, Plus, Save, Trash2 } from "lucide-react";
import type { Lead, Property, SiteSettings } from "@/core/types";
import { newProperty, rid } from "@/core/settings";

type Path = (string | number)[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIn = (o: any, p: Path) => p.reduce((a, k) => a?.[k], o);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setIn(o: any, p: Path, v: unknown) { const c = structuredClone(o); let cur = c; p.slice(0, -1).forEach((k) => (cur = cur[k])); cur[p[p.length - 1]] = v; return c; }

const TABS = [["general", "General & Theme"], ["hero", "Hero & Videos"], ["properties", "Properties"], ["sections", "Page Text"], ["contact", "Form & Email"], ["chatbot", "Chatbot"], ["leads", "Leads"]] as const;
type Tab = (typeof TABS)[number][0];

export default function AdminPage() {
  const [phase, setPhase] = useState<"loading" | "login" | "unconfigured" | "ready">("loading");
  const [s, setS] = useState<SiteSettings | null>(null);
  const [info, setInfo] = useState({ storage: "file", onVercel: false, emailReady: false });
  const [tab, setTab] = useState<Tab>("general");
  const [pw, setPw] = useState(""); const [loginErr, setLoginErr] = useState("");
  const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [leads, setLeads] = useState<Lead[] | null>(null); const [leadErr, setLeadErr] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/settings");
    if (r.status === 503) return setPhase("unconfigured");
    if (r.status === 401) return setPhase("login");
    const d = await r.json(); setS(d.settings); setInfo({ storage: d.storage, onVercel: d.onVercel, emailReady: d.emailReady }); setPhase("ready");
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  useEffect(() => {
    if (tab !== "leads" || leads) return;
    fetch("/api/admin/leads").then(async (r) => { const d = await r.json(); if (r.ok) setLeads(d.leads); else setLeadErr(d.error || "Could not load leads."); }).catch(() => setLeadErr("Could not load leads."));
  }, [tab, leads]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoginErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) { setPw(""); load(); } else { const d = await r.json().catch(() => ({})); setLoginErr(d.error === "not_configured" ? "Admin password is not configured on the server." : d.error || "Login failed."); }
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setS(null); setPhase("login"); }
  async function save() {
    if (!s) return; setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { setPhase("login"); return; }
      if (!r.ok) throw new Error(d.error || "Save failed.");
      setS(d.settings); setDirty(false); setMsg({ ok: true, text: "Saved. Your website is updated." });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed." }); }
    setSaving(false);
  }

  if (phase === "loading") return <div className="adm-center"><p>Loading…</p></div>;
  if (phase === "unconfigured") return (
    <div className="adm-center"><div className="adm-card"><h1>Set up your admin password</h1>
      <p>Add these environment variables (in <code>.env.local</code> locally, or Vercel → Settings → Environment Variables), then redeploy/restart:</p>
      <pre>{`ADMIN_PASSWORD=choose-a-long-unique-password\nADMIN_SESSION_SECRET=any-long-random-string`}</pre>
      <p className="adm-hint">There is deliberately no default password, so nobody can log in until you set your own.</p></div></div>
  );
  if (phase === "login" || !s) return (
    <div className="adm-center"><form className="adm-card" onSubmit={login}><h1>Admin login</h1><p className="adm-hint">Realtor Adedayo · Website manager</p>
      <label className="adm-f"><span>Password</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" /></label>
      {loginErr && <p className="adm-err" role="alert">{loginErr}</p>}
      <button className="adm-btn adm-primary" type="submit">Sign in</button></form></div>
  );

  /* ---------- field helpers (plain functions, so inputs never lose focus) ---------- */
  const up = (p: Path, v: unknown) => { setS((prev) => (prev ? setIn(prev, p, v) : prev)); setDirty(true); setMsg(null); };
  const txt = (label: string, p: Path, o: { area?: boolean; rows?: number; hint?: string; type?: string; ph?: string } = {}) => {
    const v = getIn(s, p) ?? "";
    return <label className="adm-f" key={p.join(".")}><span>{label}</span>
      {o.area ? <textarea rows={o.rows || 3} value={v} placeholder={o.ph} onChange={(e) => up(p, e.target.value)} /> : <input type={o.type || "text"} value={v} placeholder={o.ph} onChange={(e) => up(p, o.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />}
      {o.hint && <em>{o.hint}</em>}</label>;
  };
  const color = (label: string, p: Path) => { const v = getIn(s, p) as string; return <label className="adm-f adm-color" key={p.join(".")}><span>{label}</span><div><input type="color" value={v} onChange={(e) => up(p, e.target.value)} /><input value={v} onChange={(e) => up(p, e.target.value)} maxLength={7} /></div></label>; };
  const tog = (label: string, p: Path, hint?: string) => <label className="adm-tog" key={p.join(".")}><input type="checkbox" checked={!!getIn(s, p)} onChange={(e) => up(p, e.target.checked)} /><span>{label}{hint && <em>{hint}</em>}</span></label>;
  const sel = (label: string, p: Path, opts: string[]) => <label className="adm-f" key={p.join(".")}><span>{label}</span><select value={getIn(s, p)} onChange={(e) => up(p, e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>;
  const mv = (p: Path, i: number, d: number) => { const arr = [...(getIn(s, p) as unknown[])]; const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; up(p, arr); };
  const rm = (p: Path, i: number) => { if (!confirm("Delete this item?")) return; up(p, (getIn(s, p) as unknown[]).filter((_, k) => k !== i)); };
  const rowBtns = (p: Path, i: number, n: number) => <div className="adm-row-btns"><button type="button" className="adm-icon" disabled={i === 0} onClick={() => mv(p, i, -1)} aria-label="Move up"><ArrowUp size={15} /></button><button type="button" className="adm-icon" disabled={i === n - 1} onClick={() => mv(p, i, 1)} aria-label="Move down"><ArrowDown size={15} /></button><button type="button" className="adm-icon adm-danger" onClick={() => rm(p, i)} aria-label="Delete"><Trash2 size={15} /></button></div>;

  const chatLive = s.chatbot.enabled && !!s.chatbot.webhookUrl;

  return (
    <div className="adm">
      <header className="adm-top">
        <div><strong>Website Manager</strong><span>Realtor Adedayo</span></div>
        <div className="adm-top-actions">
          {dirty && <em className="adm-dirty">Unsaved changes</em>}
          <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">View site <ExternalLink size={14} /></a>
          <button className="adm-btn adm-primary" onClick={save} disabled={saving || !dirty}><Save size={15} /> {saving ? "Saving…" : "Save changes"}</button>
          <button className="adm-btn" onClick={logout} aria-label="Log out"><LogOut size={15} /></button>
        </div>
      </header>
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="status">{msg.text}</p>}
      {info.storage === "file" && info.onVercel && <p className="adm-err">Saving won&apos;t work on Vercel until Supabase is connected (see README → “Make admin edits permanent”).</p>}
      <nav className="adm-tabs" aria-label="Admin sections">{TABS.map(([k, l]) => <button key={k} className={tab === k ? "is-on" : ""} onClick={() => setTab(k)}>{l}</button>)}</nav>

      <div className="adm-body">
        {tab === "general" && <>
          <section className="adm-sec"><h2>Brand</h2><div className="adm-grid">
            {txt("Logo letters", ["brand", "mark"])}{txt("Name – first word", ["brand", "name1"])}{txt("Name – second word", ["brand", "name2"])}{txt("Tagline under name", ["brand", "tagline"])}</div>
            {txt("Top announcement bar (leave empty to hide)", ["brand", "announcement"])}</section>
          <section className="adm-sec"><h2>Colours</h2><div className="adm-grid3">{color("Navy (dark areas)", ["theme", "navy"])}{color("Royal blue (buttons)", ["theme", "royal"])}{color("Light accent", ["theme", "accent"])}</div></section>
          <section className="adm-sec"><h2>Google / SEO</h2>{txt("Page title", ["seo", "title"])}{txt("Description", ["seo", "description"], { area: true })}</section>
        </>}

        {tab === "hero" && <>
          <section className="adm-sec"><h2>Hero videos</h2>
            <p className="adm-hint">Add 2–3 clips. Paste a direct <b>.mp4 / .webm</b> link or a <b>YouTube</b> link. Keep clips short (10–20s), muted-friendly and under ~8&nbsp;MB for fast loading. The poster image shows instantly while the video loads and is the fallback if a video fails.</p>
            {s.hero.videos.map((v, i) => (
              <div className="adm-item" key={v.id}><div className="adm-item-head"><strong>Slide {i + 1}</strong>{rowBtns(["hero", "videos"], i, s.hero.videos.length)}</div>
                {txt("Video URL (MP4 / WebM / YouTube)", ["hero", "videos", i, "videoUrl"], { ph: "https://…/clip.mp4" })}{txt("Poster / fallback image URL", ["hero", "videos", i, "poster"], { ph: "https://…/image.jpg" })}
                <div className="adm-grid">{txt("Title (shown on the hero card)", ["hero", "videos", i, "title"])}{txt("Caption", ["hero", "videos", i, "caption"])}</div></div>))}
            {s.hero.videos.length < 6 && <button className="adm-btn" onClick={() => up(["hero", "videos"], [...s.hero.videos, { id: "v-" + rid(), videoUrl: "", poster: "", title: "", caption: "" }])}><Plus size={15} /> Add slide</button>}
            <div className="adm-grid" style={{ marginTop: 16 }}>{txt("Seconds per slide", ["hero", "autoplaySeconds"], { type: "number" })}</div></section>
          <section className="adm-sec"><h2>Hero text</h2>{txt("Small label above headline", ["hero", "eyebrow"])}
            <div className="adm-grid">{txt("Headline (plain part)", ["hero", "headlinePre"])}{txt("Headline (italic highlight)", ["hero", "headlineEm"])}</div>
            {txt("Paragraph", ["hero", "copy"], { area: true })}
            <div className="adm-grid">{txt("Main button", ["hero", "ctaLabel"])}{txt("Second link", ["hero", "ctaSecondary"])}{txt("Trust box – title", ["hero", "proofTitle"])}{txt("Trust box – text", ["hero", "proofText"])}</div></section>
        </>}

        {tab === "properties" && <section className="adm-sec"><h2>Properties ({s.properties.length})</h2>
          <p className="adm-hint">Only properties marked <b>Published</b> appear on the site. Always verify title documents and seller authority before publishing real listings.</p>
          {s.properties.map((p: Property, i) => { const isOpen = open === p.id; return (
            <div className="adm-item" key={p.id}>
              <div className="adm-item-head"><button className="adm-link" onClick={() => setOpen(isOpen ? null : p.id)}>{isOpen ? "▾" : "▸"} {p.title || "Untitled"} <small>{p.published ? "Published" : "Draft"} · {p.priceLabel}</small></button>{rowBtns(["properties"], i, s.properties.length)}</div>
              {isOpen && <div className="adm-item-body">
                {tog("Published (visible on website)", ["properties", i, "published"])}
                <div className="adm-grid">{txt("Title", ["properties", i, "title"])}{txt("Location (full)", ["properties", i, "location"])}{txt("City (used for filter)", ["properties", i, "city"])}{sel("Type", ["properties", i, "type"], ["Land", "House"])}
                  {txt("Price (number, for budget filter)", ["properties", i, "price"], { type: "number" })}{txt("Price label (as displayed)", ["properties", i, "priceLabel"], { ph: "₦3.5m" })}{txt("Size / layout", ["properties", i, "size"], { ph: "600 sqm / 3 bedrooms" })}{txt("Badge on photo", ["properties", i, "tag"])}
                  {txt("Status label (e.g. Available, Sample)", ["properties", i, "status"])}{txt("Estate / project", ["properties", i, "estate"])}{txt("Bedrooms", ["properties", i, "bedrooms"], { type: "number" })}{txt("Bathrooms", ["properties", i, "bathrooms"], { type: "number" })}</div>
                {txt("Photo URL", ["properties", i, "image"], { ph: "https://…" })}{p.image && <img className="adm-thumb" src={p.image} alt="" />}
                {txt("Description", ["properties", i, "description"], { area: true, rows: 4 })}
                <div className="adm-grid">{txt("Developer / seller", ["properties", i, "developer"])}{txt("Seller role / authorization", ["properties", i, "sellerRole"])}{txt("Title / tenure", ["properties", i, "titleType"])}{txt("Documentation", ["properties", i, "documentation"])}{txt("Payment plan", ["properties", i, "paymentPlan"])}</div>
                <label className="adm-f"><span>Key points (one per line)</span><textarea rows={4} value={p.features.join("\n")} onChange={(e) => up(["properties", i, "features"], e.target.value.split("\n"))} /></label>
              </div>}
            </div>); })}
          <button className="adm-btn" onClick={() => { const n = newProperty(); up(["properties"], [n, ...s.properties]); setOpen(n.id); }}><Plus size={15} /> Add property</button></section>}

        {tab === "sections" && <>
          <section className="adm-sec"><h2>Search bar</h2><div className="adm-grid">{txt("Small label", ["search", "kicker"])}{txt("Heading", ["search", "title"])}{txt("Caption", ["search", "caption"])}</div></section>
          <section className="adm-sec"><h2>Property section</h2><div className="adm-grid">{txt("Small label", ["propertiesSection", "kicker"])}{txt("Heading", ["propertiesSection", "title"])}{txt("Heading (italic)", ["propertiesSection", "titleEm"])}{txt("Help link text", ["propertiesSection", "helpLink"])}{txt("Price caption", ["propertiesSection", "priceCaption"], { hint: "e.g. “Price” or “From”" })}</div>
            {txt("Description", ["propertiesSection", "description"], { area: true })}{txt("Notice under listings (empty = hide)", ["propertiesSection", "note"], { area: true })}{txt("Warning in property popup (empty = hide)", ["propertiesSection", "modalWarning"], { area: true })}{txt("Developer note in popup (empty = hide)", ["propertiesSection", "developerNote"], { area: true })}</section>
          <section className="adm-sec"><h2>Location cards</h2><div className="adm-grid">{txt("Small label", ["locations", "kicker"])}{txt("Heading", ["locations", "title"])}{txt("Heading (italic)", ["locations", "titleEm"])}</div>{txt("Description", ["locations", "description"], { area: true })}
            {s.locations.items.map((l, i) => <div className="adm-item" key={i}><div className="adm-item-head"><strong>Card {i + 1}</strong>{rowBtns(["locations", "items"], i, s.locations.items.length)}</div><div className="adm-grid">{txt("Number label", ["locations", "items", i, "num"])}{txt("Title", ["locations", "items", i, "title"])}{txt("Subtitle", ["locations", "items", i, "sub"])}{txt("Button text", ["locations", "items", i, "cta"])}{txt("Filter city (empty = jump to diaspora section)", ["locations", "items", i, "city"])}</div>{txt("Background image URL", ["locations", "items", i, "image"])}</div>)}
            {s.locations.items.length < 6 && <button className="adm-btn" onClick={() => up(["locations", "items"], [...s.locations.items, { num: "", title: "New", sub: "", cta: "Explore", image: "", city: "" }])}><Plus size={15} /> Add card</button>}</section>
          <section className="adm-sec"><h2>How it works</h2><div className="adm-grid">{txt("Small label", ["process", "kicker"])}{txt("Heading", ["process", "title"])}{txt("Heading (italic)", ["process", "titleEm"])}{txt("Button", ["process", "cta"])}</div>{txt("Description", ["process", "description"], { area: true })}
            {s.process.steps.map((st, i) => <div className="adm-item" key={i}><div className="adm-item-head"><strong>Step {i + 1}</strong>{rowBtns(["process", "steps"], i, s.process.steps.length)}</div>{txt("Title", ["process", "steps", i, "title"])}{txt("Text", ["process", "steps", i, "text"], { area: true, rows: 2 })}</div>)}
            {s.process.steps.length < 8 && <button className="adm-btn" onClick={() => up(["process", "steps"], [...s.process.steps, { title: "New step", text: "" }])}><Plus size={15} /> Add step</button>}</section>
          <section className="adm-sec"><h2>Diaspora banner</h2><div className="adm-grid">{txt("Small label", ["diaspora", "kicker"])}{txt("Heading", ["diaspora", "title"])}{txt("Heading (italic)", ["diaspora", "titleEm"])}{txt("Button", ["diaspora", "cta"])}</div>{txt("Text", ["diaspora", "text"], { area: true })}</section>
          <section className="adm-sec"><h2>Footer</h2>{txt("Footer text", ["footer", "text"], { area: true, rows: 2 })}<div className="adm-grid">{txt("Bottom left (after ©year)", ["footer", "bottomLeft"])}{txt("Bottom right", ["footer", "bottomRight"])}</div></section>
        </>}

        {tab === "contact" && <>
          <section className="adm-sec"><h2>Where enquiries go</h2>
            <p className="adm-hint">Every submission is saved (see the Leads tab) and, if set below, emailed and/or sent to a webhook (e.g. your n8n workflow).</p>
            {txt("Send enquiries to this email", ["notifications", "leadEmail"], { type: "email", ph: "you@gmail.com", hint: info.emailReady ? "Email sending is active (Resend)." : "Email sending needs RESEND_API_KEY on the server (README step 4). Until then enquiries are still saved in Leads." })}
            <div className="adm-grid">{txt("Email subject prefix", ["notifications", "subjectPrefix"])}{txt("“From” address (optional)", ["notifications", "fromEmail"], { ph: "Website <enquiries@yourdomain.com>", hint: "Must be a domain verified in Resend." })}</div>
            {txt("Lead webhook URL (optional, e.g. n8n)", ["notifications", "leadWebhookUrl"], { ph: "https://your-n8n/webhook/…", hint: "Receives JSON: name, phone, email, budget, timeline, property, notes." })}
            <p className="adm-hint">These three fields are private and never sent to visitors’ browsers.</p></section>
          <section className="adm-sec"><h2>WhatsApp</h2><div className="adm-grid">{txt("WhatsApp number (country code, digits only)", ["contact", "whatsappNumber"], { ph: "2348012345678", hint: "Shows a WhatsApp button on the form. Empty = hidden." })}{txt("Button label", ["contact", "whatsappLabel"])}</div></section>
          <section className="adm-sec"><h2>Form wording</h2><div className="adm-grid">{txt("Small label", ["contact", "kicker"])}{txt("Heading", ["contact", "title"])}{txt("Heading (italic)", ["contact", "titleEm"])}{txt("Form title", ["contact", "formTitle"])}{txt("Submit button", ["contact", "submitLabel"])}{txt("Success title", ["contact", "successTitle"])}</div>
            {txt("Intro text", ["contact", "text"], { area: true })}{txt("Assurance line", ["contact", "assurance"], { area: true, rows: 2 })}{txt("Success message", ["contact", "successText"], { area: true, rows: 2 })}{txt("Consent checkbox text", ["contact", "consentText"], { area: true, rows: 2 })}{txt("Small print under button", ["contact", "legal"], { area: true, rows: 2 })}</section>
        </>}

        {tab === "chatbot" && <section className="adm-sec"><h2>Website chatbot</h2>
          <p className={chatLive ? "adm-ok" : "adm-warn"}>{chatLive ? "Live: the chat bubble is showing on your website." : "Hidden: the chat bubble appears only after you add a webhook URL and turn it on."}</p>
          {tog("Show chatbot on website", ["chatbot", "enabled"])}
          {txt("Chatbot webhook URL", ["chatbot", "webhookUrl"], { ph: "https://your-n8n/webhook/…", hint: "We POST JSON {message, chatInput, sessionId} and show the reply from fields output / reply / text / message. Messages go through your server so the URL stays private." })}
          <div className="adm-grid">{txt("Chat title", ["chatbot", "title"])}{txt("Subtitle", ["chatbot", "subtitle"])}{txt("Bubble label", ["chatbot", "launcherLabel"])}{txt("Input placeholder", ["chatbot", "placeholder"])}{sel("Position", ["chatbot", "position"], ["right", "left"])}</div>
          {txt("Greeting message", ["chatbot", "greeting"], { area: true, rows: 2 })}{txt("Message shown if the bot is down", ["chatbot", "offlineMessage"], { area: true, rows: 2 })}</section>}

        {tab === "leads" && <section className="adm-sec"><h2>Enquiries</h2>
          {leadErr && <p className="adm-err">{leadErr}</p>}{!leads && !leadErr && <p>Loading…</p>}{leads && leads.length === 0 && <p className="adm-hint">No enquiries yet.</p>}
          {leads && leads.length > 0 && <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Email</th><th>Timeline</th><th>Message</th></tr></thead><tbody>{leads.map((l) => <tr key={l.id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.name}</td><td><a href={`tel:${l.phone}`}>{l.phone}</a></td><td>{l.email}</td><td>{l.timeline}</td><td className="adm-pre">{l.message}</td></tr>)}</tbody></table></div>}</section>}
      </div>
    </div>
  );
}
