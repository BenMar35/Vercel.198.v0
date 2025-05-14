/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Désactiver l'optimisation des polices pour éviter les problèmes avec next/font/local
  optimizeFonts: false,
}

module.exports = nextConfig
