import type { SiteSettings } from "./types";

export type LeadPayload = { name: string; phone: string; email: string; budget: string; timeline: string; property: string; notes: string };

export async function notifyLead(s: SiteSettings, lead: LeadPayload) {
  const n = s.notifications;
  const text = `New enquiry from your website\n\nName: ${lead.name}\nPhone/WhatsApp: ${lead.phone}\nEmail: ${lead.email || "Not provided"}\nProperty: ${lead.property || "General enquiry"}\nBudget: ${lead.budget || "Not specified"}\nTimeline: ${lead.timeline}\n\nMessage:\n${lead.notes || "(none)"}`;
  const jobs: Promise<unknown>[] = [];

  if (n.leadEmail && process.env.RESEND_API_KEY) {
    jobs.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: n.fromEmail || process.env.RESEND_FROM || "Website Enquiries <onboarding@resend.dev>",
        to: [n.leadEmail], subject: `${n.subjectPrefix || "New enquiry"}: ${lead.name}`, text, ...(lead.email ? { reply_to: lead.email } : {})
      }),
      signal: AbortSignal.timeout(10000)
    }).then(async (r) => { if (!r.ok) console.error("Resend error", r.status, await r.text()); }));
  } else if (n.leadEmail) {
    console.warn("Lead email address set but RESEND_API_KEY is missing: email not sent.");
  }

  if (n.leadWebhookUrl) {
    jobs.push(fetch(n.leadWebhookUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, source: "website", createdAt: new Date().toISOString() }), signal: AbortSignal.timeout(10000)
    }).then((r) => { if (!r.ok) console.error("Lead webhook error", r.status); }));
  }
  await Promise.allSettled(jobs.map((j) => j.catch((e) => console.error("notify failed", e))));
}
