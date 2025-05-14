"use client"

import { InfiniteCanvas } from "@/components/InfiniteCanvas"
// Ne pas utiliser InfiniteCanvasV2 pour le moment
// import { InfiniteCanvasV2 } from "@/components/InfiniteCanvasV2"

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <InfiniteCanvas />
    </div>
  )
}
