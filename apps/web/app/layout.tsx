import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Udhekryqi Filma", template: "%s — Udhekryqi Filma" },
  description: "Një katalog lokal demonstrues me filma tërësisht imagjinarë.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <p>Udhekryqi Filma · Katalog demonstrues lokal</p>
          <p>Mbështetur në burimin NyumaFlix të licencuar me MIT.</p>
        </footer>
      </body>
    </html>
  );
}
