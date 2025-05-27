"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useProjectInfo } from "@/hooks/useProjectInfo"
import { LotObservations } from "@/components/LotObservations"

interface DetTableSectionProps {
  projectId?: string
  lots?: Array<{
    id: string
    name: string
    numero: string
  }>
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

  // Initialiser les participants à partir des contacts du projet
  useEffect(() => {
    if (projectInfo?.contacts && projectInfo.contacts.length > 0) {
      const initialParticipants = projectInfo.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        address: contact.address || "",
        contact: contact.contact || "",
        present: false,
      }))
      setParticipants(initialParticipants)
    }
  }, [projectInfo])

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
        {/* Ligne 1: Numéro de compte rendu */}
        <div className="flex items-center">
          <div className="w-1/3 font-medium">Numéro de compte rendu :</div>
          <div className="w-2/3">
            <Input
              type="text"
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
              className="bg-[#EDEBDF]"
            />
          </div>
        </div>

        {/* Ligne 2: Date du compte rendu */}
        <div className="flex items-center">
          <div className="w-1/3 font-medium">Date du compte rendu :</div>
          <div className="w-2/3">
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-[#EDEBDF]"
            />
          </div>
        </div>

        {/* Ligne 3: Prochain rendez-vous sur site */}
        <div className="flex items-center">
          <div className="w-1/3 font-medium">Prochain rendez-vous sur site :</div>
          <div className="w-2/3">
            <Input
              type="date"
              value={nextMeetingDate}
              onChange={(e) => setNextMeetingDate(e.target.value)}
              className="bg-[#EDEBDF]"
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
                    className="bg-[#EDEBDF]"
                  />
                </div>
                <div className="w-[20%] pr-2">
                  <Input
                    type="text"
                    value={participant.role}
                    onChange={(e) => handleParticipantChange(participant.id, "role", e.target.value)}
                    className="bg-[#EDEBDF]"
                  />
                </div>
                <div className="w-[25%] pr-2">
                  <Input
                    type="text"
                    value={participant.address}
                    onChange={(e) => handleParticipantChange(participant.id, "address", e.target.value)}
                    className="bg-[#EDEBDF]"
                    placeholder="Adresse"
                  />
                </div>
                <div className="w-[20%] pr-2">
                  <Input
                    type="text"
                    value={participant.contact}
                    onChange={(e) => handleParticipantChange(participant.id, "contact", e.target.value)}
                    className="bg-[#EDEBDF]"
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
            className="w-full mt-2 bg-[#EDEBDF]"
            rows={4}
            placeholder="Saisissez vos observations générales ici..."
          />
        </div>

        {/* Observations par lot */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Observations par lot</h3>

          {lots && lots.length > 0 ? (
            <div className="space-y-0">
              {lots.map((lot, index) => (
                <div key={lot.id}>
                  <LotObservations lot={lot} projectId={projectId} />
                  {index < lots.length - 1 && <div className="border-b border-gray-300 my-4"></div>}
                </div>
              ))}
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
