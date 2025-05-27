/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurations recommandées par Vercel
  reactStrictMode: true,
  swcMinify: true,

  // Configuration des images si nécessaire
  images: {
    domains: ["placeholder.svg", "blob.vercel-storage.com", "supabase.co"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    unoptimized: true,
  },

  // Configuration pour les performances
  compress: true,

  // Configuration pour la sécurité
  poweredByHeader: false,

  // Configuration pour les en-têtes de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ]
  },

  // Ajout des configurations pour ESLint et TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
