import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { defaultSettings, sanitizeSettings } from "./settings";
import type { Lead, SiteSettings } from "./types";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only secret
export const storageMode: "supabase" | "file" = SB_URL && SB_KEY ? "supabase" : "file";
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), ".data");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = (): any => createClient(SB_URL!, SB_KEY!, { auth: { persistSession: false } });

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path.join(dataDir, file), "utf8")) as T; } catch { return fallback; }
}
async function writeJson(file: string, data: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2), "utf8");
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    if (storageMode === "supabase") {
      const { data } = await sb().from("site_settings").select("data").eq("id", "main").maybeSingle();
      return sanitizeSettings(data?.data ?? defaultSettings);
    }
    return sanitizeSettings(await readJson("site-settings.json", defaultSettings));
  } catch (e) {
    console.error("getSettings failed, using defaults", e);
    return defaultSettings;
  }
}

export async function saveSettings(s: SiteSettings): Promise<void> {
  if (storageMode === "supabase") {
    const { error } = await sb().from("site_settings").upsert({ id: "main", data: s, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return;
  }
  await writeJson("site-settings.json", s);
}

export async function addLead(l: { name: string; phone: string; email: string; timeline: string; message: string }): Promise<string> {
  if (storageMode === "supabase") {
    const { data, error } = await sb().from("leads").insert({
      full_name: l.name, phone: l.phone, email: l.email || null, purchase_timeline: l.timeline, message: l.message,
      consent_to_follow_up: true, consent_recorded_at: new Date().toISOString(), source: "website"
    }).select("id").single();
    if (error) throw new Error(error.message);
    return data.id as string;
  }
  const all = await readJson<Lead[]>("leads.json", []);
  const lead: Lead = { id: Date.now().toString(36), ...l, createdAt: new Date().toISOString() };
  all.unshift(lead);
  await writeJson("leads.json", all.slice(0, 1000));
  return lead.id;
}

export async function getLeads(): Promise<Lead[]> {
  if (storageMode === "supabase") {
    const { data, error } = await sb().from("leads").select("id,full_name,phone,email,purchase_timeline,message,created_at").order("created_at", { ascending: false }).limit(300);
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((r) => ({ id: r.id, name: r.full_name, phone: r.phone, email: r.email || "", timeline: r.purchase_timeline || "", message: r.message || "", createdAt: r.created_at }));
  }
  return readJson<Lead[]>("leads.json", []);
}
