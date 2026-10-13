/** @type {import('next').NextConfig} */
const supabaseOrigin = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && new URL(url).protocol === "https:" ? new URL(url).origin : null;
  } catch {
    return null;
  }
})();

const imageSources = ["'self'", "data:", supabaseOrigin].filter(Boolean).join(" ");

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src ${imageSources}; font-src 'self'; connect-src 'self'; media-src 'none'; worker-src 'none'; frame-src https://archive.org https://player.mediadelivery.net; object-src 'none'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'`,
          },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
