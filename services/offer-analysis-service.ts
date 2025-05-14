import type { LotCompanyWithDetails } from "@/types/lot-company"

export interface OfferAnalysisResult {
  lotId: string
  lotName: string
  lotNumero: string
  estimatedPrice?: number
  offers: OfferAnalysis[]
  statistics: OfferStatistics
  anomalies: OfferAnomaly[]
}

export interface OfferAnalysis {
  id: string
  companyId: string
  companyName: string
  amount: number
  rank: number
  percentageFromAverage: number
  percentageFromEstimate?: number
  isLowest: boolean
  isHighest: boolean
  isAnomaly: boolean
  score: number
  recommendation?: "moins_disant" | "mieux_disant" | "anomalie" | null
}

export interface OfferStatistics {
  count: number
  lowest: number
  highest: number
  average: number
  median: number
  standardDeviation: number
  range: number
}

export interface OfferAnomaly {
  companyId: string
  companyName: string
  amount: number
  reason: string
  severity: "low" | "medium" | "high"
}

export interface OfferAnalysisOptions {
  estimatedPrices?: Record<string, number>
  anomalyThreshold?: number // Pourcentage d'écart par rapport à la moyenne pour considérer une offre comme anormale
  weightPrice?: number // Poids du prix dans le score final (0-1)
  weightConformity?: number // Poids de la conformité dans le score final (0-1)
}

/**
 * Analyse les offres pour un lot spécifique
 */
export function analyzeOffersForLot(
  lotCompanies: LotCompanyWithDetails[],
  options: OfferAnalysisOptions = {},
): OfferAnalysisResult | null {
  // Vérifier qu'il y a des offres à analyser
  if (!lotCompanies || lotCompanies.length === 0) {
    return null
  }

  // Filtrer pour n'avoir que les offres avec un montant
  const validOffers = lotCompanies.filter((lc) => lc.montant_ht !== null && lc.montant_ht !== undefined)
  if (validOffers.length === 0) {
    return null
  }

  // Récupérer les informations du lot
  const lotId = validOffers[0].lot_id
  const lotName = validOffers[0].lot_name
  const lotNumero = validOffers[0].lot_numero

  // Options par défaut
  const {
    estimatedPrices = {},
    anomalyThreshold = 15, // 15% d'écart par rapport à la moyenne
    weightPrice = 0.7,
    weightConformity = 0.3,
  } = options

  const estimatedPrice = estimatedPrices[lotId]

  // Calculer les statistiques de base
  const amounts = validOffers.map((offer) => Number(offer.montant_ht))
  const sortedAmounts = [...amounts].sort((a, b) => a - b)

  const lowest = sortedAmounts[0]
  const highest = sortedAmounts[sortedAmounts.length - 1]
  const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

  // Calculer la médiane
  const median =
    sortedAmounts.length % 2 === 0
      ? (sortedAmounts[sortedAmounts.length / 2 - 1] + sortedAmounts[sortedAmounts.length / 2]) / 2
      : sortedAmounts[Math.floor(sortedAmounts.length / 2)]

  // Calculer l'écart-type
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length
  const standardDeviation = Math.sqrt(variance)

  const statistics: OfferStatistics = {
    count: validOffers.length,
    lowest,
    highest,
    average,
    median,
    standardDeviation,
    range: highest - lowest,
  }

  // Analyser chaque offre
  const analyzedOffers: OfferAnalysis[] = validOffers.map((offer) => {
    const amount = Number(offer.montant_ht)
    const percentageFromAverage = ((amount - average) / average) * 100
    const percentageFromEstimate = estimatedPrice ? ((amount - estimatedPrice) / estimatedPrice) * 100 : undefined

    // Déterminer si l'offre est anormalement basse ou élevée
    const isAnomaly = Math.abs(percentageFromAverage) > anomalyThreshold

    // Calculer un score pour chaque offre (plus le score est bas, meilleure est l'offre)
    // Le score prend en compte le prix et la conformité
    let score = 0

    // Composante prix (normalisée entre 0 et 1, où 0 est le meilleur prix)
    const priceScore = (amount - lowest) / (highest - lowest || 1)

    // Composante conformité (0 si conforme, 1 si non conforme)
    const conformityScore = offer.status === "offre_reçue" ? 0 : 1

    // Score final pondéré
    score = priceScore * weightPrice + conformityScore * weightConformity

    return {
      id: offer.id,
      companyId: offer.company_id,
      companyName: offer.company_name,
      amount,
      rank: 0, // Sera calculé après le tri
      percentageFromAverage,
      percentageFromEstimate,
      isLowest: amount === lowest,
      isHighest: amount === highest,
      isAnomaly,
      score,
      recommendation: null, // Sera déterminé après l'analyse complète
    }
  })

  // Trier les offres par score (du meilleur au pire)
  analyzedOffers.sort((a, b) => a.score - b.score)

  // Attribuer les rangs
  analyzedOffers.forEach((offer, index) => {
    offer.rank = index + 1
  })

  // Déterminer les recommandations
  analyzedOffers.forEach((offer) => {
    if (offer.isAnomaly && offer.percentageFromAverage < -anomalyThreshold) {
      // Offre anormalement basse
      offer.recommendation = "anomalie"
    } else if (offer.rank === 1) {
      // Meilleure offre selon le score
      offer.recommendation = "mieux_disant"
    } else if (offer.isLowest) {
      // Offre la moins chère
      offer.recommendation = "moins_disant"
    }
  })

  // Identifier les anomalies
  const anomalies: OfferAnomaly[] = analyzedOffers
    .filter((offer) => offer.isAnomaly)
    .map((offer) => {
      let reason = ""
      let severity: "low" | "medium" | "high" = "low"

      if (offer.percentageFromAverage < -anomalyThreshold) {
        reason = `Prix anormalement bas (${offer.percentageFromAverage.toFixed(2)}% sous la moyenne)`
        severity = Math.abs(offer.percentageFromAverage) > anomalyThreshold * 2 ? "high" : "medium"
      } else if (offer.percentageFromAverage > anomalyThreshold) {
        reason = `Prix anormalement élevé (${offer.percentageFromAverage.toFixed(2)}% au-dessus de la moyenne)`
        severity = Math.abs(offer.percentageFromAverage) > anomalyThreshold * 2 ? "high" : "medium"
      }

      return {
        companyId: offer.companyId,
        companyName: offer.companyName,
        amount: offer.amount,
        reason,
        severity,
      }
    })

  return {
    lotId,
    lotName,
    lotNumero,
    estimatedPrice,
    offers: analyzedOffers,
    statistics,
    anomalies,
  }
}

/**
 * Analyse les offres pour tous les lots
 */
export function analyzeAllOffers(
  lotCompanies: LotCompanyWithDetails[],
  options: OfferAnalysisOptions = {},
): Record<string, OfferAnalysisResult> {
  // Regrouper les offres par lot
  const offersByLot: Record<string, LotCompanyWithDetails[]> = {}

  lotCompanies.forEach((lc) => {
    if (!offersByLot[lc.lot_id]) {
      offersByLot[lc.lot_id] = []
    }
    offersByLot[lc.lot_id].push(lc)
  })

  // Analyser chaque lot
  const results: Record<string, OfferAnalysisResult> = {}

  Object.entries(offersByLot).forEach(([lotId, offers]) => {
    const result = analyzeOffersForLot(offers, options)
    if (result) {
      results[lotId] = result
    }
  })

  return results
}

/**
 * Génère un rapport d'analyse des offres
 */
export function generateOfferAnalysisReport(results: Record<string, OfferAnalysisResult>): string {
  let report = "# Rapport d'Analyse des Offres\n\n"

  Object.values(results).forEach((result) => {
    report += `## Lot ${result.lotNumero}: ${result.lotName}\n\n`

    // Statistiques générales
    report += "### Statistiques\n\n"
    report += `- Nombre d'offres: ${result.statistics.count}\n`
    report += `- Offre la plus basse: ${result.statistics.lowest.toLocaleString()} €\n`
    report += `- Offre la plus élevée: ${result.statistics.highest.toLocaleString()} €\n`
    report += `- Moyenne: ${result.statistics.average.toLocaleString()} €\n`
    report += `- Médiane: ${result.statistics.median.toLocaleString()} €\n`
    report += `- Écart-type: ${result.statistics.standardDeviation.toLocaleString()} €\n`

    if (result.estimatedPrice) {
      report += `- Estimation initiale: ${result.estimatedPrice.toLocaleString()} €\n`
    }

    report += "\n### Classement des Offres\n\n"
    report += "| Rang | Entreprise | Montant (€) | Écart / Moyenne | Recommandation |\n"
    report += "|------|-----------|-------------|-----------------|----------------|\n"

    result.offers.forEach((offer) => {
      const recommendation = offer.recommendation
        ? offer.recommendation === "moins_disant"
          ? "Moins-disant"
          : offer.recommendation === "mieux_disant"
            ? "Mieux-disant"
            : "Anomalie"
        : ""

      report += `| ${offer.rank} | ${offer.companyName} | ${offer.amount.toLocaleString()} | ${offer.percentageFromAverage.toFixed(2)}% | ${recommendation} |\n`
    })

    // Anomalies
    if (result.anomalies.length > 0) {
      report += "\n### Anomalies Détectées\n\n"

      result.anomalies.forEach((anomaly) => {
        report += `- **${anomaly.companyName}**: ${anomaly.reason} (${anomaly.amount.toLocaleString()} €)\n`
      })
    }

    report += "\n---\n\n"
  })

  return report
}
