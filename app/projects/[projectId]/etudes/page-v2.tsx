"use client"

import type React from "react"

import { useRef } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ProjectLayout } from "@/components/layouts/project-layout"
import { TaskListV2 } from "@/components/TaskListV2"

type UploadedFile = {
  id: string
  name: string
  type: string
  url: string
}

export default function EtudesPageV2() {
  const params = useParams()
  const { projectId } = params as { projectId: string }
  const [files, setFiles] = useLocalStorage<UploadedFile[]>(`files-${projectId}`, [])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <ProjectLayout pageTitle="Etudes">
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            files.length > 0 ? "bg-custom-gold hover:bg-yellow-600" : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          <Plus className="w-6 h-6 text-black" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
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

      <TaskListV2 projectId={projectId} title="Tâches d'étude" sectionTitle="Liste des tâches à réaliser" />
    </ProjectLayout>
  )
}
