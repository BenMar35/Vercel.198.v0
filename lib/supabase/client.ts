import { createClient } from "@supabase/supabase-js"

// Vérifier que les variables d'environnement sont correctement utilisées
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Singleton pour éviter de multiples instances
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Variables d'environnement Supabase manquantes")
      return null
    }

    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          fetch: (...args) => {
            return fetch(...args)
          },
        },
      })
    } catch (error) {
      console.error("Erreur lors de l'initialisation du client Supabase:", error)
      return null
    }
  }
  return supabaseClient
}

// Fonction utilitaire pour vérifier la connexion à Supabase
export const testSupabaseConnection = async () => {
  const supabase = getSupabaseClient()
  if (!supabase) return { success: false, error: "Client Supabase non initialisé" }

  try {
    const { data, error } = await supabase.from("projects").select("count").limit(1)
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Erreur de connexion à Supabase:", error)
    return { success: false, error }
  }
}
