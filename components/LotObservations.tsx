"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

interface Observation {
  id: string
  text: string
  datePrevisionnelle: string
  dateRealisation: string
  deroulement: string
}

interface LotObservationsProps {
  lot: {
    id: string
    name: string
    numero: string
  }
  projectId?: string
}

export function LotObservations({ lot, projectId }: LotObservationsProps) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [newObservationText, setNewObservationText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddObservation = () => {
    if (newObservationText.trim()) {
      const newObservation: Observation = {
        id: Date.now().toString(),
        text: newObservationText.trim(),
        datePrevisionnelle: "",
        dateRealisation: "",
        deroulement: "Vide",
      }
      setObservations([...observations, newObservation])
      setNewObservationText("")

      // Focus sur le champ d'input après ajout
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 0)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddObservation()
    }
  }

  const handleDeleteObservation = (id: string) => {
    setObservations(observations.filter((obs) => obs.id !== id))
  }

  const handleObservationChange = (id: string, field: keyof Observation, value: string) => {
    setObservations(observations.map((obs) => (obs.id === id ? { ...obs, [field]: value } : obs)))
  }

  const getDeroulementColor = (value: string) => {
    switch (value) {
      case "En cours":
        return "text-orange-600"
      case "OK":
        return "text-green-600"
      case "Retard":
        return "text-red-600"
      case "En attente":
        return "text-blue-600"
      default:
        return "text-gray-900"
    }
  }

  // Empêcher la propagation des événements vers le canvas
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="bg-white p-4" onMouseDown={handleInteractionStart} onTouchStart={handleInteractionStart}>
      <div className="mb-4">
        <h4 className="text-lg font-semibold">
          Lot {lot.numero} - {lot.name}
        </h4>
        <p className="text-sm text-gray-600">Entreprise associée : À définir dans l'appel d'offres</p>
      </div>

      {/* Champ pour ajouter une nouvelle observation */}
      <div className="mb-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={newObservationText}
            onChange={(e) => setNewObservationText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter une observation (Entrée pour valider)"
            className="flex-1 bg-[#EDEBDF]"
          />
          <Button onClick={handleAddObservation} size="sm" className="bg-custom-gold hover:bg-yellow-600 text-black">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des observations */}
      {observations.length > 0 && (
        <div className="space-y-3">
          {observations.map((observation) => (
            <div key={observation.id} className="bg-white">
              <div className="flex items-center gap-2">
                {/* Observation - 60% de largeur */}
                <div className="flex-1 min-w-[300px]">
                  <Input
                    type="text"
                    value={observation.text}
                    onChange={(e) => handleObservationChange(observation.id, "text", e.target.value)}
                    className="w-full bg-[#EDEBDF]"
                    placeholder="Observation"
                  />
                </div>

                {/* Date prévisionnelle - 10% de largeur */}
                <div className="w-[10%] min-w-[120px]">
                  <Input
                    type="date"
                    value={observation.datePrevisionnelle}
                    onChange={(e) => handleObservationChange(observation.id, "datePrevisionnelle", e.target.value)}
                    className="text-sm bg-[#EDEBDF] w-full"
                  />
                </div>

                {/* Date réalisation - 10% de largeur */}
                <div className="w-[10%] min-w-[120px]">
                  <Input
                    type="date"
                    value={observation.dateRealisation}
                    onChange={(e) => handleObservationChange(observation.id, "dateRealisation", e.target.value)}
                    className="text-sm bg-[#EDEBDF] w-full"
                  />
                </div>

                {/* Déroulement - 10% de largeur */}
                <div className="w-[10%] min-w-[120px]">
                  <Select
                    value={observation.deroulement}
                    onValueChange={(value) => handleObservationChange(observation.id, "deroulement", value)}
                  >
                    <SelectTrigger
                      className={`text-sm bg-[#EDEBDF] w-full ${getDeroulementColor(observation.deroulement)}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vide" className="text-gray-900">
                        Vide
                      </SelectItem>
                      <SelectItem value="En cours" className="text-orange-600">
                        En cours
                      </SelectItem>
                      <SelectItem value="OK" className="text-green-600">
                        OK
                      </SelectItem>
                      <SelectItem value="Retard" className="text-red-600">
                        Retard
                      </SelectItem>
                      <SelectItem value="En attente" className="text-blue-600">
                        En attente
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bouton supprimer */}
                <Button onClick={() => handleDeleteObservation(observation.id)} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {observations.length === 0 && (
        <div className="text-gray-500 italic text-sm">
          Aucune observation pour ce lot. Utilisez le champ ci-dessus pour en ajouter.
        </div>
      )}
    </div>
  )
}
