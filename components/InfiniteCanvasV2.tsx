"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { LeftSidebar } from "./LeftSidebar"
import { RightSidebar } from "./RightSidebar"
import { ProjectInfoModal, type ProjectInfo } from "./ProjectInfoModal"

interface InfiniteCanvasProps {
  projectId: string
  projectName: string
}

export function InfiniteCanvasV2({ projectId, projectName }: InfiniteCanvasProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)

  const fileInputRefLots = useRef<HTMLInputElement>(null)
  const fileInputRefEntreprises = useRef<HTMLInputElement>(null)

  // Chargement des informations du projet depuis le localStorage
  useEffect(() => {
    if (!projectId) return

    const storedInfo = localStorage.getItem(`project_info_${projectId}`)
    if (storedInfo) {
      try {
        setProjectInfo(JSON.parse(storedInfo))
      } catch (error) {
        console.error("Erreur lors du chargement des informations du projet:", error)
        // Initialiser avec des valeurs par défaut en cas d'erreur
        initializeDefaultProjectInfo()
      }
    } else {
      // Initialiser avec des valeurs par défaut si aucune information n'est trouvée
      initializeDefaultProjectInfo()
    }
  }, [projectId])

  const initializeDefaultProjectInfo = () => {
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

  const handleSaveProjectInfo = (info: ProjectInfo) => {
    if (!projectId) return

    try {
      localStorage.setItem(`project_info_${projectId}`, JSON.stringify(info))
      setProjectInfo(info)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des informations du projet:", error)
    }
  }

  const handleLotsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logique existante pour le traitement des fichiers de lots
    console.log("Fichier de lots sélectionné:", e.target.files?.[0]?.name)
  }

  const handleEntreprisesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logique existante pour le traitement des fichiers d'entreprises
    console.log("Fichier d'entreprises sélectionné:", e.target.files?.[0]?.name)
  }

  const toggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen)
  }

  const handleOpenProjectInfo = () => {
    setIsProjectInfoModalOpen(true)
  }

  const handleCloseProjectInfo = () => {
    setIsProjectInfoModalOpen(false)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* Left Sidebar */}
      <LeftSidebar isExpanded={isLeftSidebarOpen} onToggleExpand={toggleLeftSidebar} />

      {/* Right Sidebar */}
      <RightSidebar
        onOpenProjectInfo={handleOpenProjectInfo}
        fileInputRefLots={fileInputRefLots}
        fileInputRefEntreprises={fileInputRefEntreprises}
        onLotsFileChange={handleLotsFileChange}
        onEntreprisesFileChange={handleEntreprisesFileChange}
      />

      {/* Project Info Modal */}
      {projectInfo && (
        <ProjectInfoModal
          isOpen={isProjectInfoModalOpen}
          onClose={handleCloseProjectInfo}
          projectId={projectId}
          initialData={projectInfo}
          onSave={handleSaveProjectInfo}
        />
      )}
    </div>
  )
}
