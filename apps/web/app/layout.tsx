import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PUBLISHER_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Udhekryqi Media" }],
  creator: "Udhekryqi Media",
  publisher: PUBLISHER_NAME,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <p>KokoMax · Katalog demonstrues lokal</p>
          <p>KokoMax — Nga Udhekryqi Media · Mbështetur në burimin NyumaFlix të licencuar me MIT.</p>
        </footer>
      </body>
    </html>
  );
}
