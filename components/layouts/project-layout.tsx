"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"
import type { Project } from "@/types/project"

interface ProjectLayoutProps {
  children: React.ReactNode
  pageTitle: string
}

export function ProjectLayout({ children, pageTitle }: ProjectLayoutProps) {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle={pageTitle} />
        {children}
      </main>
    </div>
  )
}
