import { type NextRequest, NextResponse } from "next/server"
import { createLot, getLots } from "@/services/lot-service"
import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * GET /api/lots
 * Récupère tous les lots d'un projet et d'une version spécifique
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get("projectId")
    const versionId = searchParams.get("versionId")

    if (!projectId || !versionId) {
      return NextResponse.json({ error: "Les paramètres projectId et versionId sont requis" }, { status: 400 })
    }

    // Récupérer les lots
    const lots = await getLots(projectId, versionId)

    return NextResponse.json(lots)
  } catch (error) {
    console.error("Erreur lors de la récupération des lots:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des lots" }, { status: 500 })
  }
}

/**
 * POST /api/lots
 * Crée un nouveau lot
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les données du corps de la requête
    const lotData = await request.json()

    // Valider les données requises
    if (!lotData.project_id || !lotData.version_id || !lotData.numero || !lotData.name) {
      return NextResponse.json(
        { error: "Les champs project_id, version_id, numero et name sont requis" },
        { status: 400 },
      )
    }

    // Créer le lot
    const newLot = await createLot(lotData)

    return NextResponse.json(newLot, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du lot:", error)
    return NextResponse.json({ error: "Erreur lors de la création du lot" }, { status: 500 })
  }
}
