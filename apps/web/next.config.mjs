/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://image.mux.com https://*.litix.io; font-src 'self'; connect-src 'self' https://*.mux.com https://*.litix.io; media-src blob: https://*.mux.com; worker-src 'self' blob:; frame-src https://archive.org; object-src 'none'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'",
          },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
