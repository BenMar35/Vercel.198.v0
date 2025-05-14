"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

interface CanvasControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  scale: number
  onScaleChange: (scale: number) => void
  className?: string
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onReset,
  scale,
  onScaleChange,
  className = "",
}: CanvasControlsProps) {
  const [showSlider, setShowSlider] = useState(false)

  return (
    <div className={`bg-white bg-opacity-70 p-2 rounded shadow-md z-50 ${className}`}>
      <div className="flex gap-2">
        <Button
          onClick={onZoomIn}
          className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded h-8 w-8"
        >
          +
        </Button>
        <Button
          onClick={onZoomOut}
          className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded h-8 w-8"
        >
          -
        </Button>
        <Button onClick={onReset} className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded">
          Reset
        </Button>
        <Button
          onClick={() => setShowSlider(!showSlider)}
          className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded"
        >
          {showSlider ? "Masquer" : "Zoom précis"}
        </Button>
      </div>

      {showSlider && (
        <div className="mt-2 px-2">
          <Slider
            value={[scale * 100]}
            min={10}
            max={500}
            step={5}
            onValueChange={(value) => onScaleChange(value[0] / 100)}
          />
          <div className="text-center text-sm mt-1">{Math.round(scale * 100)}%</div>
        </div>
      )}
    </div>
  )
}
