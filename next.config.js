/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Désactiver l'optimisation des polices pour éviter les problèmes avec next/font/local
  optimizeFonts: false,
  // Ignorer les erreurs ESLint pendant la construction
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorer les erreurs TypeScript pendant la construction
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver l'optimisation des images
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
