import type { Chatbot, LocationCard, Property, PublicSettings, SiteSettings, Step, VideoSlide } from "./types";

export const rid = () => Math.random().toString(36).slice(2, 9);

export function newProperty(): Property {
  return {
    id: "p-" + rid(), slug: "", title: "New property", location: "", city: "Ibadan", type: "Land", price: 0, priceLabel: "₦0",
    size: "", tag: "New", image: "", description: "", status: "", developer: "", sellerRole: "", documentation: "",
    paymentPlan: "", titleType: "", estate: "", features: [], published: false
  };
}

const sample = (o: Partial<Property> & Pick<Property, "id" | "title" | "location" | "city" | "type" | "price" | "priceLabel" | "size" | "tag" | "image" | "description" | "slug">): Property => ({
  status: "Sample", developer: "Example developer — replace before publishing", sellerRole: "Authorized sales representative to be confirmed",
  documentation: "Not verified — request and independently verify documents", paymentPlan: "To be confirmed with the developer",
  titleType: "To be verified", estate: "Estate name to be confirmed", features: [], published: true, ...o
});

export const defaultSettings: SiteSettings = {
  brand: { mark: "RAD", name1: "REALTOR", name2: "ADEDAYO", tagline: "LAND · HOMES · INVESTMENT", announcement: "Personal property guidance for buyers in Nigeria and the diaspora" },
  seo: { title: "Realtor Adedayo | Find Land & Homes with Confidence", description: "Explore land and homes in Ibadan, Lagos and selected Nigerian locations. Get clear property details and request a viewing." },
  theme: { navy: "#0a1f4d", royal: "#2347c9", accent: "#8fb4ff" },
  hero: {
    eyebrow: "PROPERTY SEARCH, MADE PERSONAL", headlinePre: "Find the right place to", headlineEm: "build your future.",
    copy: "Explore land and homes across Ibadan, Lagos and selected locations in Nigeria—with clear information and personal guidance at every step.",
    ctaLabel: "Explore properties", ctaSecondary: "How buying works", proofTitle: "Make informed property decisions", proofText: "Ask questions. Verify details. Move with clarity.",
    autoplaySeconds: 8,
    videos: [
      { id: "v1", videoUrl: "", poster: "https://images.unsplash.com/photo-1600595047985-cc8c7a8c4f45?auto=format&fit=crop&w=2000&q=85", title: "Modern family homes", caption: "Add your own video URL in Admin → Hero & Videos." },
      { id: "v2", videoUrl: "", poster: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=85", title: "Land in Ibadan", caption: "Each slide can be a video (MP4/WebM/YouTube) with a poster image." },
      { id: "v3", videoUrl: "", poster: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85", title: "Lagos living", caption: "Use 2 or 3 short, muted, looping clips for the best result." }
    ]
  },
  search: { kicker: "START YOUR SEARCH", title: "What are you looking for?", caption: "A better search starts with the right details." },
  propertiesSection: {
    kicker: "THE PROPERTY COLLECTION", title: "Find a place that fits", titleEm: "your plans.",
    description: "Explore a range of land and homes. Ask for current availability and the details that matter to you.", helpLink: "Need help choosing?",
    priceCaption: "Illustrative price",
    note: "All sample listings must be replaced with real, authorized inventory. Always independently verify title documents, approvals, seller authority, total fees, and availability before paying.",
    modalWarning: "Sample data only. Independently verify availability, developer authorization, title documents, price and payment terms before making any payment.",
    developerNote: "Before publishing, add the developer’s verified name, company profile, contact details and proof of authorization."
  },
  properties: [
    sample({ id: "sample-1", slug: "residential-land-moniya-ibadan", title: "Residential Land Opportunity", location: "Moniya, Ibadan, Oyo State", city: "Ibadan", type: "Land", price: 3500000, priceLabel: "₦3.5m", size: "600 sqm", tag: "Ibadan", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80", description: "Sample listing for layout preview only. Replace with a verified property, confirmed price, documentation details and approved photographs before publishing.", features: ["Sample size: 600 sqm", "Confirm survey plan", "Confirm allocation and title documents"] }),
    sample({ id: "sample-2", slug: "residential-land-epe-lagos", title: "Land for Residential Development", location: "Epe, Lagos State", city: "Lagos", type: "Land", price: 5000000, priceLabel: "₦5m", size: "500 sqm", tag: "Lagos", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80", description: "Sample listing for layout preview only. Verify the estate, title, exact location, price and payment plan before using this as an advert.", features: ["Sample size: 500 sqm", "Confirm survey plan", "Confirm allocation and title documents"] }),
    sample({ id: "sample-3", slug: "modern-family-home-ibadan", title: "Modern Family Home", location: "Ibadan, Oyo State", city: "Ibadan", type: "House", price: 45000000, priceLabel: "₦45m", size: "3 bedrooms", tag: "Homes", image: "https://images.unsplash.com/photo-1600595047985-cc8c7a8c4f45?auto=format&fit=crop&w=1200&q=80", description: "Sample house card to demonstrate the design. Replace the copy, images and price with an authorized, currently available property.", bedrooms: 3, bathrooms: 3, features: ["3 bedrooms (sample)", "Confirm building condition", "Confirm title and completion status"] }),
    sample({ id: "sample-4", slug: "contemporary-lagos-residence", title: "Contemporary Lagos Residence", location: "Lagos, Lagos State", city: "Lagos", type: "House", price: 85000000, priceLabel: "₦85m", size: "4 bedrooms", tag: "Premium", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", description: "Sample listing for preview only. Do not market this property until its details and availability have been verified.", bedrooms: 4, bathrooms: 4, features: ["4 bedrooms (sample)", "Confirm parking and utilities", "Confirm title and completion status"] })
  ],
  locations: {
    kicker: "SEARCH BY LOCATION", title: "Start where your", titleEm: "plans take you.", description: "Focus your search on the locations that suit your budget, lifestyle, or investment goals.",
    items: [
      { num: "01 / OYO STATE", title: "Ibadan", sub: "Land & residential homes", cta: "Explore Ibadan", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=75", city: "Ibadan" },
      { num: "02 / LAGOS STATE", title: "Lagos", sub: "Land, homes & opportunities", cta: "Explore Lagos", image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=75", city: "Lagos" },
      { num: "03 / BUY FROM ABROAD", title: "The diaspora", sub: "A clearer path to buying in Nigeria", cta: "Learn the process", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=75", city: "" }
    ]
  },
  process: {
    kicker: "A CLEARER BUYING JOURNEY", title: "From first question to", titleEm: "next steps.",
    description: "Buying property is a major decision. You deserve clear answers, a transparent process, and time to verify what you are buying.", cta: "Start a conversation",
    steps: [
      { title: "Share what you need", text: "Tell me your preferred location, property type, budget, and timeline." },
      { title: "Review suitable options", text: "Compare relevant listings, ask questions, and request current property details." },
      { title: "Verify before committing", text: "Confirm availability and have the title, approvals, seller authority, and terms independently checked." },
      { title: "Agree on the next step", text: "Request a viewing or consultation. Appointments are confirmed only after both sides agree." }
    ]
  },
  diaspora: { kicker: "FOR NIGERIANS ABROAD", title: "Buying from abroad?", titleEm: "Stay informed at every step.", text: "Ask for a clear breakdown of the property, documentation to review, payment terms, and the verification steps you should complete before sending money.", cta: "Discuss your property goals" },
  contact: {
    kicker: "LET'S TALK PROPERTY", title: "Tell me what you're", titleEm: "looking for.", text: "Share a few details and start a conversation about your property search. No pressure to make a decision before you're ready.",
    assurance: "Your information is only used to respond to your enquiry.", formTitle: "PROPERTY ENQUIRY", submitLabel: "Send enquiry",
    successTitle: "Enquiry received", successText: "Thank you. I'll get back to you shortly.", consentText: "I agree to be contacted about this enquiry and understand I can ask for follow-up to stop.",
    legal: "Verify all property information independently before making any payment.", whatsappNumber: "", whatsappLabel: "Chat on WhatsApp"
  },
  footer: { text: "Property decisions deserve clear information, careful verification, and a personal approach.", bottomLeft: "Realtor Adedayo (RAD).", bottomRight: "Verify property information independently before payment." },
  notifications: { leadEmail: "", fromEmail: "", subjectPrefix: "New property enquiry", leadWebhookUrl: "" },
  chatbot: {
    enabled: true, webhookUrl: "", title: "Chat with us", subtitle: "Typically replies in a minute", greeting: "Hi 👋 I can help you find land or a home. What are you looking for?",
    placeholder: "Type your message…", position: "right", offlineMessage: "Sorry, chat is unavailable right now. Please use the enquiry form.", launcherLabel: "Chat"
  }
};

/* ---------- merge + sanitize (pure, safe for server and client) ---------- */
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function merge(base: any, over: any): any {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (isObj(base)) { const out: Record<string, unknown> = {}; for (const k of Object.keys(base)) out[k] = merge(base[k], isObj(over) ? over[k] : undefined); return out; }
  return typeof over === typeof base ? over : base;
}

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, max);
const safeUrl = (v: unknown) => { const s = str(v, 2000).trim(); return /^https?:\/\//i.test(s) || (s.startsWith("/") && !s.startsWith("//")) ? s : ""; };
const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim() : fb);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const optNum = (v: unknown) => { const n = Number(v); return v === "" || v == null || !Number.isFinite(n) || n <= 0 ? undefined : Math.min(n, 99); };

function clampStrings(o: unknown, max = 4000): unknown {
  if (typeof o === "string") return o.slice(0, max);
  if (Array.isArray(o)) return o.map((x) => clampStrings(x, max));
  if (isObj(o)) return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, clampStrings(v, max)]));
  return o;
}

export function sanitizeSettings(input: unknown): SiteSettings {
  const m = merge(defaultSettings, clampStrings(input)) as SiteSettings;
  const seen = new Set<string>();
  const uniq = (id: string) => { let x = id || "id-" + rid(); while (seen.has(x)) x += "-" + rid(); seen.add(x); return x; };

  m.theme = { navy: hex(m.theme.navy, defaultSettings.theme.navy), royal: hex(m.theme.royal, defaultSettings.theme.royal), accent: hex(m.theme.accent, defaultSettings.theme.accent) };

  m.hero.autoplaySeconds = Math.min(30, Math.max(4, Number(m.hero.autoplaySeconds) || 8));
  m.hero.videos = (m.hero.videos as unknown[]).slice(0, 6).filter(isObj).map((v): VideoSlide => ({
    id: uniq(str(v.id, 40)), videoUrl: safeUrl(v.videoUrl), poster: safeUrl(v.poster), title: str(v.title, 120), caption: str(v.caption, 300)
  }));

  seen.clear();
  m.properties = (m.properties as unknown[]).slice(0, 80).filter(isObj).map((p): Property => {
    const title = str(p.title, 160);
    return {
      id: uniq(str(p.id, 40)), slug: slugify(str(p.slug) || title) || "property", title, location: str(p.location, 200), city: str(p.city, 80),
      type: p.type === "House" ? "House" : "Land", price: Math.max(0, Number(p.price) || 0), priceLabel: str(p.priceLabel, 40), size: str(p.size, 80),
      tag: str(p.tag, 40), image: safeUrl(p.image), description: str(p.description, 3000), status: str(p.status, 40), developer: str(p.developer, 200),
      sellerRole: str(p.sellerRole, 200), documentation: str(p.documentation, 300), paymentPlan: str(p.paymentPlan, 300), titleType: str(p.titleType, 200),
      estate: str(p.estate, 200), bedrooms: optNum(p.bedrooms), bathrooms: optNum(p.bathrooms),
      features: (Array.isArray(p.features) ? p.features : []).map((f) => str(f, 200).trim()).filter(Boolean).slice(0, 20), published: p.published !== false
    };
  });

  m.locations.items = (m.locations.items as unknown[]).slice(0, 6).filter(isObj).map((l): LocationCard => ({
    num: str(l.num, 60), title: str(l.title, 80), sub: str(l.sub, 160), cta: str(l.cta, 80), image: safeUrl(l.image), city: str(l.city, 80)
  }));
  m.process.steps = (m.process.steps as unknown[]).slice(0, 8).filter(isObj).map((s): Step => ({ title: str(s.title, 120), text: str(s.text, 500) }));

  m.contact.whatsappNumber = str(m.contact.whatsappNumber, 30).replace(/[^\d]/g, "");
  m.notifications.leadEmail = str(m.notifications.leadEmail, 200).trim();
  m.notifications.fromEmail = str(m.notifications.fromEmail, 200).trim();
  m.notifications.leadWebhookUrl = safeUrl(m.notifications.leadWebhookUrl);
  const c: Chatbot = m.chatbot;
  c.webhookUrl = safeUrl(c.webhookUrl); c.enabled = c.enabled !== false; c.position = c.position === "left" ? "left" : "right";
  return m;
}

export function toPublic(s: SiteSettings): PublicSettings {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { notifications, chatbot, ...rest } = s;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { webhookUrl, ...cb } = chatbot;
  return { ...rest, properties: s.properties.filter((p) => p.published), chatbot: { ...cb, enabled: chatbot.enabled && !!webhookUrl } };
}
