import { createServerSupabaseClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Vérifier si le bucket 'fonts' existe, sinon le créer
    const { data: buckets } = await supabase.storage.listBuckets()
    const fontsBucketExists = buckets?.some((bucket) => bucket.name === "fonts")

    if (!fontsBucketExists) {
      await supabase.storage.createBucket("fonts", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
    }

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Télécharger le fichier dans le bucket 'fonts'
    const { data, error } = await supabase.storage.from("fonts").upload(file.name, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Erreur lors du téléchargement de la police:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Obtenir l'URL publique du fichier
    const { data: publicUrlData } = supabase.storage.from("fonts").getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
    })
  } catch (error) {
    console.error("Erreur lors du téléchargement de la police:", error)
    return NextResponse.json({ error: "Erreur lors du téléchargement de la police" }, { status: 500 })
  }
}
