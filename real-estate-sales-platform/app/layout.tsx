import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Realtor Adedayo | Find Land & Homes with Confidence",
  description: "Explore land and homes in Ibadan, Lagos and selected Nigerian locations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.vercel.app")
};
export const viewport: Viewport = { themeColor: "#0a1f4d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <noscript><style>{`.r3d{opacity:1!important;transform:none!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
