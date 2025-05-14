"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"

type Intervenant = {
  id: string
  nom: string
  entreprise: string
  adresse: string
  contact: string
  present: boolean
}

type Entreprise = {
  id: string
  nom: string
  lot: string
  representant: string
  contact: string
  present: boolean
  absent: boolean
  convoque: boolean
}

type ObservationParticuliere = {
  id: string
  intervenant: string
  commentaires: string
  previsionnel: string
  realisation: string
  deroulement: string
}

type CompteRendu = {
  id: string
  numero: string
  date: string
  prochainRdv: string
  adresseChantier: string
  intervenants: Intervenant[]
  entreprises: Entreprise[]
  observationsGenerales: string
  observationsParticulieres: ObservationParticuliere[]
}

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

export default function SuiviChantierPage() {
  const params = useParams()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [compteRendus, setCompteRendus] = useLocalStorage<CompteRendu[]>(`comptes-rendus-${projectId}`, [])
  const [currentCompteRendu, setCurrentCompteRendu] = useState<CompteRendu | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [companies] = useLocalStorage<Company[]>(`companies-${projectId}`, [])
  const [selectedCompanies] = useLocalStorage<Company[]>(`selected-companies-${projectId}`, [])

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  useEffect(() => {
    if (compteRendus.length === 0) {
      handleAddCompteRendu()
    } else {
      setCurrentCompteRendu(compteRendus[compteRendus.length - 1])
    }
  }, [compteRendus])

  const handleInputChange = (field: keyof CompteRendu, value: string) => {
    if (currentCompteRendu) {
      setCurrentCompteRendu({ ...currentCompteRendu, [field]: value })
    }
  }

  const handleIntervenantChange = (id: string, field: keyof Intervenant, value: string | boolean) => {
    if (currentCompteRendu) {
      const updatedIntervenants = currentCompteRendu.intervenants.map((intervenant) =>
        intervenant.id === id ? { ...intervenant, [field]: value } : intervenant,
      )
      setCurrentCompteRendu({ ...currentCompteRendu, intervenants: updatedIntervenants })
    }
  }

  const handleEntrepriseChange = (id: string, field: keyof Entreprise, value: string | boolean) => {
    if (currentCompteRendu) {
      const updatedEntreprises = currentCompteRendu.entreprises.map((entreprise) =>
        entreprise.id === id ? { ...entreprise, [field]: value } : entreprise,
      )
      setCurrentCompteRendu({ ...currentCompteRendu, entreprises: updatedEntreprises })
    }
  }

  const handleObservationParticuliereChange = (id: string, field: keyof ObservationParticuliere, value: string) => {
    if (currentCompteRendu) {
      const updatedObservations = currentCompteRendu.observationsParticulieres.map((observation) =>
        observation.id === id ? { ...observation, [field]: value } : observation,
      )
      setCurrentCompteRendu({ ...currentCompteRendu, observationsParticulieres: updatedObservations })
    }
  }

  const handleAddCompteRendu = () => {
    const newCompteRendu: CompteRendu = {
      id: Date.now().toString(),
      numero: `${compteRendus.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      prochainRdv: "",
      adresseChantier: "",
      intervenants: [],
      entreprises: selectedCompanies.map((company) => ({
        id: company.id,
        nom: company["Raison sociale"],
        lot: "", // You might want to add a lot field to the selected companies
        representant: company.Contact,
        contact: company.Portable || company["Téléphone société"],
        present: false,
        absent: false,
        convoque: true,
      })),
      observationsGenerales: "",
      observationsParticulieres: [],
    }
    setCompteRendus([...compteRendus, newCompteRendu])
    setCurrentCompteRendu(newCompteRendu)
  }

  const handleSaveCompteRendu = () => {
    if (currentCompteRendu) {
      const updatedCompteRendus = compteRendus.map((cr) => (cr.id === currentCompteRendu.id ? currentCompteRendu : cr))
      setCompteRendus(updatedCompteRendus)
    }
  }

  if (!project || !currentCompteRendu) {
    return <div>Chargement...</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle="Suivi de chantier" />
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Compte rendu N°{currentCompteRendu.numero}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              type="date"
              value={currentCompteRendu.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              placeholder="Date"
            />
            <Input
              type="date"
              value={currentCompteRendu.prochainRdv}
              onChange={(e) => handleInputChange("prochainRdv", e.target.value)}
              placeholder="Prochain rendez-vous"
            />
          </div>
          <Input
            value={currentCompteRendu.adresseChantier}
            onChange={(e) => handleInputChange("adresseChantier", e.target.value)}
            placeholder="Adresse du chantier"
            className="mb-4"
          />
          <h3 className="font-bold mb-2">Intervenants</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Nom</TableHead>
                <TableHead className="w-1/4">Entreprise</TableHead>
                <TableHead className="w-1/4">Adresse</TableHead>
                <TableHead className="w-1/6">Contact</TableHead>
                <TableHead className="w-1/12">Présent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCompteRendu.intervenants.map((intervenant) => (
                <TableRow key={intervenant.id}>
                  <TableCell>
                    <Input
                      value={intervenant.nom}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "nom", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={intervenant.entreprise}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "entreprise", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={intervenant.adresse}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "adresse", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={intervenant.contact}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "contact", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={intervenant.present}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "present", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            onClick={() =>
              setCurrentCompteRendu({
                ...currentCompteRendu,
                intervenants: [
                  ...currentCompteRendu.intervenants,
                  { id: Date.now().toString(), nom: "", entreprise: "", adresse: "", contact: "", present: false },
                ],
              })
            }
            className="mt-2 mb-4"
          >
            Ajouter un intervenant
          </Button>

          <h3 className="font-bold mb-2">Entreprises</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Nom</TableHead>
                <TableHead className="w-1/12">Lot</TableHead>
                <TableHead className="w-1/6">Représentant</TableHead>
                <TableHead className="w-1/6">Contact</TableHead>
                <TableHead className="w-1/12">Présent</TableHead>
                <TableHead className="w-1/12">Absent</TableHead>
                <TableHead className="w-1/12">Convoqué</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCompteRendu.entreprises.map((entreprise) => (
                <TableRow key={entreprise.id}>
                  <TableCell>
                    <Input
                      value={entreprise.nom}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "nom", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={entreprise.lot}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "lot", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={entreprise.representant}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "representant", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={entreprise.contact}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "contact", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={entreprise.present}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "present", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={entreprise.absent}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "absent", e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={entreprise.convoque}
                      onChange={(e) => handleEntrepriseChange(entreprise.id, "convoque", e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <h3 className="font-bold mb-2 mt-4">Observations générales</h3>
          <Textarea
            value={currentCompteRendu.observationsGenerales}
            onChange={(e) => handleInputChange("observationsGenerales", e.target.value)}
            className="mb-4"
            rows={4}
          />

          <h3 className="font-bold mb-2">Observations particulières</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Intervenant</TableHead>
                <TableHead className="w-1/4">Commentaires</TableHead>
                <TableHead className="w-1/6">Prévisionnel</TableHead>
                <TableHead className="w-1/6">Réalisation</TableHead>
                <TableHead className="w-1/6">Déroulement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCompteRendu.observationsParticulieres.map((observation) => (
                <TableRow key={observation.id}>
                  <TableCell>
                    <Input
                      value={observation.intervenant}
                      onChange={(e) =>
                        handleObservationParticuliereChange(observation.id, "intervenant", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={observation.commentaires}
                      onChange={(e) =>
                        handleObservationParticuliereChange(observation.id, "commentaires", e.target.value)
                      }
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={observation.previsionnel}
                      onChange={(e) =>
                        handleObservationParticuliereChange(observation.id, "previsionnel", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={observation.realisation}
                      onChange={(e) =>
                        handleObservationParticuliereChange(observation.id, "realisation", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={observation.deroulement}
                      onChange={(e) =>
                        handleObservationParticuliereChange(observation.id, "deroulement", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            onClick={() =>
              setCurrentCompteRendu({
                ...currentCompteRendu,
                observationsParticulieres: [
                  ...currentCompteRendu.observationsParticulieres,
                  {
                    id: Date.now().toString(),
                    intervenant: "",
                    commentaires: "",
                    previsionnel: "",
                    realisation: "",
                    deroulement: "",
                  },
                ],
              })
            }
            className="mt-2 mb-4"
          >
            Ajouter une observation particulière
          </Button>

          <Button onClick={handleSaveCompteRendu} className="mt-4">
            Enregistrer le compte rendu
          </Button>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Comptes rendus précédents</h2>
          {compteRendus.map((cr) => (
            <div key={cr.id} className="bg-white p-4 rounded-lg shadow mb-4">
              <h3 className="font-bold">
                Compte rendu N°{cr.numero} - {cr.date}
              </h3>
              <Button onClick={() => setCurrentCompteRendu(cr)} className="mt-2">
                Modifier
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
