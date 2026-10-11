# Realtor Adedayo — Website with Admin Panel

Next.js 14 site: royal/navy + white glossy design, 3D scroll animations, 2–3 video hero, chatbot, lead capture, and an **admin page (`/admin`) where everything is editable**.

## What you can edit in /admin
- **General & Theme** – logo, name, announcement bar, 3 brand colours, SEO title/description
- **Hero & Videos** – 2–6 slides, each with a video URL (MP4/WebM/YouTube), poster image, title, caption; seconds per slide; all hero text
- **Properties** – add / edit / delete / reorder / publish-unpublish
- **Page Text** – search bar, location cards, how-it-works steps, diaspora banner, footer
- **Form & Email** – the **email address enquiries are sent to**, subject prefix, WhatsApp number, lead webhook (n8n), form wording
- **Chatbot** – webhook URL, on/off, title, greeting, position. **The chat bubble only appears once a webhook URL is added.**
- **Leads** – every enquiry received

## Run locally
```bash
npm install
cp .env.example .env.local     # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
npm run dev
```
Open http://localhost:3000 and http://localhost:3000/admin. Locally, edits and leads are saved in a `.data/` folder.

## Deploy on Vercel (do these so admin edits are permanent)
Vercel's disk is read-only, so saving needs a database:
1. Create a free Supabase project → SQL Editor → run `supabase/schema.sql`.
2. In Vercel → Settings → Environment Variables add:
   - `ADMIN_PASSWORD` (long and unique) and `ADMIN_SESSION_SECRET` (any long random string)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret — never expose it)
3. Redeploy, then log in at `/admin`.
4. **Enquiry emails:** create a free Resend account, add `RESEND_API_KEY`, then enter your Gmail in Admin → Form & Email. (Resend's test sender only delivers to your own Resend account email; for any inbox, verify your domain and set the "From" address.) Without Resend, enquiries are still saved in the Leads tab and can go to your n8n webhook.

## Chatbot webhook (n8n)
Admin → Chatbot → paste your webhook URL. The server POSTs `{ "message", "chatInput", "sessionId", "source" }` and shows the reply from the first of `output`, `reply`, `text`, `message`, `response`, `answer` in the JSON (or plain text). Use an n8n *Webhook* node → AI Agent → *Respond to Webhook* (respond with `{"output": "..."}`). `sessionId` stays the same per visitor so you can attach memory.

## Videos
Paste direct links (Cloudinary, Supabase Storage, Bunny, your own host) or YouTube links. Keep clips 10–20s, ~720p, under ~8 MB, no audio needed. Always set a poster image: it shows instantly and is the fallback.

## Security notes
- No default password: `/admin` stays locked until you set `ADMIN_PASSWORD`.
- Webhook URLs and the notification email are never sent to visitors' browsers; chat goes through your server.
- Admin uses an httpOnly, SameSite=Strict cookie; login attempts are rate-limited. URLs and colours are validated on save.
- Lead form has a honeypot and rate limit. Rate limits are per server instance — add Upstash/Vercel KV if you need strict global limits.

## Before going live
Replace the sample listings (they are illustrative) with real, authorized properties and verify title/seller details.
