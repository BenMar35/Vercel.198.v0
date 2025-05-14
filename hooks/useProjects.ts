"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Project } from "@/types/project"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) {
      setProjects([])
      setIsLoading(false)
      return
    }

    const fetchProjects = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Transformer les données pour correspondre à notre type Project
        const formattedProjects: Project[] = data.map((project) => ({
          id: project.id,
          reference: project.reference,
          name: project.name,
          clientType: project.client_type,
        }))

        setProjects(formattedProjects)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Une erreur est survenue"))
        console.error("Error fetching projects:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  const addProject = async (projectData: Omit<Project, "id">) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          reference: projectData.reference,
          name: projectData.name,
          client_type: projectData.clientType,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      const newProject: Project = {
        id: data.id,
        reference: data.reference,
        name: data.name,
        clientType: data.client_type,
      }

      setProjects((prev) => [newProject, ...prev])
      return newProject
    } catch (err) {
      console.error("Error adding project:", err)
      return null
    }
  }

  const updateProject = async (id: string, projectData: Partial<Omit<Project, "id">>) => {
    if (!user) return false

    try {
      const updateData: any = {}
      if (projectData.reference) updateData.reference = projectData.reference
      if (projectData.name) updateData.name = projectData.name
      if (projectData.clientType) updateData.client_type = projectData.clientType

      const { error } = await supabase.from("projects").update(updateData).eq("id", id)

      if (error) {
        throw error
      }

      setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, ...projectData } : project)))
      return true
    } catch (err) {
      console.error("Error updating project:", err)
      return false
    }
  }

  const deleteProject = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) {
        throw error
      }

      setProjects((prev) => prev.filter((project) => project.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting project:", err)
      return false
    }
  }

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
  }
}
