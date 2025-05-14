import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServer } from "@/lib/supabase/server"
import type {
  LotCompany,
  LotCompanyCreate,
  LotCompanyFilters,
  LotCompanyUpdate,
  LotCompanyWithDetails,
} from "@/types/lot-company"

// Fonction pour récupérer les relations lots-entreprises avec filtres
export async function getLotCompanies(filters: LotCompanyFilters = {}): Promise<LotCompanyWithDetails[]> {
  try {
    const supabase = getSupabaseServer()

    // Construire la requête de base
    let query = supabase.from("lot_companies").select(`
        *,
        companies:company_id(id, name),
        lots:lot_id(id, name, numero, project_id)
      `)

    // Appliquer les filtres
    if (filters.lot_id) {
      query = query.eq("lot_id", filters.lot_id)
    }

    if (filters.company_id) {
      query = query.eq("company_id", filters.company_id)
    }

    if (filters.status) {
      query = query.eq("status", filters.status)
    }

    if (filters.selected !== undefined) {
      query = query.eq("selected", filters.selected)
    }

    if (filters.project_id) {
      query = query.eq("lots.project_id", filters.project_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur lors de la récupération des relations lots-entreprises:", error)
      throw new Error(`Erreur lors de la récupération des relations lots-entreprises: ${error.message}`)
    }

    // Transformer les données pour inclure les détails des entreprises et des lots
    return data.map((item) => ({
      id: item.id,
      lot_id: item.lot_id,
      company_id: item.company_id,
      status: item.status,
      montant_ht: item.montant_ht,
      montant_ttc: item.montant_ttc,
      date_reception: item.date_reception,
      selected: item.selected,
      created_at: item.created_at,
      updated_at: item.updated_at,
      company_name: item.companies?.name || "Entreprise inconnue",
      lot_name: item.lots?.name || "Lot inconnu",
      lot_numero: item.lots?.numero || "0",
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des relations lots-entreprises:", error)
    throw error
  }
}

// Fonction pour récupérer une relation lot-entreprise par ID
export async function getLotCompanyById(id: string): Promise<LotCompanyWithDetails | null> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from("lot_companies")
      .select(`
        *,
        companies:company_id(id, name),
        lots:lot_id(id, name, numero)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erreur lors de la récupération de la relation lot-entreprise:", error)
      throw new Error(`Erreur lors de la récupération de la relation lot-entreprise: ${error.message}`)
    }

    if (!data) return null

    return {
      id: data.id,
      lot_id: data.lot_id,
      company_id: data.company_id,
      status: data.status,
      montant_ht: data.montant_ht,
      montant_ttc: data.montant_ttc,
      date_reception: data.date_reception,
      selected: data.selected,
      created_at: data.created_at,
      updated_at: data.updated_at,
      company_name: data.companies?.name || "Entreprise inconnue",
      lot_name: data.lots?.name || "Lot inconnu",
      lot_numero: data.lots?.numero || "0",
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la relation lot-entreprise:", error)
    throw error
  }
}

// Fonction pour créer une relation lot-entreprise
export async function createLotCompany(data: LotCompanyCreate): Promise<LotCompany> {
  try {
    const supabase = getSupabaseServer()

    // Vérifier si la relation existe déjà
    const { data: existingData, error: checkError } = await supabase
      .from("lot_companies")
      .select("*")
      .eq("lot_id", data.lot_id)
      .eq("company_id", data.company_id)
      .maybeSingle()

    if (checkError) {
      console.error("Erreur lors de la vérification de la relation lot-entreprise:", checkError)
      throw new Error(`Erreur lors de la vérification de la relation lot-entreprise: ${checkError.message}`)
    }

    if (existingData) {
      throw new Error("Cette entreprise est déjà associée à ce lot")
    }

    // Créer la relation
    const { data: newData, error } = await supabase
      .from("lot_companies")
      .insert({
        lot_id: data.lot_id,
        company_id: data.company_id,
        status: data.status || "consulté",
        montant_ht: data.montant_ht,
        montant_ttc: data.montant_ttc,
        date_reception: data.date_reception,
        selected: data.selected || false,
      })
      .select()
      .single()

    if (error) {
      console.error("Erreur lors de la création de la relation lot-entreprise:", error)
      throw new Error(`Erreur lors de la création de la relation lot-entreprise: ${error.message}`)
    }

    return newData
  } catch (error) {
    console.error("Erreur lors de la création de la relation lot-entreprise:", error)
    throw error
  }
}

// Fonction pour mettre à jour une relation lot-entreprise
export async function updateLotCompany(id: string, data: LotCompanyUpdate): Promise<LotCompany> {
  try {
    const supabase = getSupabaseServer()

    // Si selected est true, désélectionner les autres entreprises pour ce lot
    if (data.selected) {
      // D'abord, récupérer le lot_id de cette relation
      const { data: currentRelation, error: fetchError } = await supabase
        .from("lot_companies")
        .select("lot_id")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Erreur lors de la récupération de la relation lot-entreprise:", fetchError)
        throw new Error(`Erreur lors de la récupération de la relation lot-entreprise: ${fetchError.message}`)
      }

      // Désélectionner les autres entreprises pour ce lot
      const { error: updateError } = await supabase
        .from("lot_companies")
        .update({ selected: false })
        .eq("lot_id", currentRelation.lot_id)
        .neq("id", id)

      if (updateError) {
        console.error("Erreur lors de la désélection des autres entreprises:", updateError)
        throw new Error(`Erreur lors de la désélection des autres entreprises: ${updateError.message}`)
      }
    }

    // Mettre à jour la relation
    const { data: updatedData, error } = await supabase
      .from("lot_companies")
      .update({
        status: data.status,
        montant_ht: data.montant_ht,
        montant_ttc: data.montant_ttc,
        date_reception: data.date_reception,
        selected: data.selected,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erreur lors de la mise à jour de la relation lot-entreprise:", error)
      throw new Error(`Erreur lors de la mise à jour de la relation lot-entreprise: ${error.message}`)
    }

    return updatedData
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la relation lot-entreprise:", error)
    throw error
  }
}

// Fonction pour supprimer une relation lot-entreprise
export async function deleteLotCompany(id: string): Promise<void> {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase.from("lot_companies").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression de la relation lot-entreprise:", error)
      throw new Error(`Erreur lors de la suppression de la relation lot-entreprise: ${error.message}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la relation lot-entreprise:", error)
    throw error
  }
}

// Fonction pour sélectionner une entreprise pour un lot (et désélectionner les autres)
export async function selectCompanyForLot(lotId: string, companyId: string): Promise<void> {
  try {
    const supabase = getSupabaseServer()

    // Désélectionner toutes les entreprises pour ce lot
    const { error: deselectError } = await supabase
      .from("lot_companies")
      .update({ selected: false })
      .eq("lot_id", lotId)

    if (deselectError) {
      console.error("Erreur lors de la désélection des entreprises:", deselectError)
      throw new Error(`Erreur lors de la désélection des entreprises: ${deselectError.message}`)
    }

    // Sélectionner l'entreprise spécifiée
    const { error: selectError } = await supabase
      .from("lot_companies")
      .update({ selected: true, status: "retenu" })
      .eq("lot_id", lotId)
      .eq("company_id", companyId)

    if (selectError) {
      console.error("Erreur lors de la sélection de l'entreprise:", selectError)
      throw new Error(`Erreur lors de la sélection de l'entreprise: ${selectError.message}`)
    }
  } catch (error) {
    console.error("Erreur lors de la sélection de l'entreprise pour le lot:", error)
    throw error
  }
}

// Fonction client pour récupérer les relations lots-entreprises
export async function fetchLotCompanies(filters: LotCompanyFilters = {}): Promise<LotCompanyWithDetails[]> {
  try {
    const supabase = getSupabaseClient()

    // Construire la requête de base
    let query = supabase.from("lot_companies").select(`
        *,
        companies:company_id(id, name),
        lots:lot_id(id, name, numero, project_id)
      `)

    // Appliquer les filtres
    if (filters.lot_id) {
      query = query.eq("lot_id", filters.lot_id)
    }

    if (filters.company_id) {
      query = query.eq("company_id", filters.company_id)
    }

    if (filters.status) {
      query = query.eq("status", filters.status)
    }

    if (filters.selected !== undefined) {
      query = query.eq("selected", filters.selected)
    }

    if (filters.project_id) {
      query = query.eq("lots.project_id", filters.project_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur lors de la récupération des relations lots-entreprises:", error)
      throw new Error(`Erreur lors de la récupération des relations lots-entreprises: ${error.message}`)
    }

    // Transformer les données pour inclure les détails des entreprises et des lots
    return data.map((item) => ({
      id: item.id,
      lot_id: item.lot_id,
      company_id: item.company_id,
      status: item.status,
      montant_ht: item.montant_ht,
      montant_ttc: item.montant_ttc,
      date_reception: item.date_reception,
      selected: item.selected,
      created_at: item.created_at,
      updated_at: item.updated_at,
      company_name: item.companies?.name || "Entreprise inconnue",
      lot_name: item.lots?.name || "Lot inconnu",
      lot_numero: item.lots?.numero || "0",
    }))
  } catch (error) {
    console.error("Erreur lors de la récupération des relations lots-entreprises:", error)
    throw error
  }
}
