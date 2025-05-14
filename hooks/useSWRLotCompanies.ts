import useSWR, { mutate } from "swr"
import type { LotCompanyWithDetails, LotCompanyCreate, LotCompanyUpdate, LotCompanyFilters } from "@/types/lot-company"

// Fonction pour construire la clé de cache en fonction des filtres
const buildCacheKey = (filters: LotCompanyFilters = {}) => {
  const url = new URL("/api/lot-companies", window.location.origin)

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })

  return url.toString()
}

export function useSWRLotCompanies(filters: LotCompanyFilters = {}) {
  const cacheKey = buildCacheKey(filters)

  const { data, error, isLoading, isValidating, mutate: mutateLotCompanies } = useSWR<LotCompanyWithDetails[]>(cacheKey)

  // Fonction pour créer une relation lot-entreprise et mettre à jour le cache
  const createLotCompany = async (data: LotCompanyCreate) => {
    try {
      const response = await fetch("/api/lot-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création de la relation lot-entreprise")
      }

      const newLotCompany = await response.json()

      // Mettre à jour le cache avec la nouvelle relation
      await mutateLotCompanies((currentData) => {
        return currentData ? [...currentData, newLotCompany] : [newLotCompany]
      }, false)

      // Mettre à jour également d'autres caches potentiellement affectés
      if (data.lot_id) {
        await mutate(
          (key) => typeof key === "string" && key.startsWith("/api/lots/") && key.includes("/companies"),
          undefined,
          { revalidate: true },
        )
      }

      return newLotCompany
    } catch (error) {
      console.error("Erreur lors de la création de la relation lot-entreprise:", error)
      throw error
    }
  }

  // Fonction pour mettre à jour une relation lot-entreprise et mettre à jour le cache
  const updateLotCompany = async (id: string, updates: LotCompanyUpdate) => {
    try {
      const response = await fetch(`/api/lot-companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour de la relation lot-entreprise")
      }

      const updatedLotCompany = await response.json()

      // Mettre à jour le cache avec la relation mise à jour
      await mutateLotCompanies((currentData) => {
        return currentData
          ? currentData.map((item) => (item.id === id ? updatedLotCompany : item))
          : [updatedLotCompany]
      }, false)

      // Mettre à jour également le cache pour la relation individuelle
      await mutate(`/api/lot-companies/${id}`, updatedLotCompany, false)

      // Si selected a changé, mettre à jour d'autres caches potentiellement affectés
      if ("selected" in updates) {
        await mutate(
          (key) => typeof key === "string" && key.startsWith("/api/lots/") && key.includes("/companies"),
          undefined,
          { revalidate: true },
        )
      }

      return updatedLotCompany
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la relation lot-entreprise:", error)
      throw error
    }
  }

  // Fonction pour supprimer une relation lot-entreprise et mettre à jour le cache
  const deleteLotCompany = async (id: string) => {
    try {
      const response = await fetch(`/api/lot-companies/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de la relation lot-entreprise")
      }

      // Mettre à jour le cache en supprimant la relation
      await mutateLotCompanies((currentData) => {
        return currentData ? currentData.filter((item) => item.id !== id) : []
      }, false)

      // Invalider le cache pour la relation individuelle
      await mutate(`/api/lot-companies/${id}`, null, false)

      // Mettre à jour d'autres caches potentiellement affectés
      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/lots/") && key.includes("/companies"),
        undefined,
        { revalidate: true },
      )

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de la relation lot-entreprise:", error)
      throw error
    }
  }

  // Fonction pour sélectionner une entreprise pour un lot
  const selectCompanyForLot = async (lotId: string, companyId: string) => {
    try {
      const response = await fetch(`/api/lots/${lotId}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id: companyId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la sélection de l'entreprise pour ce lot")
      }

      // Revalider tous les caches liés aux relations lots-entreprises
      await mutate((key) => typeof key === "string" && key.includes("/api/lot-companies"), undefined, {
        revalidate: true,
      })

      // Revalider également les caches spécifiques aux lots
      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/lots/") && key.includes("/companies"),
        undefined,
        { revalidate: true },
      )

      return true
    } catch (error) {
      console.error("Erreur lors de la sélection de l'entreprise pour ce lot:", error)
      throw error
    }
  }

  // Fonction pour mettre à jour les filtres
  const updateFilters = (newFilters: Partial<LotCompanyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    // Retourner la nouvelle clé de cache pour permettre à l'appelant de mettre à jour son état
    return buildCacheKey(updatedFilters)
  }

  // Fonction pour forcer une revalidation
  const refreshLotCompanies = () => mutateLotCompanies()

  return {
    lotCompanies: data || [],
    isLoading,
    isValidating,
    error,
    filters,
    updateFilters,
    createLotCompany,
    updateLotCompany,
    deleteLotCompany,
    selectCompanyForLot,
    refreshLotCompanies,
  }
}
