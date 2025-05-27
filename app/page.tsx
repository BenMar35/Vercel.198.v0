"use client"

import dynamic from "next/dynamic"

// Chargement dynamique d'InfiniteCanvas uniquement côté client
const InfiniteCanvas = dynamic(
  () => import("@/components/InfiniteCanvas").then((mod) => ({ default: mod.InfiniteCanvas })),
  {
    ssr: false,
    loading: () => <div className="w-screen h-screen flex items-center justify-center">Chargement...</div>,
  },
)

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <InfiniteCanvas />
    </div>
  )
}
