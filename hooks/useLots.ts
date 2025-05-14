"use client"

import { useState, useEffect, useCallback } from "react"
import type { Lot } from "@/services/lot-service"

interface UseLotsOptions {
  projectId: string
  versionId: string
}

export function useLots({ projectId, versionId }: UseLotsOptions) {
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fonction pour récupérer les lots
  const fetchLots = useCallback(async () => {
    if (!projectId || !versionId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lots?projectId=${projectId}&versionId=${versionId}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      setLots(data)
    } catch (err) {
      console.error("Erreur lors de la récupération des lots:", err)
      setError(err instanceof Error ? err : new Error("Erreur inconnue"))
    } finally {
      setIsLoading(false)
    }
  }, [projectId, versionId])

  // Fonction pour créer un lot
  const createLot = useCallback(async (lotData: Omit<Lot, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/lots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lotData),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const newLot = await response.json()
      setLots((prevLots) => [...prevLots, newLot])
      return newLot
    } catch (err) {
      console.error("Erreur lors de la création du lot:", err)
      throw err
    }
  }, [])

  // Fonction pour mettre à jour un lot
  const updateLot = useCallback(async (lotId: string, updates: Partial<Lot>) => {
    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const updatedLot = await response.json()
      setLots((prevLots) => prevLots.map((lot) => (lot.id === lotId ? updatedLot : lot)))
      return updatedLot
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du lot ${lotId}:`, err)
      throw err
    }
  }, [])

  // Fonction pour supprimer un lot
  const deleteLot = useCallback(async (lotId: string) => {
    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      setLots((prevLots) => prevLots.filter((lot) => lot.id !== lotId))
      return true
    } catch (err) {
      console.error(`Erreur lors de la suppression du lot ${lotId}:`, err)
      throw err
    }
  }, [])

  // Charger les lots au montage du composant
  useEffect(() => {
    if (projectId && versionId) {
      fetchLots()
    }
  }, [fetchLots, projectId, versionId])

  return {
    lots,
    isLoading,
    error,
    fetchLots,
    createLot,
    updateLot,
    deleteLot,
  }
}
