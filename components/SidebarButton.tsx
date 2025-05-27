"use client"

import type { LucideIcon } from "lucide-react"

interface SidebarButtonProps {
  icon: LucideIcon
  onClick: () => void
  tooltip?: string
}

export function SidebarButton({ icon: Icon, onClick, tooltip }: SidebarButtonProps) {
  return (
    <div className="flex flex-col items-center mb-6 w-full">
      <button
        onClick={onClick}
        className="rounded-full flex items-center justify-center bg-custom-gold hover:bg-yellow-600"
        style={{
          width: "40px",
          height: "40px",
          maxWidth: "40px",
          maxHeight: "40px",
        }}
        title={tooltip}
      >
        <Icon className="w-4 h-4 text-black" />
      </button>
      {tooltip && <span className="text-xs mt-1">{tooltip}</span>}
    </div>
  )
}
