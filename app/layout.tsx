import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { FontLoader } from "./fonts"

// Définir la police Inter comme fallback
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gestion de Dossiers Projet",
  description: "Application de gestion de dossiers de projets",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <FontLoader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
