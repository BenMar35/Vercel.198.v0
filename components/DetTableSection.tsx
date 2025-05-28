"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useProjectInfo, type Contact } from "@/hooks/useProjectInfo"
import { LotObservations } from "@/components/LotObservations"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface DetTableSectionProps {
  projectId?: string
  lots?: Array<{
    id: string
    name: string
    numero: string
  }>
}

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

export function DetTableSection({ projectId = "project-1", lots = [] }: DetTableSectionProps) {
  const { projectInfo } = useProjectInfo(projectId)
  const [reportNumber, setReportNumber] = useState("")
  const [reportDate, setReportDate] = useState("")
  const [nextMeetingDate, setNextMeetingDate] = useState("")
  const [participants, setParticipants] = useState<
    {
      id: string
      name: string
      role: string
      address: string
      contact: string
      present: boolean
    }[]
  >([])
  const [observationsGenerales, setObservationsGenerales] = useState("")

  // Récupérer les entreprises sélectionnées et les entreprises
  const [selectedCompanies] = useLocalStorage<SelectedCompany[]>(`selected-companies-${projectId}`, [])
  const [companies] = useLocalStorage<Company[]>(`companies-${projectId}`, [])

  // Écouter les mises à jour des informations du projet
  useEffect(() => {
    const handleProjectInfoUpdate = (event: CustomEvent) => {
      if (event.detail.projectId === projectId) {
        console.log("Mise à jour des informations du projet détectée")
        // Forcer la re-lecture des données
        window.location.reload()
      }
    }

    window.addEventListener("projectInfoUpdated", handleProjectInfoUpdate as EventListener)

    return () => {
      window.removeEventListener("projectInfoUpdated", handleProjectInfoUpdate as EventListener)
    }
  }, [projectId])

  // Initialiser les participants à partir des contacts du projet
  useEffect(() => {
    console.log("ProjectInfo contacts:", projectInfo?.contacts)

    if (projectInfo?.contacts && projectInfo.contacts.length > 0) {
      const initialParticipants = projectInfo.contacts.map((contact: Contact) => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        address: contact.address || "",
        contact: contact.phone || contact.email || "",
        present: false,
      }))

      console.log("Participants initialisés:", initialParticipants)
      setParticipants(initialParticipants)
    } else {
      console.log("Aucun contact trouvé dans projectInfo")
      setParticipants([])
    }
  }, [projectInfo])

  // Fonction pour obtenir le nom de l'entreprise associée à un lot
  const getCompanyNameForLot = (lotId: string) => {
    const selectedCompany = selectedCompanies.find((sc) => sc.lotId === lotId && sc.selected)
    if (selectedCompany) {
      const company = companies.find((c) => c.id === selectedCompany.companyId)
      return company?.["Raison sociale"] || ""
    }
    return ""
  }

  const handlePresenceChange = (id: string, checked: boolean) => {
    setParticipants((prev) =>
      prev.map((participant) => (participant.id === id ? { ...participant, present: checked } : participant)),
    )
  }

  const handleParticipantChange = (id: string, field: string, value: string) => {
    setParticipants((prev) =>
      prev.map((participant) => (participant.id === id ? { ...participant, [field]: value } : participant)),
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-6">Compte rendu</h2>

      <div className="space-y-4">
        {/* Ligne unique avec les 3 champs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium whitespace-nowrap">Numéro de compte rendu :</span>
            <Input
              type="text"
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              className="bg-[#F6F5EB] w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium whitespace-nowrap">Date du compte rendu :</span>
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-[#F6F5EB] w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium whitespace-nowrap">Prochain rendez-vous sur site :</span>
            <Input
              type="date"
              value={nextMeetingDate}
              onChange={(e) => setNextMeetingDate(e.target.value)}
              className="bg-[#F6F5EB] w-40"
            />
          </div>
        </div>

        {/* Titre Intervenants */}
        <div className="mt-8 mb-4">
          <h3 className="text-xl font-semibold">Intervenants</h3>
        </div>

        {/* En-tête du tableau des intervenants */}
        <div className="flex mb-2 font-medium">
          <div className="w-[25%]">Nom</div>
          <div className="w-[20%]">Fonction</div>
          <div className="w-[25%]">Adresse</div>
          <div className="w-[20%]">Tel./port./courriel</div>
          <div className="w-[10%] text-center">Présent</div>
        </div>

        {/* Lignes des intervenants */}
        {participants.length > 0 ? (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center">
                <div className="w-[25%] pr-2">
                  <Input
                    type="text"
                    value={participant.name}
                    onChange={(e) => handleParticipantChange(participant.id, "name", e.target.value)}
                    className="bg-[#F6F5EB]"
                  />
                </div>
                <div className="w-[20%] pr-2">
                  <Input
                    type="text"
                    value={participant.role}
                    onChange={(e) => handleParticipantChange(participant.id, "role", e.target.value)}
                    className="bg-[#F6F5EB]"
                  />
                </div>
                <div className="w-[25%] pr-2">
                  <Input
                    type="text"
                    value={participant.address}
                    onChange={(e) => handleParticipantChange(participant.id, "address", e.target.value)}
                    className="bg-[#F6F5EB]"
                    placeholder="Adresse"
                  />
                </div>
                <div className="w-[20%] pr-2">
                  <Input
                    type="text"
                    value={participant.contact}
                    onChange={(e) => handleParticipantChange(participant.id, "contact", e.target.value)}
                    className="bg-[#F6F5EB]"
                    placeholder="Contact"
                  />
                </div>
                <div className="w-[10%] flex justify-center">
                  <Checkbox
                    id={`present-${participant.id}`}
                    checked={participant.present}
                    onCheckedChange={(checked) => handlePresenceChange(participant.id, checked as boolean)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            Aucun intervenant trouvé. Utilisez le bouton "Intervenants" dans le panneau de droite pour en ajouter.
          </div>
        )}

        {/* Observations générales */}
        <div className="mt-8 mb-4">
          <h3 className="text-xl font-semibold">Observations générales</h3>
          <Textarea
            value={observationsGenerales}
            onChange={(e) => setObservationsGenerales(e.target.value)}
            className="w-full mt-2 bg-[#F6F5EB]"
            rows={4}
            placeholder="Saisissez vos observations générales ici..."
          />
        </div>

        {/* Observations par lot */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Observations par lot</h3>

          {lots && lots.length > 0 ? (
            <div className="space-y-0">
              {lots.map((lot, index) => {
                const companyName = getCompanyNameForLot(lot.id)
                const lotWithCompany = {
                  ...lot,
                  displayName: companyName ? `${lot.name} - ${companyName}` : lot.name,
                }

                return (
                  <div key={lot.id}>
                    <LotObservations lot={lotWithCompany} projectId={projectId} />
                    {index < lots.length - 1 && <div className="border-b border-gray-300 my-4"></div>}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Aucun lot trouvé. Veuillez d'abord définir des lots dans le tableau d'allotissement.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
