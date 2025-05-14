"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { SectionTable } from "./SectionTable"
import { SectionTableEntreprise } from "./SectionTableEntreprise"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid"

interface Intervenant {
  id: string
  nom: string
  adresse: string
  contact: string
  statut: "present" | "absent" | "excuse" | "represente" | ""
  convoque: boolean
}

interface Participant {
  id: string
  role: string
  nom: string
  adresse: string
  contact: string
  present: boolean
}

export const SuiviChantierTable = () => {
  const [projetInfo, setProjetInfo] = useState({
    numero: "01 71 310 2023",
    titre: "Réaménagement de l'agence SG PONT-L'ABBÉ",
    adresse: "SOCIÉTÉ GÉNÉRALE\n15 place Gambetta\n29120 PONT-L'ABBÉ",
  })

  const [compteRenduInfo, setCompteRenduInfo] = useState({
    numero: "01",
    date: new Date(),
    semaine: "14",
  })

  const [prochainRdv, setProchainRdv] = useState({
    date: new Date(),
    heure: "14h00",
    lieu: "sur site",
    semaine: "15",
  })

  const [sections, setSections] = useState({
    maitreOuvrage: true,
    architecte: true,
    betCVC: true,
    betStructure: true,
    betThermique: true,
    coordinationSPS: true,
    bureauControle: true,
    entreprises: true,
  })

  const [participants, setParticipants] = useState<Record<string, Participant[]>>({
    maitreOuvrage: [
      {
        id: uuidv4(),
        role: "Maître d'Ouvrage",
        nom: "Société Générale",
        adresse: "29 boulevard Haussmann, 75009 Paris",
        contact: "contact@socgen.fr",
        present: true,
      },
    ],
    architecte: [
      {
        id: uuidv4(),
        role: "Architecte",
        nom: "Cabinet Architecture",
        adresse: "15 rue des Architectes, 75001 Paris",
        contact: "contact@cabinet-archi.fr",
        present: true,
      },
    ],
    betCVC: [
      {
        id: uuidv4(),
        role: "BET CVC",
        nom: "BET Fluides",
        adresse: "8 avenue des Ingénieurs, 75015 Paris",
        contact: "contact@bet-fluides.fr",
        present: true,
      },
    ],
    betStructure: [
      {
        id: uuidv4(),
        role: "BET Structure",
        nom: "BET Structure",
        adresse: "12 rue de la Construction, 75013 Paris",
        contact: "contact@bet-structure.fr",
        present: false,
      },
    ],
    betThermique: [
      {
        id: uuidv4(),
        role: "BET thermique",
        nom: "BET Thermique",
        adresse: "5 boulevard de l'Énergie, 75012 Paris",
        contact: "contact@bet-thermique.fr",
        present: true,
      },
    ],
    coordinationSPS: [
      {
        id: uuidv4(),
        role: "Coordinateur SPS",
        nom: "Coordination SPS",
        adresse: "3 rue de la Sécurité, 75011 Paris",
        contact: "contact@coordination-sps.fr",
        present: false,
      },
    ],
    bureauControle: [
      {
        id: uuidv4(),
        role: "Bureau de contrôle",
        nom: "Bureau Veritas",
        adresse: "7 avenue du Contrôle, 75014 Paris",
        contact: "contact@bureau-veritas.fr",
        present: true,
      },
    ],
  })

  const [intervenants, setIntervenants] = useState<Intervenant[]>([
    {
      id: uuidv4(),
      nom: "Entreprise Générale",
      adresse: "10 rue du Bâtiment, 75010 Paris",
      contact: "contact@entreprise-generale.fr",
      statut: "present",
      convoque: true,
    },
    {
      id: uuidv4(),
      nom: "Électricité SA",
      adresse: "22 avenue de l'Électricité, 75018 Paris",
      contact: "contact@electricite-sa.fr",
      statut: "absent",
      convoque: true,
    },
    {
      id: uuidv4(),
      nom: "Plomberie Plus",
      adresse: "14 rue des Tuyaux, 75019 Paris",
      contact: "contact@plomberie-plus.fr",
      statut: "present",
      convoque: true,
    },
  ])

  // Arrêter la propagation des événements uniquement sur le conteneur principal
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const ajouterIntervenant = () => {
    setIntervenants([
      ...intervenants,
      {
        id: uuidv4(),
        nom: "",
        adresse: "",
        contact: "",
        statut: "",
        convoque: false,
      },
    ])
  }

  const updateIntervenant = (id: string, field: keyof Intervenant, value: any) => {
    setIntervenants(intervenants.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const updateParticipant = (section: string, id: string, field: keyof Participant, value: any) => {
    setParticipants((prev) => {
      const updatedSection = prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item))
      return { ...prev, [section]: updatedSection }
    })
  }

  const toggleParticipantPresence = (section: string, id: string) => {
    setParticipants((prev) => {
      const updatedSection = prev[section].map((item) => (item.id === id ? { ...item, present: !item.present } : item))
      return { ...prev, [section]: updatedSection }
    })
  }

  const updateProjetInfo = (field: keyof typeof projetInfo, value: any) => {
    setProjetInfo({ ...projetInfo, [field]: value })
  }

  const updateCompteRenduInfo = (field: keyof typeof compteRenduInfo, value: any) => {
    setCompteRenduInfo({ ...compteRenduInfo, [field]: value })
  }

  const updateProchainRdv = (field: keyof typeof prochainRdv, value: any) => {
    setProchainRdv({ ...prochainRdv, [field]: value })
  }

  const ajouterParticipant = (section: string, role = "") => {
    setParticipants((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        {
          id: uuidv4(),
          role,
          nom: "",
          adresse: "",
          contact: "",
          present: false,
        },
      ],
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl" onMouseDown={stopPropagation}>
      {/* En-tête avec logo */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div className="flex-1">
          {/* Logo placeholder - remplacer par votre logo */}
          <div className="w-40 h-16 bg-gray-200 flex items-center justify-center mb-4">
            <span className="text-gray-500">LOGO</span>
          </div>

          {/* Titre du compte rendu */}
          <div className="flex flex-wrap items-center gap-2 mb-4 w-full">
            <h1 className="text-2xl font-bold">Compte rendu n° : </h1>
            <Label htmlFor="compte-rendu-numero" className="sr-only">
              Numéro du compte rendu
            </Label>
            <Input
              id="compte-rendu-numero"
              value={compteRenduInfo.numero}
              onChange={(e) => updateCompteRenduInfo("numero", e.target.value)}
              className="w-16 text-xl font-bold"
            />
            <span className="text-xl font-bold">du</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                  aria-label="Sélectionner une date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {compteRenduInfo.date
                    ? format(compteRenduInfo.date, "dd MMMM yyyy", { locale: fr })
                    : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={compteRenduInfo.date}
                  onSelect={(date) => date && updateCompteRenduInfo("date", date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xl font-bold">(sem</span>
            <Label htmlFor="compte-rendu-semaine" className="sr-only">
              Semaine du compte rendu
            </Label>
            <Input
              id="compte-rendu-semaine"
              value={compteRenduInfo.semaine}
              onChange={(e) => updateCompteRenduInfo("semaine", e.target.value)}
              className="w-16 text-xl font-bold"
            />
            <span className="text-xl font-bold">)</span>
          </div>

          {/* Prochain rendez-vous */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="font-medium">Prochain rendez-vous sur site : le</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 px-2 py-1"
                  aria-label="Sélectionner la date du prochain rendez-vous"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {prochainRdv.date ? format(prochainRdv.date, "dd/MM/yyyy", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={prochainRdv.date}
                  onSelect={(date) => date && updateProchainRdv("date", date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            <span>à</span>
            <Label htmlFor="prochain-rdv-heure" className="sr-only">
              Heure du prochain rendez-vous
            </Label>
            <Input
              id="prochain-rdv-heure"
              value={prochainRdv.heure}
              onChange={(e) => updateProchainRdv("heure", e.target.value)}
              className="w-20 h-8"
            />
            <Label htmlFor="prochain-rdv-lieu" className="sr-only">
              Lieu du prochain rendez-vous
            </Label>
            <Input
              id="prochain-rdv-lieu"
              value={prochainRdv.lieu}
              onChange={(e) => updateProchainRdv("lieu", e.target.value)}
              className="w-32 h-8"
            />
            <span>(Sem</span>
            <Label htmlFor="prochain-rdv-semaine" className="sr-only">
              Semaine du prochain rendez-vous
            </Label>
            <Input
              id="prochain-rdv-semaine"
              value={prochainRdv.semaine}
              onChange={(e) => updateProchainRdv("semaine", e.target.value)}
              className="w-16 h-8"
            />
            <span>)</span>
          </div>
        </div>
      </div>

      {/* Informations du projet */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex gap-2 items-center mb-2">
              <span className="font-semibold">Projet N° :</span>
              <Label htmlFor="projet-numero" className="sr-only">
                Numéro du projet
              </Label>
              <Input
                id="projet-numero"
                value={projetInfo.numero}
                onChange={(e) => updateProjetInfo("numero", e.target.value)}
                className="w-40"
              />
            </div>
            <Label htmlFor="projet-titre" className="sr-only">
              Titre du projet
            </Label>
            <Input
              id="projet-titre"
              value={projetInfo.titre}
              onChange={(e) => updateProjetInfo("titre", e.target.value)}
              className="font-bold text-lg mb-2"
              placeholder="Titre du projet"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="projet-adresse" className="font-semibold mb-2 block">
            Adresse du site :
          </Label>
          <Textarea
            id="projet-adresse"
            value={projetInfo.adresse}
            onChange={(e) => updateProjetInfo("adresse", e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Adresse complète du site"
          />
        </div>
      </div>

      {/* Utilisation du composant SectionTable pour chaque section */}
      <SectionTable
        title="Maître d'Ouvrage"
        isOpen={sections.maitreOuvrage}
        onToggle={() => toggleSection("maitreOuvrage")}
        participants={participants.maitreOuvrage}
        onUpdateParticipant={(id, field, value) => updateParticipant("maitreOuvrage", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("maitreOuvrage", id)}
        onAddParticipant={() => ajouterParticipant("maitreOuvrage", "Maître d'Ouvrage")}
      />

      <SectionTable
        title="Architecte"
        isOpen={sections.architecte}
        onToggle={() => toggleSection("architecte")}
        participants={participants.architecte}
        onUpdateParticipant={(id, field, value) => updateParticipant("architecte", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("architecte", id)}
        onAddParticipant={() => ajouterParticipant("architecte", "Architecte")}
      />

      <SectionTable
        title="BET CVC"
        isOpen={sections.betCVC}
        onToggle={() => toggleSection("betCVC")}
        participants={participants.betCVC}
        onUpdateParticipant={(id, field, value) => updateParticipant("betCVC", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("betCVC", id)}
        onAddParticipant={() => ajouterParticipant("betCVC", "BET CVC")}
      />

      <SectionTable
        title="BET Structure"
        isOpen={sections.betStructure}
        onToggle={() => toggleSection("betStructure")}
        participants={participants.betStructure}
        onUpdateParticipant={(id, field, value) => updateParticipant("betStructure", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("betStructure", id)}
        onAddParticipant={() => ajouterParticipant("betStructure", "BET Structure")}
      />

      <SectionTable
        title="BET Thermique"
        isOpen={sections.betThermique}
        onToggle={() => toggleSection("betThermique")}
        participants={participants.betThermique}
        onUpdateParticipant={(id, field, value) => updateParticipant("betThermique", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("betThermique", id)}
        onAddParticipant={() => ajouterParticipant("betThermique", "BET Thermique")}
      />

      <SectionTable
        title="Coordination SPS"
        isOpen={sections.coordinationSPS}
        onToggle={() => toggleSection("coordinationSPS")}
        participants={participants.coordinationSPS}
        onUpdateParticipant={(id, field, value) => updateParticipant("coordinationSPS", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("coordinationSPS", id)}
        onAddParticipant={() => ajouterParticipant("coordinationSPS", "Coordinateur SPS")}
      />

      <SectionTable
        title="Bureau de Contrôle"
        isOpen={sections.bureauControle}
        onToggle={() => toggleSection("bureauControle")}
        participants={participants.bureauControle}
        onUpdateParticipant={(id, field, value) => updateParticipant("bureauControle", id, field, value)}
        onTogglePresence={(id) => toggleParticipantPresence("bureauControle", id)}
        onAddParticipant={() => ajouterParticipant("bureauControle", "Bureau de contrôle")}
      />

      {/* Section Entreprises - Utilisation du nouveau composant SectionTableEntreprise */}
      <SectionTableEntreprise
        title="Entreprises"
        isOpen={sections.entreprises}
        onToggle={() => toggleSection("entreprises")}
        intervenants={intervenants}
        onUpdateIntervenant={updateIntervenant}
        onAddIntervenant={ajouterIntervenant}
      />
    </div>
  )
}
