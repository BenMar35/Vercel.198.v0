import { createServerSupabaseClient } from "@/lib/supabase"

export type CanvasItem = {
  id: string
  project_id: string
  version_id: string
  type: string
  content: any
  position: any
  style?: any
  z_index: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

export async function getCanvasItems(projectId: string, versionId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("canvas_items")
    .select("*")
    .eq("project_id", projectId)
    .eq("version_id", versionId)
    .order("z_index", { ascending: true })

  if (error) {
    console.error("Erreur lors de la récupération des éléments du canvas:", error)
    throw error
  }

  return data as CanvasItem[]
}

export async function createCanvasItem(item: Omit<CanvasItem, "id" | "created_at" | "updated_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("canvas_items").insert(item).select().single()

  if (error) {
    console.error("Erreur lors de la création de l'élément du canvas:", error)
    throw error
  }

  return data as CanvasItem
}

export async function updateCanvasItem(itemId: string, updates: Partial<CanvasItem>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("canvas_items").update(updates).eq("id", itemId).select().single()

  if (error) {
    console.error("Erreur lors de la mise à jour de l'élément du canvas:", error)
    throw error
  }

  return data as CanvasItem
}

export async function deleteCanvasItem(itemId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("canvas_items").delete().eq("id", itemId)

  if (error) {
    console.error("Erreur lors de la suppression de l'élément du canvas:", error)
    throw error
  }

  return true
}

export async function bulkCreateCanvasItems(items: Omit<CanvasItem, "id" | "created_at" | "updated_at">[]) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("canvas_items").insert(items).select()

  if (error) {
    console.error("Erreur lors de la création en masse des éléments du canvas:", error)
    throw error
  }

  return data as CanvasItem[]
}

export async function bulkUpdateCanvasItems(items: { id: string; updates: Partial<CanvasItem> }[]) {
  const supabase = createServerSupabaseClient()

  // Supabase ne supporte pas les mises à jour en masse avec des conditions différentes
  // Nous devons donc faire des mises à jour individuelles
  const updatedItems: CanvasItem[] = []

  for (const item of items) {
    const { data, error } = await supabase.from("canvas_items").update(item.updates).eq("id", item.id).select().single()

    if (error) {
      console.error(`Erreur lors de la mise à jour de l'élément ${item.id}:`, error)
      throw error
    }

    updatedItems.push(data as CanvasItem)
  }

  return updatedItems
}
