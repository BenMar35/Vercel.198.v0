"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"
import { Input } from "@/components/ui/input"

type SelectedCompany = {
  id: string
  companyId: string
  offer: string
  conformity: "oui" | "non" | ""
  selected: boolean
  lotId: string
  commentaires: string
  avenant1: string
  avenant2: string
  avenant3: string
  avenant4: string
  bp1: string
  bp2: string
  bp3: string
  bp4: string
}

type Company = {
  id: string
  "Raison sociale": string
  [key: string]: string
}

export default function ComptabiliteChantierPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [selectedCompanies, setSelectedCompanies] = useLocalStorage<SelectedCompany[]>(
    `selected-companies-${projectId}`,
    [],
  )
  const [companies] = useLocalStorage<Company[]>(`companies-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleValueChange = (companyId: string, field: keyof SelectedCompany, value: string) => {
    setSelectedCompanies((prevCompanies) =>
      prevCompanies.map((company) => (company.id === companyId ? { ...company, [field]: value } : company)),
    )
  }

  const calculateTotal = (company: SelectedCompany) => {
    const offer = Number.parseFloat(company.offer) || 0
    const avenants = [company.avenant1, company.avenant2, company.avenant3, company.avenant4]
      .map((a) => Number.parseFloat(a) || 0)
      .reduce((sum, current) => sum + current, 0)
    return offer + avenants
  }

  const calculateTotalPayments = (company: SelectedCompany) => {
    return [company.bp1, company.bp2, company.bp3, company.bp4]
      .map((bp) => Number.parseFloat(bp) || 0)
      .reduce((sum, current) => sum + current, 0)
  }

  const calculateRemainingToPay = (company: SelectedCompany) => {
    return calculateTotal(company) - calculateTotalPayments(company)
  }

  const calculateColumnTotal = (field: "total" | "totalPayments") => {
    return selectedCompanies
      .filter((sc) => sc.selected)
      .reduce((sum, company) => {
        if (field === "total") {
          return sum + calculateTotal(company)
        } else {
          return sum + calculateTotalPayments(company)
        }
      }, 0)
  }

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle="Comptabilité chantier" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-1/14">Raison Sociale</TableHead>
              <TableHead className="text-center w-1/14">Offre</TableHead>
              <TableHead className="text-center w-1/14">Avenant 1</TableHead>
              <TableHead className="text-center w-1/14">Avenant 2</TableHead>
              <TableHead className="text-center w-1/14">Avenant 3</TableHead>
              <TableHead className="text-center w-1/14">Avenant 4</TableHead>
              <TableHead className="text-center w-1/14">Total</TableHead>
              <TableHead className="text-center w-1/14">BP1</TableHead>
              <TableHead className="text-center w-1/14">BP2</TableHead>
              <TableHead className="text-center w-1/14">BP3</TableHead>
              <TableHead className="text-center w-1/14">BP4</TableHead>
              <TableHead className="text-center w-1/14">Total paiements</TableHead>
              <TableHead className="text-center w-1/14">Reste à payer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedCompanies
              .filter((sc) => sc.selected)
              .map((selectedCompany) => {
                const company = companies.find((c) => c.id === selectedCompany.companyId)
                const total = calculateTotal(selectedCompany)
                const totalPayments = calculateTotalPayments(selectedCompany)
                const remainingToPay = calculateRemainingToPay(selectedCompany)

                return (
                  <TableRow key={selectedCompany.id}>
                    <TableCell className="text-center bg-[#F6F5EB]">{company?.["Raison sociale"] || "N/A"}</TableCell>
                    <TableCell className="text-center bg-[#F6F5EB]">
                      {Number.parseFloat(selectedCompany.offer).toFixed(2)} €
                    </TableCell>
                    {["avenant1", "avenant2", "avenant3", "avenant4"].map((avenant) => (
                      <TableCell key={avenant} className="text-center bg-[#F6F5EB]">
                        <Input
                          type="number"
                          value={selectedCompany[avenant as keyof SelectedCompany] || ""}
                          onChange={(e) =>
                            handleValueChange(selectedCompany.id, avenant as keyof SelectedCompany, e.target.value)
                          }
                          className="w-full text-center"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center bg-[#F6F5EB] font-bold">{total.toFixed(2)} €</TableCell>
                    {["bp1", "bp2", "bp3", "bp4"].map((bp) => (
                      <TableCell key={bp} className="text-center bg-[#F6F5EB]">
                        <Input
                          type="number"
                          value={selectedCompany[bp as keyof SelectedCompany] || ""}
                          onChange={(e) =>
                            handleValueChange(selectedCompany.id, bp as keyof SelectedCompany, e.target.value)
                          }
                          className="w-full text-center"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center bg-[#F6F5EB] font-bold">{totalPayments.toFixed(2)} €</TableCell>
                    <TableCell className="text-center bg-[#F6F5EB] font-bold">{remainingToPay.toFixed(2)} €</TableCell>
                  </TableRow>
                )
              })}
            <TableRow>
              <TableCell colSpan={6} className="text-right font-bold">
                Total :
              </TableCell>
              <TableCell className="text-center font-bold">{calculateColumnTotal("total").toFixed(2)} €</TableCell>
              <TableCell colSpan={4}></TableCell>
              <TableCell className="text-center font-bold">
                {calculateColumnTotal("totalPayments").toFixed(2)} €
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
