"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
  className?: string
  href?: string
  onClick?: () => void
}

export function ProjectCard({ project, className, href, onClick }: ProjectCardProps) {
  const getClientTypeColor = (clientType: string) => {
    switch (clientType) {
      case "professionnel":
        return "bg-red-500"
      case "particulier":
        return "bg-yellow-500"
      case "sg":
        return "bg-blue-500"
      case "credit-agricole":
        return "bg-green-500"
      default:
        return "bg-gray-400"
    }
  }

  const CardContent = (
    <div
      className={cn("bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow", className)}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className={`w-4 h-4 rounded-full mr-2 ${getClientTypeColor(project.clientType)}`}></div>
        <h2 className="text-xl font-bold">{project.name}</h2>
      </div>
      <p className="text-gray-600 mb-4">Référence: {project.reference}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Type: {project.clientType}</span>
        <div className="bg-custom-gold text-black py-1 px-3 rounded text-sm">Voir détails</div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{CardContent}</Link>
  }

  return CardContent
}
