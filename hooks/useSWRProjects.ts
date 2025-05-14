import useSWR, { mutate } from "swr"
import type { Project } from "@/types/project"

// Clé de cache pour les projets
const PROJECTS_CACHE_KEY = "/api/projects"

export function useSWRProjects() {
  const { data, error, isLoading, isValidating, mutate: mutateProjects } = useSWR<Project[]>(PROJECTS_CACHE_KEY)

  // Fonction pour créer un projet et mettre à jour le cache
  const createProject = async (projectData: Omit<Project, "id">) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création du projet")
      }

      const newProject = await response.json()

      // Mettre à jour le cache avec le nouveau projet
      await mutateProjects((currentData) => {
        return currentData ? [...currentData, newProject] : [newProject]
      }, false) // false = ne pas revalider avec le serveur immédiatement

      return newProject
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error)
      throw error
    }
  }

  // Fonction pour mettre à jour un projet et mettre à jour le cache
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du projet")
      }

      const updatedProject = await response.json()

      // Mettre à jour le cache avec le projet mis à jour
      await mutateProjects((currentData) => {
        return currentData
          ? currentData.map((project) => (project.id === projectId ? updatedProject : project))
          : [updatedProject]
      }, false)

      // Mettre à jour également le cache pour le projet individuel
      await mutate(`/api/projects/${projectId}`, updatedProject, false)

      return updatedProject
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error)
      throw error
    }
  }

  // Fonction pour supprimer un projet et mettre à jour le cache
  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du projet")
      }

      // Mettre à jour le cache en supprimant le projet
      await mutateProjects((currentData) => {
        return currentData ? currentData.filter((project) => project.id !== projectId) : []
      }, false)

      // Invalider le cache pour le projet individuel
      await mutate(`/api/projects/${projectId}`, null, false)

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error)
      throw error
    }
  }

  // Fonction pour forcer une revalidation
  const refreshProjects = () => mutateProjects()

  return {
    projects: data || [],
    isLoading,
    isValidating,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  }
}

// Hook pour un projet spécifique
export function useSWRProject(projectId: string | null) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateProject,
  } = useSWR<Project>(projectId ? `/api/projects/${projectId}` : null)

  // Fonction pour mettre à jour le projet et le cache
  const updateProject = async (updates: Partial<Project>) => {
    if (!projectId) return null

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du projet")
      }

      const updatedProject = await response.json()

      // Mettre à jour le cache pour le projet individuel
      await mutateProject(updatedProject, false)

      // Mettre à jour également le cache pour la liste des projets
      await mutate(
        PROJECTS_CACHE_KEY,
        (currentData: Project[] | undefined) => {
          return currentData
            ? currentData.map((project) => (project.id === projectId ? updatedProject : project))
            : [updatedProject]
        },
        false,
      )

      return updatedProject
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error)
      throw error
    }
  }

  // Fonction pour forcer une revalidation
  const refreshProject = () => mutateProject()

  return {
    project: data,
    isLoading,
    isValidating,
    error,
    updateProject,
    refreshProject,
  }
}
