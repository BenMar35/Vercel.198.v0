"use client"

import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { type Project, PHASES } from "@/types/project"
import ProjectSidebar from "@/components/ProjectSidebar"

export default function ProjectPhasePage() {
  const params = useParams()
  const { projectId, phaseId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])

  const project = projects.find((p) => p.id === projectId)
  const phase = PHASES.find((p) => p.id === phaseId)

  if (!project || !phase) {
    return <div>Projet ou phase non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-custom-gray">
      <ProjectSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4 text-custom-gold">{project.name}</h1>
        <h2 className="text-xl font-semibold mb-2">{phase.name}</h2>
        <div className="bg-custom-white p-4 rounded-lg shadow-md">
          <p>
            Contenu de la phase {phase.name} pour le projet {project.name}
          </p>
          <p>Référence du projet : {project.reference}</p>
          <p>Type de client : {project.clientType}</p>
          {/* Ajoutez ici le contenu spécifique à chaque phase */}
        </div>
      </main>
    </div>
  )
}
