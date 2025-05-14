"use client"

import { useState, useEffect } from "react"
import type { ProjectInfo } from "@/components/ProjectInfoModal"

export function useProjectInfo(projectId: string) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les données du localStorage au montage du composant
  useEffect(() => {
    const loadProjectInfo = () => {
      try {
        const storedInfo = localStorage.getItem(`project_info_${projectId}`)
        if (storedInfo) {
          setProjectInfo(JSON.parse(storedInfo))
        } else {
          // Initialiser avec des valeurs par défaut si aucune donnée n'existe
          setProjectInfo({
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
          })
        }
      } catch (error) {
        console.error("Error loading project info:", error)
        // Initialiser avec des valeurs par défaut en cas d'erreur
        setProjectInfo({
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
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProjectInfo()
  }, [projectId])

  // Sauvegarder les données dans le localStorage
  const saveProjectInfo = (info: ProjectInfo) => {
    try {
      localStorage.setItem(`project_info_${projectId}`, JSON.stringify(info))
      setProjectInfo(info)
    } catch (error) {
      console.error("Error saving project info:", error)
    }
  }

  return { projectInfo, saveProjectInfo, isLoading }
}
