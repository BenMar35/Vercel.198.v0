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

export const COMPANY_COLUMNS = [
  "Raison sociale",
  "Adresse",
  "Code postal",
  "Ville",
  "Téléphone société",
  "Email société",
  "Contact",
  "Portable",
  "Email",
]

type Company = {
  id: string
  [key: string]: string
}

export default function EntreprisesPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [companies, setCompanies] = useLocalStorage<Company[]>(`companies-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newCompanies = results.data.slice(1).map((row: any, index: number) => {
            const company: Company = { id: `${Date.now()}-${index}` }
            COMPANY_COLUMNS.forEach((column, i) => {
              company[column] = row[i] || ""
            })
            return company
          })
          setCompanies(newCompanies)
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
          {project.reference} - {project.name} - Liste des entreprises
        </h1>
        <div className="mb-6">
          <Input type="file" onChange={handleFileUpload} accept=".csv" className="font-sans" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {COMPANY_COLUMNS.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                {COMPANY_COLUMNS.map((column) => (
                  <TableCell key={`${company.id}-${column}`}>{company[column]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
