import { createServerSupabaseClient } from "@/lib/supabase"

export type Project = {
  id: string
  name: string
  description?: string
  client?: string
  address?: string
  status?: string
  start_date?: string
  end_date?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type ProjectVersion = {
  id: string
  project_id: string
  version_number: number
  name: string
  description?: string
  is_current: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export async function getProjects(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    throw error
  }

  return data as Project[]
}

export async function getProjectById(projectId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single()

  if (error) {
    console.error("Erreur lors de la récupération du projet:", error)
    throw error
  }

  return data as Project
}

export async function createProject(project: Omit<Project, "id" | "created_at" | "updated_at">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("projects").insert(project).select().single()

  if (error) {
    console.error("Erreur lors de la création du projet:", error)
    throw error
  }

  // Créer une version initiale du projet
  const initialVersion = {
    project_id: data.id,
    version_number: 1,
    name: "Version initiale",
    description: "Version initiale du projet",
    is_current: true,
    created_by: project.created_by,
  }

  const { error: versionError } = await supabase.from("project_versions").insert(initialVersion)

  if (versionError) {
    console.error("Erreur lors de la création de la version initiale:", versionError)
    throw versionError
  }

  return data as Project
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single()

  if (error) {
    console.error("Erreur lors de la mise à jour du projet:", error)
    throw error
  }

  return data as Project
}

export async function deleteProject(projectId: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("projects").delete().eq("id", projectId)

  if (error) {
    console.error("Erreur lors de la suppression du projet:", error)
    throw error
  }

  return true
}

export async function createProjectVersion(version: Omit<ProjectVersion, "id" | "created_at" | "updated_at">) {
  const supabase = createServerSupabaseClient()

  // Désactiver la version actuelle
  if (version.is_current) {
    const { error: updateError } = await supabase
      .from("project_versions")
      .update({ is_current: false })
      .eq("project_id", version.project_id)
      .eq("is_current", true)

    if (updateError) {
      console.error("Erreur lors de la désactivation de la version actuelle:", updateError)
      throw updateError
    }
  }

  // Créer la nouvelle version
  const { data, error } = await supabase.from("project_versions").insert(version).select().single()

  if (error) {
    console.error("Erreur lors de la création de la version:", error)
    throw error
  }

  return data as ProjectVersion
}

export async function getProjectVersions(projectId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })

  if (error) {
    console.error("Erreur lors de la récupération des versions du projet:", error)
    throw error
  }

  return data as ProjectVersion[]
}

export async function getCurrentProjectVersion(projectId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_current", true)
    .single()

  if (error) {
    console.error("Erreur lors de la récupération de la version actuelle:", error)
    throw error
  }

  return data as ProjectVersion
}
