import { type NextRequest, NextResponse } from "next/server"
import { createLotCompany, getLotCompanies } from "@/services/lot-company-service"
import type { LotCompanyCreate, LotCompanyFilters } from "@/types/lot-company"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams
    const filters: LotCompanyFilters = {}

    // Appliquer les filtres depuis les paramètres de requête
    if (searchParams.has("lot_id")) {
      filters.lot_id = searchParams.get("lot_id") as string
    }

    if (searchParams.has("company_id")) {
      filters.company_id = searchParams.get("company_id") as string
    }

    if (searchParams.has("status")) {
      filters.status = searchParams.get("status") as any
    }

    if (searchParams.has("selected")) {
      filters.selected = searchParams.get("selected") === "true"
    }

    if (searchParams.has("project_id")) {
      filters.project_id = searchParams.get("project_id") as string
    }

    const lotCompanies = await getLotCompanies(filters)
    return NextResponse.json(lotCompanies)
  } catch (error: any) {
    console.error("Erreur dans GET /api/lot-companies:", error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la récupération des relations lots-entreprises" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données requises
    if (!body.lot_id || !body.company_id) {
      return NextResponse.json({ error: "Les champs lot_id et company_id sont requis" }, { status: 400 })
    }

    const lotCompanyData: LotCompanyCreate = {
      lot_id: body.lot_id,
      company_id: body.company_id,
      status: body.status,
      montant_ht: body.montant_ht,
      montant_ttc: body.montant_ttc,
      date_reception: body.date_reception,
      selected: body.selected,
    }

    const newLotCompany = await createLotCompany(lotCompanyData)
    return NextResponse.json(newLotCompany, { status: 201 })
  } catch (error: any) {
    console.error("Erreur dans POST /api/lot-companies:", error)
    return NextResponse.json(
      { error: error.message || "Une erreur est survenue lors de la création de la relation lot-entreprise" },
      { status: 500 },
    )
  }
}
