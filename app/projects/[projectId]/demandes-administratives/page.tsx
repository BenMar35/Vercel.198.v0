"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"

type UploadedFile = {
  id: string
  name: string
  type: string
  url: string
}

export default function DemandesAdministrativesPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [files, setFiles] = useLocalStorage<UploadedFile[]>(`demandes-administratives-files-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file) => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }))
      setFiles([...files, ...newFiles])
    }
  }

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <PageTitle
          projectReference={project.reference}
          projectName={project.name}
          pageTitle="Demandes Administratives"
        />
        <div className="mb-6">
          <Input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
            multiple
            className="font-caviar bg-white"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="w-full aspect-square bg-white">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.url || "/placeholder.svg"}
                    alt={file.name}
                    className="max-w-full max-h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <p className="font-bold mb-2">{file.name}</p>
                    <p>{file.type.split("/")[1].toUpperCase()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
