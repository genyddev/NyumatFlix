import type { Metadata } from "next";

export const SITE_NAME = "KokoMax";
export const SITE_URL = "https://kokomax.al";
export const SITE_DESCRIPTION = "KokoMax është një katalog demonstrues filmash në shqip, me tituj dhe përshkrime imagjinare.";
export const PUBLISHER_NAME = "KokoMax — Nga Udhekryqi Media";

type PageMetadataInput = Readonly<{
  title?: string;
  description?: string;
  path?: string;
}>;

export function createPageMetadata({ title, description = SITE_DESCRIPTION, path = "/" }: PageMetadataInput = {}): Metadata {
  const socialTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;

  return {
    title: title ?? { absolute: SITE_NAME },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "sq_AL",
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [{ url: "/koko-logo.png", width: 5000, height: 3508, alt: "Logoja KokoMax" }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: "/koko-logo.png", alt: "Logoja KokoMax" }],
    },
  };
}
