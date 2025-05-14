"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Intervenant {
  id: string
  nom: string
  adresse: string
  contact: string
  statut: "present" | "absent" | "excuse" | "represente" | ""
  convoque: boolean
}

interface SectionTableEntrepriseProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  intervenants: Intervenant[]
  onUpdateIntervenant: (id: string, field: keyof Intervenant, value: any) => void
  onAddIntervenant: () => void
}

export function SectionTableEntreprise({
  title,
  isOpen,
  onToggle,
  intervenants,
  onUpdateIntervenant,
  onAddIntervenant,
}: SectionTableEntrepriseProps) {
  // Fonction pour arrêter la propagation des événements uniquement sur le conteneur principal
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  // Référence pour les textareas pour mesurer leur hauteur
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  // État pour stocker les hauteurs des lignes
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({})

  // État pour stocker la largeur maximale du texte dans le menu déroulant
  const [maxSelectWidth, setMaxSelectWidth] = useState<number>(150) // Valeur par défaut raisonnable

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
      intervenants.forEach((intervenant) => {
        ;["nom", "adresse", "contact"].forEach((field) => {
          const id = `${field}-${intervenant.id}`
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
    intervenants.forEach((intervenant) => {
      ;["nom", "adresse", "contact"].forEach((field) => {
        const id = `${field}-${intervenant.id}`
        const textarea = textareaRefs.current[id]
        const height = rowHeights[id]

        if (textarea && height) {
          textarea.style.height = `${height}px`
        }
      })
    })
  }

  // Calculer la largeur du menu déroulant une seule fois au chargement
  useEffect(() => {
    // Calculer la largeur maximale pour le menu déroulant
    const statusOptions = ["Non défini", "Présent", "Absent", "Excusé", "Représenté"]
    const maxWidth = Math.max(...statusOptions.map((option) => option.length)) * 10 + 40 // Estimation de la largeur
    setMaxSelectWidth(maxWidth)
  }, [])

  // Ajuster les hauteurs quand les intervenants ou l'état d'ouverture changent
  useEffect(() => {
    if (isOpen) {
      // Attendre que le DOM soit mis à jour
      const timer = setTimeout(() => {
        measureTextareaHeights()
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [intervenants, isOpen])

  // Appliquer les hauteurs après chaque rendu
  useEffect(() => {
    applyTextareaHeights()
  })

  // Calculer la hauteur maximale pour chaque ligne
  const getRowHeight = (intervenantId: string) => {
    const nomHeight = rowHeights[`nom-${intervenantId}`] || 40
    const adresseHeight = rowHeights[`adresse-${intervenantId}`] || 40
    const contactHeight = rowHeights[`contact-${intervenantId}`] || 40
    return Math.max(nomHeight, adresseHeight, contactHeight, 80) + 16 // Minimum pour accommoder le select et la checkbox
  }

  // Gestionnaire d'événement pour les changements de texte
  const handleTextareaChange = (intervenantId: string, field: keyof Intervenant, value: string) => {
    onUpdateIntervenant(intervenantId, field, value)

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
            <div className="w-[22%]">Nom</div>
            <div className="w-[28%]">Adresse</div>
            <div className="w-[30%]">Contact</div>
            <div className="w-[20%] text-center">Statut</div>
          </div>

          {intervenants.map((intervenant) => {
            const rowHeight = getRowHeight(intervenant.id)

            return (
              <div
                key={intervenant.id}
                className="flex mb-1 items-start text-sm"
                style={{ minHeight: `${rowHeight}px` }}
              >
                <div className="w-[22%] flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`nom-${intervenant.id}`} className="sr-only">
                    Nom de l'entreprise
                  </Label>
                  <Textarea
                    id={`nom-${intervenant.id}`}
                    value={intervenant.nom}
                    onChange={(e) => handleTextareaChange(intervenant.id, "nom", e.target.value)}
                    placeholder="Nom"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`nom-${intervenant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[28%] px-1 flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`adresse-${intervenant.id}`} className="sr-only">
                    Adresse de l'entreprise
                  </Label>
                  <Textarea
                    id={`adresse-${intervenant.id}`}
                    value={intervenant.adresse}
                    onChange={(e) => handleTextareaChange(intervenant.id, "adresse", e.target.value)}
                    placeholder="Adresse"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`adresse-${intervenant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[30%] px-1 flex items-start h-full" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`contact-${intervenant.id}`} className="sr-only">
                    Contact de l'entreprise
                  </Label>
                  <Textarea
                    id={`contact-${intervenant.id}`}
                    value={intervenant.contact}
                    onChange={(e) => handleTextareaChange(intervenant.id, "contact", e.target.value)}
                    placeholder="Contact"
                    className="min-h-10 resize-none py-2 h-full"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowY: "hidden",
                    }}
                    ref={(el) => {
                      textareaRefs.current[`contact-${intervenant.id}`] = el
                    }}
                  />
                </div>
                <div className="w-[20%] px-1 flex flex-col justify-start" style={{ minHeight: `${rowHeight}px` }}>
                  <Label htmlFor={`statut-${intervenant.id}`} className="sr-only">
                    Statut de présence
                  </Label>
                  <Select
                    value={intervenant.statut || "nonDefini"}
                    onValueChange={(value: "present" | "absent" | "excuse" | "represente" | "") =>
                      onUpdateIntervenant(intervenant.id, "statut", value)
                    }
                  >
                    <SelectTrigger
                      id={`statut-${intervenant.id}`}
                      className="h-10 w-full"
                      style={{ minWidth: `${maxSelectWidth}px` }}
                    >
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent style={{ minWidth: `${maxSelectWidth}px` }}>
                      <SelectItem value="nonDefini">Non défini</SelectItem>
                      <SelectItem value="present">Présent</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="excuse">Excusé</SelectItem>
                      <SelectItem value="represente">Représenté</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center mt-2">
                    <Label htmlFor={`convoque-${intervenant.id}`} className="text-xs mr-2">
                      Convoqué
                    </Label>
                    <input
                      id={`convoque-${intervenant.id}`}
                      type="checkbox"
                      checked={intervenant.convoque}
                      onChange={(e) => onUpdateIntervenant(intervenant.id, "convoque", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <Button onClick={onAddIntervenant} className="mt-2" variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Ajouter une entreprise
          </Button>
        </div>
      )}
    </div>
  )
}
