"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  titleClassName?: string
  contentClassName?: string
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className = "",
  titleClassName = "",
  contentClassName = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Arrêter la propagation des événements pour éviter que le canvas ne capture les événements
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className={cn("mb-4 border rounded-md overflow-hidden", className)}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      <div
        className={cn("bg-gray-100 p-2 flex justify-between items-center cursor-pointer", titleClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-semibold">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isOpen && <div className={cn("p-2", contentClassName)}>{children}</div>}
    </div>
  )
}
