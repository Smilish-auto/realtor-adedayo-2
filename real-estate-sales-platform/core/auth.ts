import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "rad_admin";
export const SESSION_MS = 1000 * 60 * 60 * 24 * 7;
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
const hmac = (s: string) => crypto.createHmac("sha256", secret()).update(s).digest("hex");

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

export function makeToken() { const exp = Date.now() + SESSION_MS; return `${exp}.${hmac(String(exp))}`; }

export function validToken(t?: string) {
  if (!t || !secret()) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig) return false;
  const a = Buffer.from(sig), b = Buffer.from(hmac(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && Number(exp) > Date.now();
}

export const isAdmin = () => validToken(cookies().get(COOKIE)?.value);

export function passwordOk(input: string) {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(pw).digest();
  return crypto.timingSafeEqual(a, b);
}
