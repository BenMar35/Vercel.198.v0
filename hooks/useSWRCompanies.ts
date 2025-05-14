"use client"

import useSWR from "swr"
import { getSupabaseClient } from "@/lib/supabase/client"

export type Company = {
  id: string
  raisonSociale: string // Correspond à raison_sociale dans la base de données
  adresse: string
  codePostal: string
  ville: string
  telephoneSociete: string
  emailSociete: string
  contact: string
  portable: string
  email: string
}

const fetcher = async () => {
  const supabase = getSupabaseClient()

  if (!supabase) {
    throw new Error("Client Supabase non initialisé")
  }

  // Utilisation de raison_sociale au lieu de name
  const { data, error } = await supabase.from("companies").select("*").order("raison_sociale", { ascending: true })

  if (error) {
    throw error
  }

  return data.map((company) => ({
    id: company.id,
    raisonSociale: company.raison_sociale || "",
    adresse: company.adresse || "",
    codePostal: company.code_postal || "",
    ville: company.ville || "",
    telephoneSociete: company.telephone_societe || "",
    emailSociete: company.email_societe || "",
    contact: company.contact || "",
    portable: company.portable || "",
    email: company.email || "",
  }))
}

export function useSWRCompanies() {
  const { data, error, isLoading, mutate } = useSWR("companies", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    fallbackData: [],
  })

  const addCompany = async (companyData: Omit<Company, "id">) => {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Client Supabase non initialisé")
      }

      const { data: newCompany, error } = await supabase
        .from("companies")
        .insert({
          raison_sociale: companyData.raisonSociale,
          adresse: companyData.adresse,
          code_postal: companyData.codePostal,
          ville: companyData.ville,
          telephone_societe: companyData.telephoneSociete,
          email_societe: companyData.emailSociete,
          contact: companyData.contact,
          portable: companyData.portable,
          email: companyData.email,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Mise à jour optimiste
      const formattedCompany = {
        id: newCompany.id,
        raisonSociale: newCompany.raison_sociale || "",
        adresse: newCompany.adresse || "",
        codePostal: newCompany.code_postal || "",
        ville: newCompany.ville || "",
        telephoneSociete: newCompany.telephone_societe || "",
        emailSociete: newCompany.email_societe || "",
        contact: newCompany.contact || "",
        portable: newCompany.portable || "",
        email: newCompany.email || "",
      }

      mutate((currentData) => [...(currentData || []), formattedCompany], false)

      // Revalidation
      mutate()

      return formattedCompany
    } catch (err) {
      console.error("Error adding company:", err)
      throw err
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Client Supabase non initialisé")
      }

      const updateData: Record<string, any> = {}

      if (updates.raisonSociale !== undefined) updateData.raison_sociale = updates.raisonSociale
      if (updates.adresse !== undefined) updateData.adresse = updates.adresse
      if (updates.codePostal !== undefined) updateData.code_postal = updates.codePostal
      if (updates.ville !== undefined) updateData.ville = updates.ville
      if (updates.telephoneSociete !== undefined) updateData.telephone_societe = updates.telephoneSociete
      if (updates.emailSociete !== undefined) updateData.email_societe = updates.emailSociete
      if (updates.contact !== undefined) updateData.contact = updates.contact
      if (updates.portable !== undefined) updateData.portable = updates.portable
      if (updates.email !== undefined) updateData.email = updates.email

      const { data: updatedCompany, error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Mise à jour optimiste
      const formattedCompany = {
        id: updatedCompany.id,
        raisonSociale: updatedCompany.raison_sociale || "",
        adresse: updatedCompany.adresse || "",
        codePostal: updatedCompany.code_postal || "",
        ville: updatedCompany.ville || "",
        telephoneSociete: updatedCompany.telephone_societe || "",
        emailSociete: updatedCompany.email_societe || "",
        contact: updatedCompany.contact || "",
        portable: updatedCompany.portable || "",
        email: updatedCompany.email || "",
      }

      mutate(
        (currentData) => (currentData || []).map((company) => (company.id === id ? formattedCompany : company)),
        false,
      )

      // Revalidation
      mutate()

      return formattedCompany
    } catch (err) {
      console.error("Error updating company:", err)
      throw err
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Client Supabase non initialisé")
      }

      const { error } = await supabase.from("companies").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Mise à jour optimiste
      mutate((currentData) => (currentData || []).filter((company) => company.id !== id), false)

      // Revalidation
      mutate()

      return true
    } catch (err) {
      console.error("Error deleting company:", err)
      throw err
    }
  }

  return {
    companies: data || [],
    isLoading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    refresh: () => mutate(),
  }
}
