"use client"

import { useCallback, useEffect, useState } from "react"
import type { LotCompanyCreate, LotCompanyFilters, LotCompanyUpdate, LotCompanyWithDetails } from "@/types/lot-company"

export function useLotCompanies(initialFilters: LotCompanyFilters = {}) {
  const [lotCompanies, setLotCompanies] = useState<LotCompanyWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<LotCompanyFilters>(initialFilters)

  // Fonction pour construire l'URL avec les filtres
  const buildUrl = useCallback((filters: LotCompanyFilters) => {
    const url = new URL("/api/lot-companies", window.location.origin)

    if (filters.lot_id) {
      url.searchParams.append("lot_id", filters.lot_id)
    }

    if (filters.company_id) {
      url.searchParams.append("company_id", filters.company_id)
    }

    if (filters.status) {
      url.searchParams.append("status", filters.status)
    }

    if (filters.selected !== undefined) {
      url.searchParams.append("selected", filters.selected.toString())
    }

    if (filters.project_id) {
      url.searchParams.append("project_id", filters.project_id)
    }

    return url.toString()
  }, [])

  // Fonction pour charger les relations lots-entreprises
  const fetchLotCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = buildUrl(filters)
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la récupération des relations lots-entreprises")
      }

      const data = await response.json()
      setLotCompanies(data)
    } catch (err: any) {
      console.error("Erreur lors du chargement des relations lots-entreprises:", err)
      setError(err.message || "Une erreur est survenue lors du chargement des relations lots-entreprises")
    } finally {
      setIsLoading(false)
    }
  }, [filters, buildUrl])

  // Fonction pour créer une relation lot-entreprise
  const createLotCompany = useCallback(async (data: LotCompanyCreate) => {
    try {
      setError(null)

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

      // Mettre à jour l'état local
      setLotCompanies((prev) => [...prev, newLotCompany])

      return newLotCompany
    } catch (err: any) {
      console.error("Erreur lors de la création de la relation lot-entreprise:", err)
      setError(err.message || "Une erreur est survenue lors de la création de la relation lot-entreprise")
      throw err
    }
  }, [])

  // Fonction pour mettre à jour une relation lot-entreprise
  const updateLotCompany = useCallback(async (id: string, data: LotCompanyUpdate) => {
    try {
      setError(null)

      const response = await fetch(`/api/lot-companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la mise à jour de la relation lot-entreprise")
      }

      const updatedLotCompany = await response.json()

      // Mettre à jour l'état local
      setLotCompanies((prev) => prev.map((item) => (item.id === id ? updatedLotCompany : item)))

      return updatedLotCompany
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la relation lot-entreprise:", err)
      setError(err.message || "Une erreur est survenue lors de la mise à jour de la relation lot-entreprise")
      throw err
    }
  }, [])

  // Fonction pour supprimer une relation lot-entreprise
  const deleteLotCompany = useCallback(async (id: string) => {
    try {
      setError(null)

      const response = await fetch(`/api/lot-companies/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de la relation lot-entreprise")
      }

      // Mettre à jour l'état local
      setLotCompanies((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la relation lot-entreprise:", err)
      setError(err.message || "Une erreur est survenue lors de la suppression de la relation lot-entreprise")
      throw err
    }
  }, [])

  // Fonction pour sélectionner une entreprise pour un lot
  const selectCompanyForLot = useCallback(
    async (lotId: string, companyId: string) => {
      try {
        setError(null)

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

        // Recharger les données pour refléter les changements
        await fetchLotCompanies()
      } catch (err: any) {
        console.error("Erreur lors de la sélection de l'entreprise pour ce lot:", err)
        setError(err.message || "Une erreur est survenue lors de la sélection de l'entreprise pour ce lot")
        throw err
      }
    },
    [fetchLotCompanies],
  )

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<LotCompanyFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Charger les relations lots-entreprises au chargement du composant et lorsque les filtres changent
  useEffect(() => {
    fetchLotCompanies()
  }, [fetchLotCompanies])

  return {
    lotCompanies,
    isLoading,
    error,
    filters,
    updateFilters,
    createLotCompany,
    updateLotCompany,
    deleteLotCompany,
    selectCompanyForLot,
    refresh: fetchLotCompanies,
  }
}
