"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"

type ProjectContextType = {
  project: Project | null
  isLoading: boolean
  error: Error | null
  updateProject: (data: Partial<Project>) => void
  deleteProject: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({
  children,
  projectId,
}: {
  children: React.ReactNode
  projectId: string
}) {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    try {
      const foundProject = projects.find((p) => p.id === projectId)
      if (foundProject) {
        setProject(foundProject)
      } else {
        setError(new Error("Projet non trouvé"))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Une erreur est survenue"))
    } finally {
      setIsLoading(false)
    }
  }, [projectId, projects])

  const updateProject = (data: Partial<Project>) => {
    if (!project) return

    const updatedProject = { ...project, ...data }
    setProject(updatedProject)

    const updatedProjects = projects.map((p) => (p.id === projectId ? updatedProject : p))
    setProjects(updatedProjects)
  }

  const deleteProject = () => {
    const updatedProjects = projects.filter((p) => p.id !== projectId)
    setProjects(updatedProjects)
    setProject(null)
  }

  return (
    <ProjectContext.Provider
      value={{
        project,
        isLoading,
        error,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
