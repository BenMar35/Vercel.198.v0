"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Project = {
  id: string
  name: string
  description: string
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Ici, nous simulons le chargement des projets depuis une API
    // Plus tard, vous pourrez remplacer ceci par un vrai appel API
    setProjects([
      { id: "1", name: "Projet A", description: "Description du projet A" },
      { id: "2", name: "Projet B", description: "Description du projet B" },
    ])
  }, [])

  return (
    <div className="grid gap-4 mt-4">
      {projects.map((project) => (
        <Link href={`/project/${project.id}`} key={project.id}>
          <Card>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{project.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
