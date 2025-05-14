import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export type Lot = {
  id: string
  project_id: string
  version_id: string
  numero: string
  name: string
  description?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export type CreateLotInput = Omit<Lot, "id" | "created_at" | "updated_at">
export type UpdateLotInput = Partial<Omit<Lot, "id" | "created_at" | "updated_at">>

/**
 * Récupère tous les lots d'un projet et d'une version spécifique
 */
export async function getLots(projectId: string, versionId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("lots")
      .select("*")
      .eq("project_id", projectId)
      .eq("version_id", versionId)
      .order("numero", { ascending: true })

    if (error) {
      console.error("Erreur lors de la récupération des lots:", error)
      throw error
    }

    return data as Lot[]
  } catch (error) {
    console.error("Exception lors de la récupération des lots:", error)
    throw error
  }
}

/**
 * Récupère un lot spécifique par son ID
 */
export async function getLotById(lotId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("lots").select("*").eq("id", lotId).single()

    if (error) {
      console.error(`Erreur lors de la récupération du lot ${lotId}:`, error)
      throw error
    }

    return data as Lot
  } catch (error) {
    console.error(`Exception lors de la récupération du lot ${lotId}:`, error)
    throw error
  }
}

/**
 * Crée un nouveau lot
 */
export async function createLot(lot: CreateLotInput) {
  try {
    const supabase = createServerSupabaseClient()

    // Générer un ID si non fourni
    const newLot = {
      ...lot,
      id: uuidv4(),
    }

    const { data, error } = await supabase.from("lots").insert(newLot).select().single()

    if (error) {
      console.error("Erreur lors de la création du lot:", error)
      throw error
    }

    return data as Lot
  } catch (error) {
    console.error("Exception lors de la création du lot:", error)
    throw error
  }
}

/**
 * Met à jour un lot existant
 */
export async function updateLot(lotId: string, updates: UpdateLotInput) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("lots").update(updates).eq("id", lotId).select().single()

    if (error) {
      console.error(`Erreur lors de la mise à jour du lot ${lotId}:`, error)
      throw error
    }

    return data as Lot
  } catch (error) {
    console.error(`Exception lors de la mise à jour du lot ${lotId}:`, error)
    throw error
  }
}

/**
 * Supprime un lot
 */
export async function deleteLot(lotId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("lots").delete().eq("id", lotId)

    if (error) {
      console.error(`Erreur lors de la suppression du lot ${lotId}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Exception lors de la suppression du lot ${lotId}:`, error)
    throw error
  }
}

/**
 * Récupère les lots avec les entreprises associées
 */
export async function getLotsWithCompanies(projectId: string, versionId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("lots")
      .select(`
        *,
        lot_companies(
          id,
          company_id,
          status,
          montant_ht,
          montant_ttc,
          date_reception,
          selected,
          companies(id, name, contact_name, email, phone)
        )
      `)
      .eq("project_id", projectId)
      .eq("version_id", versionId)
      .order("numero", { ascending: true })

    if (error) {
      console.error("Erreur lors de la récupération des lots avec entreprises:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception lors de la récupération des lots avec entreprises:", error)
    throw error
  }
}

/**
 * Vérifie si un numéro de lot existe déjà dans un projet
 */
export async function checkLotNumberExists(
  projectId: string,
  versionId: string,
  numero: string,
  excludeLotId?: string,
) {
  try {
    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("lots")
      .select("id")
      .eq("project_id", projectId)
      .eq("version_id", versionId)
      .eq("numero", numero)

    // Si on exclut un lot spécifique (pour les mises à jour)
    if (excludeLotId) {
      query = query.neq("id", excludeLotId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur lors de la vérification du numéro de lot:", error)
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error("Exception lors de la vérification du numéro de lot:", error)
    throw error
  }
}
