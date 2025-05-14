"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AORItem = {
  id: string
  description: string
  status: "pending" | "completed"
  date: string
}

export default function AORPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [aorItems, setAORItems] = useLocalStorage<AORItem[]>(`aor-items-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)
  const [newItem, setNewItem] = useState<Omit<AORItem, "id">>({ description: "", status: "pending", date: "" })

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleAddItem = () => {
    const item: AORItem = { ...newItem, id: Date.now().toString() }
    setAORItems([...aorItems, item])
    setNewItem({ description: "", status: "pending", date: "" })
  }

  const handleStatusChange = (id: string) => {
    setAORItems(
      aorItems.map((item) =>
        item.id === id ? { ...item, status: item.status === "pending" ? "completed" : "pending" } : item,
      ),
    )
  }

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle="AOR" />
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Ajouter un élément AOR</h2>
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <Input
              type="date"
              value={newItem.date}
              onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
            />
            <Button onClick={handleAddItem}>Ajouter</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aorItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.status === "pending" ? "En attente" : "Terminé"}</TableCell>
                <TableCell>
                  <Button onClick={() => handleStatusChange(item.id)}>
                    {item.status === "pending" ? "Marquer comme terminé" : "Marquer comme en attente"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
