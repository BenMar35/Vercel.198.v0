"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

type Lot = {
  id: string
  name: string
  numero: string
}

interface PvrSectionProps {
  title: string
  lots: Lot[]
  position: "left" | "right"
}

export function PvrSection({ title, lots, position }: PvrSectionProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [editingLotId, setEditingLotId] = useState<string | null>(null)
  const [lotComments, setLotComments] = useState<Record<string, string>>({})

  // Arrêter la propagation des événements pour éviter que le canvas ne capture les événements
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  const handleEditPvr = (lotId: string) => {
    setEditingLotId(lotId === editingLotId ? null : lotId)
  }

  const handleCommentChange = (lotId: string, comment: string) => {
    setLotComments((prev) => ({
      ...prev,
      [lotId]: comment,
    }))
  }

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 min-h-[600px]"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>

      <div className="mb-6 flex items-center justify-center">
        <span className="mr-2">En date du</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" onClick={stopPropagation} onMouseDown={stopPropagation}>
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={fr} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="overflow-y-auto max-h-[400px] pr-2">
        {lots.length > 0 ? (
          <div className="space-y-4">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className="flex flex-col p-3 bg-[#F6F5EB] rounded-md"
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold mr-2">{lot.numero}</span>
                    {lot.name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-custom-gold hover:bg-yellow-600 text-black"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditPvr(lot.id)
                    }}
                    onMouseDown={stopPropagation}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Éditer
                  </Button>
                </div>

                {editingLotId === lot.id && (
                  <div className="mt-2">
                    <textarea
                      value={lotComments[lot.id] || ""}
                      onChange={(e) => handleCommentChange(lot.id, e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-custom-gold"
                      rows={3}
                      placeholder="Ajouter des commentaires..."
                      onClick={stopPropagation}
                      onMouseDown={stopPropagation}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Aucun lot disponible. Veuillez d'abord créer des lots dans la table d'allotissement.
          </div>
        )}
      </div>
    </div>
  )
}
