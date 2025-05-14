import { getCompanyById, updateCompany, deleteCompany } from "@/services/company-service"
import { type NextRequest, NextResponse } from "next/server"

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const company = await getCompanyById(params.id)
    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'entreprise" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json()
    const company = await updateCompany(params.id, body)
    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'entreprise" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await deleteCompany(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'entreprise" }, { status: 500 })
  }
}
