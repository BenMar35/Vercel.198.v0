"use client"

import { useState, useEffect } from "react"

// Type pour les entreprises
type Company = {
  id: string
  raisonSociale: string
  adresse: string
  codePostal: string
  ville: string
  telephoneSociete: string
  emailSociete: string
  contact: string
  portable: string
  email: string
}

// Clé pour le stockage local
const COMPANIES_STORAGE_KEY = "local_companies"

// Données initiales pour le mode local
const INITIAL_COMPANIES: Company[] = [
  {
    id: "1",
    raisonSociale: "Entreprise Exemple 1",
    adresse: "123 Rue Principale",
    codePostal: "75001",
    ville: "Paris",
    telephoneSociete: "01 23 45 67 89",
    emailSociete: "contact@exemple1.fr",
    contact: "Jean Dupont",
    portable: "06 12 34 56 78",
    email: "jean.dupont@exemple1.fr",
  },
  {
    id: "2",
    raisonSociale: "Entreprise Exemple 2",
    adresse: "456 Avenue Secondaire",
    codePostal: "69002",
    ville: "Lyon",
    telephoneSociete: "04 56 78 90 12",
    emailSociete: "contact@exemple2.fr",
    contact: "Marie Martin",
    portable: "07 23 45 67 89",
    email: "marie.martin@exemple2.fr",
  },
]

/**
 * Hook pour gérer les entreprises en mode local
 */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Charger les entreprises depuis le stockage local au chargement du composant
  useEffect(() => {
    const loadCompanies = () => {
      setIsLoading(true)
      try {
        // Essayer de charger les entreprises depuis le stockage local
        const storedCompanies = localStorage.getItem(COMPANIES_STORAGE_KEY)
        if (storedCompanies) {
          setCompanies(JSON.parse(storedCompanies))
        } else {
          // Si aucune entreprise n'est stockée, utiliser les données initiales
          setCompanies(INITIAL_COMPANIES)
          // Sauvegarder les données initiales dans le stockage local
          localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(INITIAL_COMPANIES))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error)
        // En cas d'erreur, utiliser les données initiales
        setCompanies(INITIAL_COMPANIES)
      } finally {
        setIsLoading(false)
      }
    }

    // Utiliser setTimeout pour éviter les erreurs de hydration
    setTimeout(loadCompanies, 0)
  }, [])

  // Sauvegarder les entreprises dans le stockage local à chaque modification
  useEffect(() => {
    if (companies.length > 0 && !isLoading) {
      try {
        localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies))
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des entreprises:", error)
      }
    }
  }, [companies, isLoading])

  /**
   * Ajouter une nouvelle entreprise
   */
  const addCompany = async (companyData: Omit<Company, "id">) => {
    try {
      // Générer un ID unique
      const newId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Créer la nouvelle entreprise
      const newCompany: Company = {
        id: newId,
        ...companyData,
      }

      // Ajouter l'entreprise à la liste
      setCompanies((prev) => [...prev, newCompany])

      return newCompany
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entreprise:", error)
      return null
    }
  }

  /**
   * Ajouter plusieurs entreprises depuis un CSV
   */
  const addCompaniesFromCSV = async (companiesData: Omit<Company, "id">[]) => {
    try {
      // Créer les nouvelles entreprises avec des IDs uniques
      const newCompanies: Company[] = companiesData.map((company) => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...company,
      }))

      // Ajouter les entreprises à la liste
      setCompanies((prev) => [...prev, ...newCompanies])

      return newCompanies
    } catch (error) {
      console.error("Erreur lors de l'ajout des entreprises:", error)
      return null
    }
  }

  /**
   * Mettre à jour une entreprise
   */
  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      // Mettre à jour l'entreprise dans la liste
      setCompanies((prev) => prev.map((company) => (company.id === id ? { ...company, ...updates } : company)))

      // Retourner l'entreprise mise à jour
      return companies.find((company) => company.id === id) || null
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entreprise:", error)
      return null
    }
  }

  /**
   * Supprimer une entreprise
   */
  const deleteCompany = async (id: string) => {
    try {
      // Supprimer l'entreprise de la liste
      setCompanies((prev) => prev.filter((company) => company.id !== id))

      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error)
      return false
    }
  }

  return {
    companies,
    isLoading,
    error: null, // Pas d'erreur en mode local
    isOfflineMode: true, // Toujours en mode hors ligne
    addCompany,
    addCompaniesFromCSV,
    updateCompany,
    deleteCompany,
  }
}
