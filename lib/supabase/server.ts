import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.error("Variables d'environnement Supabase manquantes")
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  return createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Ajout de l'export manquant
export const getSupabaseServer = createServerSupabaseClient
