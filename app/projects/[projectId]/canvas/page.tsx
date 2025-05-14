"use client"

import { useParams } from "next/navigation"
import { InfiniteCanvasV2 } from "@/components/InfiniteCanvasV2"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useEffect, useState } from "react"
import type { Project } from "@/types/project"

export default function ProjectCanvasPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  if (!project) {
    return <div>Chargement...</div>
  }

  return (
    <div className="w-screen h-screen">
      <InfiniteCanvasV2 projectId={projectId} projectName={`${project.reference} - ${project.name}`} />
    </div>
  )
}
