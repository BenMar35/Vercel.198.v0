"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Project = {
  id: string
  name: string
  description: string
}

export default function ProjectDetails() {
  const [project, setProject] = useState<Project | null>(null)
  const params = useParams()
  const { id } = params

  useEffect(() => {
    // Ici, nous simulons le chargement d'un projet depuis une API
    // Plus tard, vous pourrez remplacer ceci par un vrai appel API
    setProject({
      id: id as string,
      name: `Projet ${id}`,
      description: `Description détaillée du projet ${id}`,
    })
  }, [id])

  if (!project) return <div>Chargement...</div>

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{project.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
