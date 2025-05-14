import { createServerSupabaseClient } from "@/lib/supabase/server"

export type Company = {
  id: string
  raisonSociale: string // Correspond à raison_sociale dans la base de données
  adresse?: string
  codePostal?: string
  ville?: string
  telephoneSociete?: string
  emailSociete?: string
  contact?: string
  portable?: string
  email?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export async function getCompanies() {
  const supabase = createServerSupabaseClient()

  // Utilisation de raison_sociale au lieu de name
  const { data, error } = await supabase.from("companies").select("*").order("raison_sociale", { ascending: true })

  if (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
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
    created_by: company.created_by,
    created_at: company.created_at,
    updated_at: company.updated_at,
  }))
}

export async function getCompanyById(companyId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single()

  if (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error)
    throw error
  }

  return {
    id: data.id,
    raisonSociale: data.raison_sociale || "",
    adresse: data.adresse || "",
    codePostal: data.code_postal || "",
    ville: data.ville || "",
    telephoneSociete: data.telephone_societe || "",
    emailSociete: data.email_societe || "",
    contact: data.contact || "",
    portable: data.portable || "",
    email: data.email || "",
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function createCompany(company: Omit<Company, "id" | "created_at" | "updated_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("companies")
    .insert({
      raison_sociale: company.raisonSociale,
      adresse: company.adresse,
      code_postal: company.codePostal,
      ville: company.ville,
      telephone_societe: company.telephoneSociete,
      email_societe: company.emailSociete,
      contact: company.contact,
      portable: company.portable,
      email: company.email,
      created_by: company.created_by,
    })
    .select()
    .single()

  if (error) {
    console.error("Erreur lors de la création de l'entreprise:", error)
    throw error
  }

  return {
    id: data.id,
    raisonSociale: data.raison_sociale || "",
    adresse: data.adresse || "",
    codePostal: data.code_postal || "",
    ville: data.ville || "",
    telephoneSociete: data.telephone_societe || "",
    emailSociete: data.email_societe || "",
    contact: data.contact || "",
    portable: data.portable || "",
    email: data.email || "",
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function updateCompany(companyId: string, updates: Partial<Company>) {
  const supabase = createServerSupabaseClient()

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

  const { data, error } = await supabase.from("companies").update(updateData).eq("id", companyId).select().single()

  if (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    throw error
  }

  return {
    id: data.id,
    raisonSociale: data.raison_sociale || "",
    adresse: data.adresse || "",
    codePostal: data.code_postal || "",
    ville: data.ville || "",
    telephoneSociete: data.telephone_societe || "",
    emailSociete: data.email_societe || "",
    contact: data.contact || "",
    portable: data.portable || "",
    email: data.email || "",
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

export async function deleteCompany(companyId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("companies").delete().eq("id", companyId)

  if (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    throw error
  }

  return true
}

export async function getCompaniesByLot(lotId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("lot_companies").select("*, company:companies(*)").eq("lot_id", lotId)

  if (error) {
    console.error("Erreur lors de la récupération des entreprises par lot:", error)
    throw error
  }

  return data.map((item) => ({
    ...item,
    company: {
      id: item.company.id,
      raisonSociale: item.company.raison_sociale || "",
      adresse: item.company.adresse || "",
      codePostal: item.company.code_postal || "",
      ville: item.company.ville || "",
      telephoneSociete: item.company.telephone_societe || "",
      emailSociete: item.company.email_societe || "",
      contact: item.company.contact || "",
      portable: item.company.portable || "",
      email: item.company.email || "",
    },
  }))
}
