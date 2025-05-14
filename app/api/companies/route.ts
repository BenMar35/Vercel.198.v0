import { createCompany, getCompanies, updateCompany, deleteCompany } from "@/services/company-service"
import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const companies = await getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des entreprises" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { name, contact_name, email, phone, address } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'entreprise est requis" }, { status: 400 })
    }

    const company = await createCompany({
      name,
      contact_name,
      email,
      phone,
      address,
      created_by: user.id,
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'entreprise" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 })
    }

    const company = await updateCompany(id, updates)
    return NextResponse.json(company)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'entreprise" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 })
    }

    await deleteCompany(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'entreprise" }, { status: 500 })
  }
}
