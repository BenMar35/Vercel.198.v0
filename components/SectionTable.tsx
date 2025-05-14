"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Participant {
  id: string
  role: string
  nom: string
  adresse: string
  contact: string
  present: boolean
}

interface SectionTableProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  participants: Participant[]
  onUpdateParticipant: (id: string, field: keyof Participant, value: any) => void
  onTogglePresence: (id: string) => void
  onAddParticipant: () => void
}

export function SectionTable({
  title,
  isOpen,
  onToggle,
  participants,
  onUpdateParticipant,
  onTogglePresence,
  onAddParticipant,
}: SectionTableProps) {
  // Arrêter la propagation des événements uniquement sur le conteneur principal
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  // Référence pour les textareas pour mesurer leur hauteur
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // État pour stocker les hauteurs des lignes
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({})

  // Référence pour suivre les mises à jour en attente
  const pendingUpdatesRef = useRef<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour mesurer les hauteurs sans mettre à jour l'état immédiatement
  const measureTextareaHeights = () => {
    if (pendingUpdatesRef.current) return

    pendingUpdatesRef.current = true

    // Nettoyer tout timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Planifier une mise à jour après un court délai
    timeoutRef.current = setTimeout(() => {
      const newHeights: Record<string, number> = {}
      let hasChanges = false

      // Mesurer tous les textareas
      participants.forEach((participant) => {
        ;["nom", "adresse", "contact"].forEach((field) => {
          const id = `${field}-${participant.id}`
          const textarea = textareaRefs.current[id]

          if (textarea) {
            // Réinitialiser temporairement la hauteur pour mesurer correctement
            const originalHeight = textarea.style.height
            textarea.style.height = "auto"

            // Mesurer la hauteur du contenu
            const scrollHeight = textarea.scrollHeight
            const newHeight = Math.max(scrollHeight, 40) // Minimum 40px

            // Restaurer la hauteur originale
            textarea.style.height = originalHeight

            // Enregistrer la nouvelle hauteur si elle est différente
            if (newHeight !== rowHeights[id]) {
              newHeights[id] = newHeight
              hasChanges = true
            } else {
              newHeights[id] = rowHeights[id] || newHeight
            }
          }
        })
      })

      // Mettre à jour l'état seulement s'il y a des changements
      if (hasChanges) {
        setRowHeights((prev) => ({
          ...prev,
          ...newHeights,
        }))
      }

      pendingUpdatesRef.current = false
    }, 100) // Délai de 100ms pour regrouper les mises à jour
  }

  // Appliquer les hauteurs mesurées aux textareas
  const applyTextareaHeights = () => {
    participants.forEach((participant) => {
      ;["nom", "adresse", "contact"].forEach((field) => {
        const id = `${field}-${participant.id}`
        const textarea = textareaRefs.current[id]
        const height = rowHeights[id]

        if (textarea && height) {
          textarea.style.height = `${height}px`
        }
      })
    })
  }

  // Ajuster les hauteurs quand les participants ou l'état d'ouverture changent
  useEffect(() => {
    if (isOpen) {
      // Attendre que le DOM soit mis à jour
      const timer = setTimeout(() => {
        measureTextareaHeights()
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [participants, isOpen])

  // Appliquer les hauteurs après chaque rendu
  useEffect(() => {
    applyTextareaHeights()
  })

  // Calculer la hauteur maximale pour chaque ligne
  const getRowHeight = (participantId: string) => {
    const nomHeight = rowHeights[`nom-${participantId}`] || 40
    const adresseHeight = rowHeights[`adresse-${participantId}`] || 40
    const contactHeight = rowHeights[`contact-${participantId}`] || 40
    return Math.max(nomHeight, adresseHeight, contactHeight) + 16 // Ajouter un peu d'espace pour le padding
  }

  // Gestionnaire d'événement pour les changements de texte
  const handleTextareaChange = (participantId: string, field: keyof Participant, value: string) => {
    onUpdateParticipant(participantId, field, value)

    // Planifier une mesure des hauteurs après la mise à jour
    setTimeout(() => {
      measureTextareaHeights()
    }, 0)
  }

  return (
    <div className="mb-4 border rounded-md overflow-hidden" onMouseDown={stopPropagation}>
      <div className="bg-gray-100 p-2 flex justify-between items-center cursor-pointer" onClick={onToggle}>
        <h3 className="font-semibold">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isOpen && (
        <div className="p-2">
          <div className="flex font-semibold mb-1 bg-gray-100 p-1 text-sm">
            <div className="w-[22%]">Intervenant</div>
            <div className="w-[28%]">Adresse</div>
            <div className="w-[40%]">Tél./Courriel</div>
            <div className="w-[10%] text-center">Présent</div>
          </div>

          {participants.map((participant) => {
            const rowHeight = getRowHeight(participant.id)

            return (
              <div
                key={participant.id}
                className="flex mb-1 items-start text-sm"
                style={{ minHeight: `${rowHeight}px` }}
              >
                <div className="w-[22%] flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`nom-${participant.id}`} className="sr-only">
                    Nom du participant
                  </Label>
                  <Textarea
                    id={`nom-${participant.id}`}
                    value={participant.nom}
                    onChange={(e) => handleTextareaChange(participant.id, "nom", e.target.value)}
                    placeholder="Nom"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`nom-${participant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[28%] px-1 flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`adresse-${participant.id}`} className="sr-only">
                    Adresse du participant
                  </Label>
                  <Textarea
                    id={`adresse-${participant.id}`}
                    value={participant.adresse}
                    onChange={(e) => handleTextareaChange(participant.id, "adresse", e.target.value)}
                    placeholder="Adresse"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`adresse-${participant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[40%] px-1 flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`contact-${participant.id}`} className="sr-only">
                    Contact du participant
                  </Label>
                  <Textarea
                    id={`contact-${participant.id}`}
                    value={participant.contact}
                    onChange={(e) => handleTextareaChange(participant.id, "contact", e.target.value)}
                    placeholder="Contact"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`contact-${participant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[10%] flex items-center justify-between px-1" style={{ minHeight: `${rowHeight}px` }}>
                  <div className="flex items-center">
                    <Checkbox
                      id={`present-${participant.id}`}
                      checked={participant.present}
                      onCheckedChange={() => onTogglePresence(participant.id)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`present-${participant.id}`} className="sr-only">
                      Présent
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddParticipant}
                    className="p-0 h-5 w-5"
                    aria-label="Ajouter un participant"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
