"use client"

import { useState, useEffect } from "react"
import type { ProjectInfo } from "@/components/ProjectInfoModal"

export function useProjectInfo(projectId: string) {
  const [projectInfo, setProjectInfoState] = useState<ProjectInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }

    try {
      const storedInfo = localStorage.getItem(`project_info_${projectId}`)
      if (storedInfo) {
        setProjectInfoState(JSON.parse(storedInfo))
      } else {
        // Initialiser avec des valeurs par défaut
        const defaultInfo: ProjectInfo = {
          projectId,
          affaireNumber: "",
          projectName: "",
          maitriseOuvrage: "",
          references: [{ id: "ref-1", value: "" }],
          contacts: [{ id: "contact-1", name: "", role: "", phone: "", email: "" }],
          address: {
            street: "",
            postalCode: "",
            city: "",
          },
        }
        setProjectInfoState(defaultInfo)
        localStorage.setItem(`project_info_${projectId}`, JSON.stringify(defaultInfo))
      }
    } catch (error) {
      console.error("Erreur lors du chargement des informations du projet:", error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  const setProjectInfo = (info: ProjectInfo) => {
    if (!projectId) return

    try {
      localStorage.setItem(`project_info_${projectId}`, JSON.stringify(info))
      setProjectInfoState(info)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations du projet:", error)
    }
  }

  return { projectInfo, setProjectInfo, isLoading }
}
