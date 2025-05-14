"use client"

import { useEffect } from "react"
import { loadCaviarDreamsFont } from "@/lib/fonts"

export function FontLoader() {
  useEffect(() => {
    const loadFonts = async () => {
      const fontUrls = await loadCaviarDreamsFont()

      if (fontUrls.length > 0) {
        // Créer dynamiquement les règles @font-face
        const style = document.createElement("style")

        const fontFaceRules = fontUrls
          .map(
            (font) => `
          @font-face {
            font-family: 'Caviar Dreams';
            src: url('${font.url}') format('woff2');
            font-weight: ${font.weight === "bold" || font.weight === "bolditalic" ? "bold" : "normal"};
            font-style: ${font.weight === "italic" || font.weight === "bolditalic" ? "italic" : "normal"};
            font-display: swap;
          }
        `,
          )
          .join("\n")

        style.textContent = fontFaceRules
        document.head.appendChild(style)
      }
    }

    loadFonts()
  }, [])

  return null
}
