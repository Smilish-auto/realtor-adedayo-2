"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, ChevronDown, Globe2, Home, LandPlot, MapPin, Menu, MessageCircle, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { Property, PublicSettings } from "@/core/types";
import HeroVideo from "./HeroVideo";
import Reveal from "./Reveal";
import Tilt from "./Tilt";
import ChatWidget from "./ChatWidget";

const stepIcons = [Search, SlidersHorizontal, ShieldCheck, CheckCircle2];
const emptyForm = { name: "", phone: "", email: "", budget: "", timeline: "Within 3 months", notes: "", website: "" };

export default function SiteClient({ settings: s }: { settings: PublicSettings }) {
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("All locations");
  const [type, setType] = useState("Any property");
  const [budget, setBudget] = useState("Any budget");
  const [selected, setSelected] = useState<Property | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [enquiryFor, setEnquiryFor] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const cities = useMemo(() => Array.from(new Set(s.properties.map((p) => p.city).filter(Boolean))), [s.properties]);
  const filtered = useMemo(() => s.properties.filter((p) => {
    const q = searchText.toLowerCase().trim();
    const textMatch = !q || `${p.title} ${p.location} ${p.city} ${p.type}`.toLowerCase().includes(q);
    const cityMatch = city === "All locations" || p.city === city;
    const typeMatch = type === "Any property" || p.type === type;
    const budgetMatch = budget === "Any budget" || (budget === "Under ₦10m" && p.price < 10e6) || (budget === "₦10m–₦50m" && p.price >= 10e6 && p.price <= 50e6) || (budget === "Above ₦50m" && p.price > 50e6);
    return textMatch && cityMatch && typeMatch && budgetMatch;
  }), [s.properties, searchText, city, type, budget]);

  const onIndex = useCallback((i: number) => setHeroIdx(i), []);
  const slide = s.hero.videos[heroIdx] ?? s.hero.videos[0];
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", onKey); const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [selected]);

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setStatus("sending"); setErrMsg("");
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, property: enquiryFor }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) { setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again."); setStatus("error"); }
  }

  const wa = s.contact.whatsappNumber;
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hello, I'm interested in ${enquiryFor || "finding a property"}.${form.name ? " My name is " + form.name + "." : ""}`)}` : "";
  const themeVars = { "--navy": s.theme.navy, "--royal": s.theme.royal, "--accent": s.theme.accent } as React.CSSProperties;

  return (
    <main style={themeVars}>
      {s.brand.announcement && <div className="announcement"><span className="announcement-dot" /> {s.brand.announcement} <span className="announcement-arrow">↗</span></div>}
      <header className="header container">
        <a className="brand" href="#" aria-label={`${s.brand.name1} ${s.brand.name2} home`}>
          <span className="brand-mark gloss">{s.brand.mark}</span>
          <span>{s.brand.name1} <span className="brand-light">{s.brand.name2}</span><small>{s.brand.tagline}</small></span>
        </a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="#properties" onClick={() => setMenuOpen(false)}>Explore properties</a>
          <a href="#locations" onClick={() => setMenuOpen(false)}>Locations</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#diaspora" onClick={() => setMenuOpen(false)}>Diaspora buyers</a>
        </nav>
        <a className="header-cta button-primary gloss" href="#contact">Talk to me <ArrowRight size={16} /></a>
      </header>

      <section className="hero">
        <HeroVideo slides={s.hero.videos} index={heroIdx} onIndex={onIndex} seconds={s.hero.autoplaySeconds} />
        <div className="cube-wrap cube-a" aria-hidden="true"><div className="cube"><i /><i /><i /><i /><i /><i /></div></div>
        <div className="cube-wrap cube-b" aria-hidden="true"><div className="cube"><i /><i /><i /><i /><i /><i /></div></div>
        <div className="container hero-content">
          <div className="hero-copy-col">
            <div className="eyebrow hero-in" style={{ animationDelay: ".05s" }}><span className="eyebrow-line" /> {s.hero.eyebrow}</div>
            <h1 className="hero-in" style={{ animationDelay: ".15s" }}>{s.hero.headlinePre} <em>{s.hero.headlineEm}</em></h1>
            <p className="hero-copy hero-in" style={{ animationDelay: ".28s" }}>{s.hero.copy}</p>
            <div className="hero-actions hero-in" style={{ animationDelay: ".4s" }}>
              <a href="#properties" className="button button-light gloss">{s.hero.ctaLabel} <ArrowRight size={17} /></a>
              <a href="#process" className="text-link light-link">{s.hero.ctaSecondary} <span>↗</span></a>
            </div>
            <div className="hero-proof glass hero-in" style={{ animationDelay: ".52s" }}><div className="proof-icon"><ShieldCheck size={18} /></div><div><strong>{s.hero.proofTitle}</strong><span>{s.hero.proofText}</span></div></div>
          </div>
          {slide && (slide.title || slide.caption) && (
            <aside className="hero-now glass hero-in" style={{ animationDelay: ".6s" }} key={slide.id} aria-live="polite">
              <span className="hero-now-kicker">0{heroIdx + 1} / 0{s.hero.videos.length}</span>
              <strong>{slide.title}</strong><p>{slide.caption}</p>
            </aside>
          )}
        </div>
      </section>

      <section className="search-wrap container">
        <Reveal>
          <div className="search-heading"><div><span className="section-kicker">{s.search.kicker}</span><h2>{s.search.title}</h2></div><span className="search-caption">{s.search.caption}</span></div>
          <div className="search-panel glass-light">
            <label className="search-main"><Search size={20} /><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search location or property..." aria-label="Search location or property" /></label>
            <label><span>Location</span><select value={city} onChange={(e) => setCity(e.target.value)}><option>All locations</option>{cities.map((c) => <option key={c}>{c}</option>)}</select><ChevronDown size={15} /></label>
            <label><span>Property type</span><select value={type} onChange={(e) => setType(e.target.value)}><option>Any property</option><option>Land</option><option>House</option></select><ChevronDown size={15} /></label>
            <label><span>Budget</span><select value={budget} onChange={(e) => setBudget(e.target.value)}><option>Any budget</option><option>Under ₦10m</option><option>₦10m–₦50m</option><option>Above ₦50m</option></select><ChevronDown size={15} /></label>
            <a href="#properties" className="button button-primary gloss"><Search size={17} /> Find properties</a>
          </div>
        </Reveal>
      </section>

      <section id="properties" className="section container">
        <Reveal><div className="section-top"><div><span className="section-kicker">{s.propertiesSection.kicker}</span><h2>{s.propertiesSection.title} <em>{s.propertiesSection.titleEm}</em></h2><p className="section-description">{s.propertiesSection.description}</p></div><a href="#contact" className="text-link">{s.propertiesSection.helpLink} <ArrowRight size={16} /></a></div></Reveal>
        <div className="results-bar"><span><strong>{filtered.length.toString().padStart(2, "0")}</strong> properties shown</span></div>
        <div className="property-grid">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 90}>
              <Tilt>
                <article className="property-card gloss">
                  <button className="property-image-button" onClick={() => setSelected(p)} aria-label={`View ${p.title}`}>
                    {p.image ? <img src={p.image} alt={p.title} className="property-image" loading="lazy" decoding="async" /> : <span className="property-image property-image-empty"><Home size={28} /></span>}
                    {p.tag && <span className="property-tag">{p.tag}</span>}<span className="image-arrow"><ArrowRight size={18} /></span>
                  </button>
                  <div className="property-body">
                    <div className="property-type"><span>{p.type === "Land" ? <LandPlot size={14} /> : <Home size={14} />} {p.type}</span>{p.status && <span className="sample-label">{p.status.toUpperCase()}</span>}</div>
                    <h3>{p.title}</h3>
                    <div className="property-location"><MapPin size={15} />{p.location}</div>
                    <div className="property-footer"><div><span className="price-label">{s.propertiesSection.priceCaption}</span><strong className="property-price">{p.priceLabel}</strong></div><span className="property-size">{p.size}</span></div>
                    <button className="details-link" onClick={() => setSelected(p)}>View details <ArrowRight size={16} /></button>
                  </div>
                </article>
              </Tilt>
            </Reveal>
          ))}
          {filtered.length === 0 && <div className="empty-state"><Search size={25} /><h3>No matching properties</h3><p>Try changing your search or contact me to discuss what you need.</p><button className="button button-primary gloss" onClick={() => { setSearchText(""); setCity("All locations"); setType("Any property"); setBudget("Any budget"); }}>Reset filters</button></div>}
        </div>
        {s.propertiesSection.note && <p className="inventory-note"><ShieldCheck size={16} /> <span><strong>Before you make a decision:</strong> {s.propertiesSection.note}</span></p>}
      </section>

      <section id="locations" className="locations-section">
        <div className="container">
          <Reveal><div className="section-top light-top"><div><span className="section-kicker">{s.locations.kicker}</span><h2>{s.locations.title} <em>{s.locations.titleEm}</em></h2><p className="section-description">{s.locations.description}</p></div></div></Reveal>
          <div className="location-grid">
            {s.locations.items.map((l, i) => {
              const inner = <><span className="location-number">{l.num}</span><span className="location-title">{l.title}</span><span className="location-sub">{l.sub}</span><span className="location-cta">{l.cta} <ArrowRight size={17} /></span></>;
              const style = l.image ? { backgroundImage: `url('${l.image.replace(/'/g, "%27")}')` } : undefined;
              return (
                <Reveal key={i} delay={i * 120} variant={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <Tilt max={5}>
                    {l.city
                      ? <button className="location-card gloss" style={style} onClick={() => { setCity(l.city); goTo("properties"); }}>{inner}</button>
                      : <a href="#diaspora" className="location-card gloss" style={style}>{inner}</a>}
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="process" className="section container process-section">
        <Reveal variant="left" className="process-intro"><span className="section-kicker">{s.process.kicker}</span><h2>{s.process.title} <em>{s.process.titleEm}</em></h2><p className="section-description">{s.process.description}</p><a href="#contact" className="button button-primary gloss">{s.process.cta} <ArrowRight size={17} /></a></Reveal>
        <div className="process-steps">
          {s.process.steps.map((st, i) => { const Icon = stepIcons[i % stepIcons.length]; return (
            <Reveal key={i} delay={i * 110} variant="right"><div className="process-step"><span className="step-number">{String(i + 1).padStart(2, "0")}</span><div><h3>{st.title}</h3><p>{st.text}</p></div><Icon size={21} /></div></Reveal>
          ); })}
        </div>
      </section>

      <section id="diaspora" className="diaspora-section">
        <Reveal variant="flip"><div className="container diaspora-content"><div className="diaspora-icon gloss"><Globe2 size={26} /></div><div><span className="section-kicker">{s.diaspora.kicker}</span><h2>{s.diaspora.title}<br /><em>{s.diaspora.titleEm}</em></h2><p>{s.diaspora.text}</p><a className="button button-light gloss" href="#contact">{s.diaspora.cta} <ArrowRight size={17} /></a></div><div className="diaspora-stamp" aria-hidden="true"><span>CLARITY</span><span>BEFORE</span><span>COMMITMENT</span></div></div></Reveal>
      </section>

      <section id="contact" className="contact-section container">
        <Reveal variant="left" className="contact-copy"><span className="section-kicker">{s.contact.kicker}</span><h2>{s.contact.title} <em>{s.contact.titleEm}</em></h2><p>{s.contact.text}</p>
          <div className="contact-assurance"><CheckCircle2 size={18} /><span>{s.contact.assurance}</span></div>
          {wa && <a className="button button-whatsapp gloss" href={waHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> {s.contact.whatsappLabel}</a>}
        </Reveal>
        <Reveal variant="right"><Tilt max={3}>
          <form className="contact-form glass-light" onSubmit={submitLead}>
            <div className="form-heading"><span>{s.contact.formTitle}</span><Sparkles size={18} /></div>
            {status === "sent" ? (
              <div className="success-panel"><CheckCircle2 size={28} /><h3>{s.contact.successTitle}</h3><p>{s.contact.successText}</p>
                {wa && <a className="button button-whatsapp gloss" href={waHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> {s.contact.whatsappLabel}</a>}
                <button className="button button-primary gloss" type="button" onClick={() => { setStatus("idle"); setForm(emptyForm); setEnquiryFor(""); }}>Send another enquiry</button></div>
            ) : (<>
              <div className="form-row"><label>Full name<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" autoComplete="name" /></label><label>Phone / WhatsApp<input required maxLength={40} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234..." autoComplete="tel" inputMode="tel" /></label></div>
              <label>Email address <span className="optional">(optional)</span><input type="email" maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" /></label>
              <div className="form-row"><label>Budget range<input maxLength={100} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. ₦5m–₦10m" /></label><label>Buying timeline<select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}><option>Within 3 months</option><option>Within 6 months</option><option>More than 6 months</option><option>Just researching</option></select></label></div>
              <label>What are you looking for?<textarea rows={3} maxLength={2000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Preferred area, land or house, questions..." /></label>
              <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label></div>
              <label className="consent"><input type="checkbox" required /> <span>{s.contact.consentText}</span></label>
              {status === "error" && <p className="form-error" role="alert">{errMsg}</p>}
              <button type="submit" disabled={status === "sending"} className="button button-primary gloss form-submit">{status === "sending" ? "Sending…" : s.contact.submitLabel} <ArrowRight size={17} /></button>
              <p className="form-legal">{s.contact.legal}</p>
            </>)}
          </form>
        </Tilt></Reveal>
      </section>

      <footer className="footer">
        <div className="container footer-main"><a className="brand brand-footer" href="#"><span className="brand-mark gloss">{s.brand.mark}</span><span>{s.brand.name1} <span className="brand-light">{s.brand.name2}</span><small>{s.brand.tagline}</small></span></a><p>{s.footer.text}</p><div className="footer-links"><a href="#properties">Properties</a><a href="#process">How it works</a><a href="#contact">Contact</a></div></div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {s.footer.bottomLeft}</span><span>{s.footer.bottomRight}</span></div>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="property-modal" role="dialog" aria-modal="true" aria-label={selected.title}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close details"><X /></button>
            {selected.image ? <img src={selected.image} alt={selected.title} className="modal-image" /> : <div className="modal-image" />}
            <div className="modal-content">
              <span className="section-kicker">{selected.type} · {selected.city.toUpperCase()}{selected.status ? ` · ${selected.status.toUpperCase()}` : ""}</span>
              <h2>{selected.title}</h2>
              <div className="property-location"><MapPin size={15} />{selected.location}</div>
              <div className="modal-price">{selected.priceLabel} <span>{s.propertiesSection.priceCaption.toLowerCase()}</span></div>
              <p>{selected.description}</p>
              <h3 className="detail-heading">Property details</h3>
              <div className="detail-grid">
                <div><span>Property type</span><strong>{selected.type}</strong></div><div><span>Size / layout</span><strong>{selected.size || "—"}</strong></div>
                <div><span>Estate / project</span><strong>{selected.estate || "—"}</strong></div><div><span>Title / tenure</span><strong>{selected.titleType || "—"}</strong></div>
                <div><span>Documentation</span><strong>{selected.documentation || "—"}</strong></div><div><span>Payment plan</span><strong>{selected.paymentPlan || "—"}</strong></div>
                {selected.bedrooms && <div><span>Bedrooms</span><strong>{selected.bedrooms}</strong></div>}{selected.bathrooms && <div><span>Bathrooms</span><strong>{selected.bathrooms}</strong></div>}
              </div>
              {(selected.developer || selected.sellerRole) && <><h3 className="detail-heading">Developer / authorized seller</h3><div className="developer-panel"><Building2 size={20} /><div><strong>{selected.developer}</strong><p>{selected.sellerRole}</p>{s.propertiesSection.developerNote && <small>{s.propertiesSection.developerNote}</small>}</div></div></>}
              {selected.features.length > 0 && <><h3 className="detail-heading">Key points to confirm</h3><ul className="detail-features">{selected.features.map((f) => <li key={f}>{f}</li>)}</ul></>}
              {s.propertiesSection.modalWarning && <div className="modal-warning"><ShieldCheck size={17} /> {s.propertiesSection.modalWarning}</div>}
              <button className="button button-primary gloss modal-action" onClick={() => { const t = `${selected.title} (${selected.location})`; setEnquiryFor(t); setForm((f) => ({ ...f, notes: `I am interested in: ${t}.` })); setStatus("idle"); setSelected(null); setTimeout(() => goTo("contact"), 50); }}>Enquire about this property <ArrowRight size={17} /></button>
            </div>
          </div>
        </div>
      )}

      {s.chatbot.enabled && <ChatWidget cfg={s.chatbot} />}
    </main>
  );
}
