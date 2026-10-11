// Simple in-memory limiter (per server instance). Good baseline; use Upstash/Vercel KV for strict global limits.
const hits = new Map<string, number[]>();
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return arr.length > max;
}
export const ipOf = (req: Request) => (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
