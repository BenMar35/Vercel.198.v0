import { type NextRequest, NextResponse } from "next/server"
import { deleteLotCompany, getLotCompanyById, updateLotCompany } from "@/services/lot-company-service"
import type { LotCompanyUpdate } from "@/types/lot-company"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const lotCompany = await getLotCompanyById(id)

    if (!lotCompany) {
      return NextResponse.json({ error: "Relation lot-entreprise non trouvée" }, { status: 404 })
    }

    return NextResponse.json(lotCompany)
  } catch (error: any) {
    console.error(`Erreur dans GET /api/lot-companies/${params.id}:`, error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la récupération de la relation lot-entreprise" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Vérifier si la relation existe
    const existingLotCompany = await getLotCompanyById(id)
    if (!existingLotCompany) {
      return NextResponse.json({ error: "Relation lot-entreprise non trouvée" }, { status: 404 })
    }

    const lotCompanyData: LotCompanyUpdate = {
      status: body.status,
      montant_ht: body.montant_ht,
      montant_ttc: body.montant_ttc,
      date_reception: body.date_reception,
      selected: body.selected,
    }

    const updatedLotCompany = await updateLotCompany(id, lotCompanyData)
    return NextResponse.json(updatedLotCompany)
  } catch (error: any) {
    console.error(`Erreur dans PUT /api/lot-companies/${params.id}:`, error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la mise à jour de la relation lot-entreprise" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Vérifier si la relation existe
    const existingLotCompany = await getLotCompanyById(id)
    if (!existingLotCompany) {
      return NextResponse.json({ error: "Relation lot-entreprise non trouvée" }, { status: 404 })
    }

    await deleteLotCompany(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Erreur dans DELETE /api/lot-companies/${params.id}:`, error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la suppression de la relation lot-entreprise" },
      { status: 500 },
    )
  }
}
