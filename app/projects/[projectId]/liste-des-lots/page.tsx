"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProjectSidebar from "@/components/ProjectSidebar"
import Papa from "papaparse"

type Lot = {
  id: string
  numero: string
  nom: string
}

export default function ListeDesLotsPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [lots, setLots] = useLocalStorage<Lot[]>(`lots-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleLotsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newLots = results.data.slice(1).map((row: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            numero: row[0] || "",
            nom: row[1] || "",
          }))
          setLots(newLots)
        },
        header: false,
      })
    }
  }

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-custom-black">
          {project.reference} - {project.name} - Liste des lots
        </h1>
        <div className="mb-6">
          <Input type="file" onChange={handleLotsFileUpload} accept=".csv" className="font-sans bg-white" />
        </div>
        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead>Nom du lot</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell>{lot.nom}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
