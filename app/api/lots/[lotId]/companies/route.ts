import { type NextRequest, NextResponse } from "next/server"
import { getLotCompanies, selectCompanyForLot } from "@/services/lot-company-service"

export async function GET(request: NextRequest, { params }: { params: { lotId: string } }) {
  try {
    const lotId = params.lotId
    const lotCompanies = await getLotCompanies({ lot_id: lotId })
    return NextResponse.json(lotCompanies)
  } catch (error: any) {
    console.error(`Erreur dans GET /api/lots/${params.lotId}/companies:`, error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la récupération des entreprises pour ce lot" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { lotId: string } }) {
  try {
    const lotId = params.lotId
    const body = await request.json()

    if (!body.company_id) {
      return NextResponse.json({ error: "Le champ company_id est requis" }, { status: 400 })
    }

    await selectCompanyForLot(lotId, body.company_id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Erreur dans POST /api/lots/${params.lotId}/companies:`, error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la sélection de l'entreprise pour ce lot" },
      { status: 500 },
    )
  }
}
