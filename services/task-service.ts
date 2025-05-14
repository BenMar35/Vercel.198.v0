import { createServerSupabaseClient } from "@/lib/supabase"

export type Task = {
  id: string
  project_id: string
  version_id: string
  lot_id?: string
  text: string
  completed: boolean
  due_date?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export async function getTasks(projectId: string, versionId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*, lots(id, name, numero)")
    .eq("project_id", projectId)
    .eq("version_id", versionId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Erreur lors de la récupération des tâches:", error)
    throw error
  }

  return data as (Task & { lots: { id: string; name: string; numero: string } | null })[]
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) {
    console.error("Erreur lors de la création de la tâche:", error)
    throw error
  }

  return data as Task
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single()

  if (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error)
    throw error
  }

  return data as Task
}

export async function deleteTask(taskId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    console.error("Erreur lors de la suppression de la tâche:", error)
    throw error
  }

  return true
}
