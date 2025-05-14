"use client"
import type { LucideIcon } from "lucide-react"

interface SidebarButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  className?: string
}

export function SidebarButton({ icon: Icon, label, onClick, className = "" }: SidebarButtonProps) {
  return (
    <div className={`flex flex-col items-center mb-6 w-full ${className}`}>
      <button
        onClick={onClick}
        className="rounded-full flex items-center justify-center bg-custom-gold hover:bg-yellow-600 transition-colors"
        style={{
          width: "40px",
          height: "40px",
          maxWidth: "40px",
          maxHeight: "40px",
        }}
      >
        <Icon className="w-4 h-4 text-black" />
      </button>
      <span className="text-xs mt-1">{label}</span>
    </div>
  )
}
