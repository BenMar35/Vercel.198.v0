"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import Papa from "papaparse"

type Company = {
  id: string
  "Raison sociale": string
  Adresse: string
  "Code postal": string
  Ville: string
  "Téléphone société": string
  "Email société": string
  Contact: string
  Portable: string
  Email: string
}

type SelectedCompany = {
  id: string
  companyId: string
  offer: string
  conformity: "oui" | "non" | ""
  moinsDisant: boolean
  mieuxDisant: boolean
  lotId: string
  commentaires: string
}

type Lot = {
  id: string
  numero: string
  nom: string
}

export default function AppelOffresPage() {
  const params = useParams()
  const router = useRouter()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [companies, setCompanies] = useLocalStorage<Company[]>(`companies-${projectId}`, [])
  const [selectedCompanies, setSelectedCompanies] = useLocalStorage<SelectedCompany[]>(
    `selected-companies-${projectId}`,
    [],
  )
  const [lots, setLots] = useLocalStorage<Lot[]>(`lots-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)
  const [fileLoaded, setFileLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  // Initialiser les entreprises pour chaque lot
  useEffect(() => {
    const updatedSelectedCompanies = [...selectedCompanies]
    let hasChanges = false

    lots.forEach((lot) => {
      if (!selectedCompanies.some((sc) => sc.lotId === lot.id)) {
        updatedSelectedCompanies.push({
          id: Date.now().toString() + Math.random(),
          companyId: "",
          offer: "",
          conformity: "",
          moinsDisant: false,
          mieuxDisant: false,
          lotId: lot.id,
          commentaires: "",
        })
        hasChanges = true
      }
    })

    if (hasChanges) {
      setSelectedCompanies(updatedSelectedCompanies)
    }
  }, [lots, selectedCompanies, setSelectedCompanies])

  const handleAddCompany = (lotId: string) => {
    setSelectedCompanies([
      ...selectedCompanies,
      {
        id: Date.now().toString(),
        companyId: "",
        offer: "",
        conformity: "",
        moinsDisant: false,
        mieuxDisant: false,
        lotId,
        commentaires: "",
      },
    ])
  }

  const handleSelectCompany = (id: string, companyId: string) => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, companyId } : sc)))
  }

  const handleOfferChange = (id: string, offer: string) => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, offer } : sc)))
  }

  const handleConformityChange = (id: string, conformity: "oui" | "non") => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, conformity } : sc)))
  }

  const handleMoinsDisant = (id: string, checked: boolean) => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, moinsDisant: checked } : sc)))
  }

  const handleMieuxDisant = (id: string, checked: boolean) => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, mieuxDisant: checked } : sc)))
  }

  const handleCommentairesChange = (id: string, commentaires: string) => {
    setSelectedCompanies(selectedCompanies.map((sc) => (sc.id === id ? { ...sc, commentaires } : sc)))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newCompanies = results.data.slice(1).map((row: any, index: number) => {
            const company: Company = { id: `${Date.now()}-${index}` }
            const columns = [
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
            columns.forEach((column, i) => {
              company[column] = row[i] || ""
            })
            return company
          })
          setCompanies(newCompanies)
          setFileLoaded(true)
        },
        header: false,
      })
    }
  }

  // Grouper les entreprises par lot
  const companiesByLot = lots.map((lot) => {
    return {
      lot,
      companies: selectedCompanies.filter((sc) => sc.lotId === lot.id),
    }
  })

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle="Appel d'offres" />
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Liste des entreprises</h2>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
              id="companies-file-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                fileLoaded ? "bg-custom-gold hover:bg-yellow-600" : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              <Plus className="w-6 h-6 text-black" />
            </button>
            <Button
              onClick={() => router.push(`/projects/${projectId}/entreprises`)}
              className="bg-custom-gold hover:bg-yellow-600 text-black font-bold"
            >
              Voir la liste
            </Button>
          </div>
        </div>

        <Table className="bg-white">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%] bg-[#F6F5EB] text-center">Lot</TableHead>
              <TableHead className="w-[20%] bg-[#F6F5EB] text-center">Raison sociale</TableHead>
              <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Offre (€)</TableHead>
              <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Conformité</TableHead>
              <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Moins disant</TableHead>
              <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Mieux disant</TableHead>
              <TableHead className="w-[20%] bg-[#F6F5EB] text-center">Commentaires</TableHead>
              <TableHead className="w-[5%] bg-[#F6F5EB] text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesByLot.map((lotGroup) => {
              const { lot, companies: lotCompanies } = lotGroup

              return lotCompanies.map((selectedCompany, index) => (
                <TableRow key={selectedCompany.id}>
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {lot.nom}
                    </TableCell>
                  )}
                  <TableCell className="bg-[#F6F5EB]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Select
                            onValueChange={(value) => handleSelectCompany(selectedCompany.id, value)}
                            value={selectedCompany.companyId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner une entreprise" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company["Raison sociale"]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedCompany.companyId && (
                            <div>
                              {Object.entries(companies.find((c) => c.id === selectedCompany.companyId) || {}).map(
                                ([key, value]) => (
                                  <p key={key}>
                                    {key}: {value}
                                  </p>
                                ),
                              )}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      type="number"
                      value={selectedCompany.offer}
                      onChange={(e) => handleOfferChange(selectedCompany.id, e.target.value)}
                      placeholder="Montant"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Select
                      onValueChange={(value: "oui" | "non") => handleConformityChange(selectedCompany.id, value)}
                      value={selectedCompany.conformity}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          selectedCompany.conformity === "oui" && "bg-green-100",
                          selectedCompany.conformity === "non" && "bg-orange-100",
                        )}
                      >
                        <SelectValue placeholder="Conformité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oui" className="bg-green-100">
                          Oui
                        </SelectItem>
                        <SelectItem value="non" className="bg-orange-100">
                          Non
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
                    <Checkbox
                      checked={selectedCompany.moinsDisant}
                      onCheckedChange={(checked) => handleMoinsDisant(selectedCompany.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
                    <Checkbox
                      checked={selectedCompany.mieuxDisant}
                      onCheckedChange={(checked) => handleMieuxDisant(selectedCompany.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      value={selectedCompany.commentaires}
                      onChange={(e) => handleCommentairesChange(selectedCompany.id, e.target.value)}
                      placeholder="Commentaires"
                      className="w-full"
                    />
                  </TableCell>
                  {index === lotCompanies.length - 1 && (
                    <TableCell className="bg-[#F6F5EB] text-center" rowSpan={lotCompanies.length}>
                      <Button
                        onClick={() => handleAddCompany(lot.id)}
                        className="w-8 h-8 p-0 bg-custom-gold hover:bg-yellow-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            })}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}
