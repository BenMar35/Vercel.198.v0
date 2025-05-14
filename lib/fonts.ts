import { createClientSupabaseClient } from "./supabase"

// Fonction pour obtenir l'URL de la police depuis Supabase Storage
export async function getFontUrl(fontName: string, fontWeight = "regular", fontFormat = "woff2") {
  const supabase = createClientSupabaseClient()

  try {
    const { data, error } = await supabase.storage.from("fonts").getPublicUrl(`${fontName}-${fontWeight}.${fontFormat}`)

    if (error) {
      console.error("Erreur lors de la récupération de la police:", error)
      return null
    }

    return data.publicUrl
  } catch (error) {
    console.error("Erreur lors de la récupération de la police:", error)
    return null
  }
}

// Fonction pour charger la police Caviar Dreams
export async function loadCaviarDreamsFont() {
  const fontFaces = [
    { weight: "regular", format: "woff2" },
    { weight: "bold", format: "woff2" },
    { weight: "italic", format: "woff2" },
    { weight: "bolditalic", format: "woff2" },
  ]

  const fontUrls = await Promise.all(
    fontFaces.map(async ({ weight, format }) => {
      return {
        weight,
        url: await getFontUrl("CaviarDreams", weight, format),
      }
    }),
  )

  return fontUrls.filter((font) => font.url !== null)
}
