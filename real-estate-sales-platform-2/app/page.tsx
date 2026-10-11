import type { Metadata } from "next";
import SiteClient from "@/components/SiteClient";
import { getSettings } from "@/lib/store";
import { toPublic } from "@/lib/settings";

export const dynamic = "force-dynamic"; // always show the latest admin edits

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.seo.title, description: s.seo.description, openGraph: { title: s.seo.title, description: s.seo.description, type: "website" } };
}

export default async function Page() {
  return <SiteClient settings={toPublic(await getSettings())} />;
}
