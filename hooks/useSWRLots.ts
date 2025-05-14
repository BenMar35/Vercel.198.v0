import useSWR, { mutate } from "swr"
import type { Lot } from "@/services/lot-service"

export function useSWRLots(projectId: string | null, versionId: string | null) {
  // Construire la clé de cache uniquement si les deux IDs sont présents
  const cacheKey = projectId && versionId ? `/api/lots?projectId=${projectId}&versionId=${versionId}` : null

  const { data, error, isLoading, isValidating, mutate: mutateLots } = useSWR<Lot[]>(cacheKey)

  // Fonction pour créer un lot et mettre à jour le cache
  const createLot = async (lotData: Omit<Lot, "id" | "created_at" | "updated_at">) => {
    if (!cacheKey) return null

    try {
      const response = await fetch("/api/lots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lotData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création du lot")
      }

      const newLot = await response.json()

      // Mettre à jour le cache avec le nouveau lot
      await mutateLots((currentData) => {
        return currentData ? [...currentData, newLot] : [newLot]
      }, false)

      return newLot
    } catch (error) {
      console.error("Erreur lors de la création du lot:", error)
      throw error
    }
  }

  // Fonction pour mettre à jour un lot et mettre à jour le cache
  const updateLot = async (lotId: string, updates: Partial<Lot>) => {
    if (!cacheKey) return null

    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du lot")
      }

      const updatedLot = await response.json()

      // Mettre à jour le cache avec le lot mis à jour
      await mutateLots((currentData) => {
        return currentData ? currentData.map((lot) => (lot.id === lotId ? updatedLot : lot)) : [updatedLot]
      }, false)

      // Mettre à jour également le cache pour le lot individuel
      await mutate(`/api/lots/${lotId}`, updatedLot, false)

      return updatedLot
    } catch (error) {
      console.error("Erreur lors de la mise à jour du lot:", error)
      throw error
    }
  }

  // Fonction pour supprimer un lot et mettre à jour le cache
  const deleteLot = async (lotId: string) => {
    if (!cacheKey) return false

    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du lot")
      }

      // Mettre à jour le cache en supprimant le lot
      await mutateLots((currentData) => {
        return currentData ? currentData.filter((lot) => lot.id !== lotId) : []
      }, false)

      // Invalider le cache pour le lot individuel
      await mutate(`/api/lots/${lotId}`, null, false)

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression du lot:", error)
      throw error
    }
  }

  // Fonction pour forcer une revalidation
  const refreshLots = () => mutateLots()

  return {
    lots: data || [],
    isLoading,
    isValidating,
    error,
    createLot,
    updateLot,
    deleteLot,
    refreshLots,
  }
}

// Hook pour un lot spécifique
export function useSWRLot(lotId: string | null) {
  const { data, error, isLoading, isValidating, mutate: mutateLot } = useSWR<Lot>(lotId ? `/api/lots/${lotId}` : null)

  // Fonction pour mettre à jour le lot et le cache
  const updateLot = async (updates: Partial<Lot>) => {
    if (!lotId) return null

    try {
      const response = await fetch(`/api/lots/${lotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du lot")
      }

      const updatedLot = await response.json()

      // Mettre à jour le cache pour le lot individuel
      await mutateLot(updatedLot, false)

      // Mettre à jour également le cache pour la liste des lots
      if (updatedLot.project_id && updatedLot.version_id) {
        await mutate(
          `/api/lots?projectId=${updatedLot.project_id}&versionId=${updatedLot.version_id}`,
          (currentData: Lot[] | undefined) => {
            return currentData ? currentData.map((lot) => (lot.id === lotId ? updatedLot : lot)) : [updatedLot]
          },
          false,
        )
      }

      return updatedLot
    } catch (error) {
      console.error("Erreur lors de la mise à jour du lot:", error)
      throw error
    }
  }

  // Fonction pour forcer une revalidation
  const refreshLot = () => mutateLot()

  return {
    lot: data,
    isLoading,
    isValidating,
    error,
    updateLot,
    refreshLot,
  }
}
