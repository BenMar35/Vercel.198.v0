import { type NextRequest, NextResponse } from "next/server"
import { getLotById, updateLot, deleteLot } from "@/services/lot-service"
import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * GET /api/lots/[id]
 * Récupère un lot spécifique par son ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const lotId = params.id

    // Récupérer le lot
    const lot = await getLotById(lotId)

    if (!lot) {
      return NextResponse.json({ error: "Lot non trouvé" }, { status: 404 })
    }

    return NextResponse.json(lot)
  } catch (error) {
    console.error(`Erreur lors de la récupération du lot ${params.id}:`, error)
    return NextResponse.json({ error: "Erreur lors de la récupération du lot" }, { status: 500 })
  }
}

/**
 * PATCH /api/lots/[id]
 * Met à jour un lot existant
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const lotId = params.id

    // Vérifier si le lot existe
    const existingLot = await getLotById(lotId)

    if (!existingLot) {
      return NextResponse.json({ error: "Lot non trouvé" }, { status: 404 })
    }

    // Récupérer les données du corps de la requête
    const updates = await request.json()

    // Mettre à jour le lot
    const updatedLot = await updateLot(lotId, updates)

    return NextResponse.json(updatedLot)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du lot ${params.id}:`, error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du lot" }, { status: 500 })
  }
}

/**
 * DELETE /api/lots/[id]
 * Supprime un lot
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const lotId = params.id

    // Vérifier si le lot existe
    const existingLot = await getLotById(lotId)

    if (!existingLot) {
      return NextResponse.json({ error: "Lot non trouvé" }, { status: 404 })
    }

    // Supprimer le lot
    await deleteLot(lotId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Erreur lors de la suppression du lot ${params.id}:`, error)
    return NextResponse.json({ error: "Erreur lors de la suppression du lot" }, { status: 500 })
  }
}
