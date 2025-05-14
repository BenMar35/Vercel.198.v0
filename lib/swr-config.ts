import { SWRConfig } from "swr"

// Configuration globale de SWR
export const swrConfig = {
  // Intervalle de revalidation en millisecondes (par défaut: 0 - désactivé)
  // 0 signifie que les données ne sont pas automatiquement revalidées
  refreshInterval: 0,

  // Revalider au focus de la fenêtre
  revalidateOnFocus: true,

  // Revalider lors de la reconnexion réseau
  revalidateOnReconnect: true,

  // Délai avant de déclencher la revalidation lors du focus (en ms)
  focusThrottleInterval: 5000,

  // Conserver les données périmées lors du rechargement
  keepPreviousData: true,

  // Fonction de récupération par défaut
  fetcher: async (url: string) => {
    const response = await fetch(url)

    // Si la réponse n'est pas OK, lancer une erreur
    if (!response.ok) {
      const error = new Error("Une erreur est survenue lors de la récupération des données")
      error.info = await response.json()
      error.status = response.status
      throw error
    }

    return response.json()
  },

  // Gestionnaire d'erreur global
  onError: (error, key) => {
    console.error(`Erreur SWR pour la clé ${key}:`, error)
  },

  // Fonction pour déterminer si une revalidation est nécessaire
  shouldRetryOnError: true,

  // Nombre maximum de tentatives de récupération en cas d'erreur
  errorRetryCount: 3,

  // Délai entre les tentatives (en ms)
  errorRetryInterval: 5000,

  // Fonction pour déterminer le délai entre les tentatives
  // Augmentation exponentielle du délai
  errorRetryInterval: (retryCount) => Math.min(1000 * 2 ** retryCount, 30000),

  // Désactiver les revalidations automatiques pour les erreurs 404 et 403
  shouldRetryOnError: (error) => {
    return error.status !== 404 && error.status !== 403
  },
}

// Wrapper SWR pour l'application
export function SWRConfigProvider({ children }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}
