/**
 * Utilitaires pour la gestion des PDFs
 */

/**
 * Vérifie si un PDF est accessible via son URL
 * @param url URL du PDF à vérifier
 * @returns Promise<boolean> true si le PDF est accessible, false sinon
 */
export const isPdfAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès au PDF:", error)
    return false
  }
}

/**
 * Convertit un Blob en base64
 * @param blob Blob à convertir
 * @returns Promise<string> Chaîne base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Télécharge un PDF depuis une URL et le convertit en base64
 * Utile pour contourner les problèmes CORS
 * @param url URL du PDF
 * @returns Promise<string> Chaîne base64 du PDF
 */
export const fetchPdfAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    const blob = await response.blob()
    return blobToBase64(blob)
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF:", error)
    throw error
  }
}

/**
 * Crée un iframe pour afficher un PDF
 * Alternative à l'élément object qui peut avoir des problèmes dans certains navigateurs
 * @param container Élément DOM où insérer l'iframe
 * @param pdfUrl URL du PDF
 * @param pageNumber Numéro de page à afficher
 * @returns HTMLIFrameElement L'iframe créé
 */
export const createPdfIframe = (container: HTMLElement, pdfUrl: string, pageNumber = 1): HTMLIFrameElement => {
  const iframe = document.createElement("iframe")
  iframe.src = `${pdfUrl}#page=${pageNumber}`
  iframe.width = "100%"
  iframe.height = "100%"
  iframe.style.border = "none"

  // Nettoyer le conteneur
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  container.appendChild(iframe)
  return iframe
}
