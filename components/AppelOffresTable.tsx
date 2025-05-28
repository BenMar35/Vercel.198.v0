"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Lot = {
  id: string
  name: string
  numero: string
}

type AppelOffresEntry = {
  lot: number
  raisonSociale: string
  adresse: string
  telephone: string
  email: string
  contact: string
}

type SelectedCompany = {
  id: string
  companyName: string
  lotId: string
  offer: string
  conformity: "oui" | "non" | ""
  moinsDisant: boolean
  mieuxDisant: boolean
  commentaires: string
  isFromEntry?: boolean
}

type MieuxDisantSelection = {
  [lotId: string]: {
    selectedCompanyId: string
    companyName: string
    offer: string
  }
}

interface AppelOffresTableProps {
  lots?: Lot[]
  entries?: AppelOffresEntry[]
  onMieuxDisantChange?: (lotId: string, selectedOfferId: string, offer: string, company: string) => void
  projectId?: string
}

export const AppelOffresTable = ({
  lots = [],
  entries = [],
  onMieuxDisantChange,
  projectId,
}: AppelOffresTableProps) => {
  const [selectedCompanies, setSelectedCompanies] = useState<SelectedCompany[]>([])
  const [mieuxDisantSelections, setMieuxDisantSelections] = useState<MieuxDisantSelection>({})

  // Initialiser les entreprises à partir des entries
  useEffect(() => {
    if (entries.length > 0 && lots.length > 0) {
      const entryCompanies: SelectedCompany[] = []

      entries.forEach((entry) => {
        const lot = lots.find((l) => Number(l.numero) === entry.lot)
        if (lot) {
          entryCompanies.push({
            id: `entry-${entry.lot}-${entry.raisonSociale}`,
            companyName: entry.raisonSociale,
            lotId: lot.id,
            offer: "",
            conformity: "",
            moinsDisant: false,
            mieuxDisant: false,
            commentaires: "",
            isFromEntry: true,
          })
        }
      })

      setSelectedCompanies((prev) => {
        // Filtrer les entreprises existantes pour éviter les doublons
        const existingIds = new Set(entryCompanies.map((c) => c.id))
        const filteredPrev = prev.filter((c) => !existingIds.has(c.id))
        return [...filteredPrev, ...entryCompanies]
      })
    }
  }, [entries, lots])

  // Fonction pour ajouter une entreprise à un lot
  const handleAddCompany = (lotId: string) => {
    const newId = `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSelectedCompanies([
      ...selectedCompanies,
      {
        id: newId,
        companyName: "",
        lotId,
        offer: "",
        conformity: "",
        moinsDisant: false,
        mieuxDisant: false,
        commentaires: "",
      },
    ])
  }

  // Fonction pour mettre à jour une entreprise sélectionnée
  const handleUpdateSelectedCompany = (id: string, field: string, value: any) => {
    console.log(`Updating company ${id}, field ${field} with value:`, value)

    setSelectedCompanies((prevCompanies) =>
      prevCompanies.map((company) => {
        if (company.id === id) {
          return { ...company, [field]: value }
        }
        return company
      }),
    )
  }

  // Fonction pour gérer la sélection du mieux disant
  const handleMieuxDisantSelection = (lotId: string, companyId: string) => {
    const company = allCompaniesByLot.find((lot) => lot.lot.id === lotId)?.companies.find((c) => c.id === companyId)
    if (company) {
      setMieuxDisantSelections((prev) => ({
        ...prev,
        [lotId]: {
          selectedCompanyId: companyId,
          companyName: company.companyName,
          offer: company.offer,
        },
      }))

      if (onMieuxDisantChange) {
        onMieuxDisantChange(lotId, companyId, company.offer, company.companyName)
      }
    }
  }

  // Fonction pour supprimer une entreprise sélectionnée
  const handleRemoveSelectedCompany = (id: string) => {
    setSelectedCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== id))
  }

  // Grouper les entreprises par lot
  const allCompaniesByLot = useMemo(() => {
    return lots.map((lot) => {
      const lotCompanies = selectedCompanies.filter((company) => company.lotId === lot.id)

      return {
        lot,
        companies: lotCompanies,
      }
    })
  }, [lots, selectedCompanies])

  // Calculer le moins disant par lot
  const moinsDisant = useMemo(() => {
    const result: Record<string, { companyName: string; offer: string }> = {}

    allCompaniesByLot.forEach(({ lot, companies }) => {
      const companiesWithOffers = companies.filter((c) => c.offer && Number.parseFloat(c.offer) > 0)
      if (companiesWithOffers.length > 0) {
        const minOffer = Math.min(...companiesWithOffers.map((c) => Number.parseFloat(c.offer)))
        const minCompany = companiesWithOffers.find((c) => Number.parseFloat(c.offer) === minOffer)
        if (minCompany) {
          result[lot.id] = {
            companyName: minCompany.companyName,
            offer: minCompany.offer,
          }
        }
      }
    })

    return result
  }, [allCompaniesByLot])

  // Calculer les entreprises éligibles pour le mieux disant par lot
  const mieuxDisantEligibles = useMemo(() => {
    const result: Record<string, SelectedCompany[]> = {}

    allCompaniesByLot.forEach(({ lot, companies }) => {
      result[lot.id] = companies.filter((c) => c.offer && Number.parseFloat(c.offer) > 0 && c.conformity === "oui")
    })

    return result
  }, [allCompaniesByLot])

  // Fonction pour arrêter la propagation des événements
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg text-rendering-optimized" onMouseDown={stopPropagation}>
      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%] bg-[#F6F5EB] text-center" rowSpan={2}>
              Lot
            </TableHead>
            <TableHead className="w-[20%] bg-[#F6F5EB] text-center" rowSpan={2}>
              Raison sociale
            </TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center" rowSpan={2}>
              Offre (€)
            </TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center" rowSpan={2}>
              Conformité
            </TableHead>
            <TableHead className="w-[15%] bg-[#F6F5EB] text-center" colSpan={2}>
              Moins disant
            </TableHead>
            <TableHead className="w-[15%] bg-[#F6F5EB] text-center" colSpan={2}>
              Mieux disant
            </TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center" rowSpan={2}>
              Commentaires
            </TableHead>
            <TableHead className="w-[5%] bg-[#F6F5EB] text-center" rowSpan={2}></TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="w-[7.5%] bg-[#F6F5EB] text-center">Entreprise</TableHead>
            <TableHead className="w-[7.5%] bg-[#F6F5EB] text-center">Offre</TableHead>
            <TableHead className="w-[7.5%] bg-[#F6F5EB] text-center">Entreprise</TableHead>
            <TableHead className="w-[7.5%] bg-[#F6F5EB] text-center">Offre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allCompaniesByLot.map((lotGroup) => {
            const { lot, companies: lotCompanies } = lotGroup
            const lotMoinsDisant = moinsDisant[lot.id]
            const lotMieuxDisantEligibles = mieuxDisantEligibles[lot.id] || []
            const selectedMieuxDisant = mieuxDisantSelections[lot.id]

            return lotCompanies.length > 0 ? (
              lotCompanies.map((selectedCompany, index) => (
                <TableRow key={selectedCompany.id}>
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {lot.name}
                    </TableCell>
                  )}
                  <TableCell className="bg-[#F6F5EB]">
                    {selectedCompany.isFromEntry ? (
                      // Afficher le nom de l'entreprise venant des entries (non modifiable)
                      <div className="p-2 rounded">{selectedCompany.companyName}</div>
                    ) : (
                      // Input pour les entreprises ajoutées manuellement
                      <Input
                        value={selectedCompany.companyName}
                        onChange={(e) => handleUpdateSelectedCompany(selectedCompany.id, "companyName", e.target.value)}
                        placeholder="Nom de l'entreprise"
                        className="w-full"
                      />
                    )}
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={selectedCompany.offer}
                      onChange={(e) => {
                        // Vérifier que la valeur est un nombre valide
                        const value = e.target.value
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          handleUpdateSelectedCompany(selectedCompany.id, "offer", value)
                        }
                      }}
                      placeholder="Montant"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Select
                      value={selectedCompany.conformity}
                      onValueChange={(value: "oui" | "non" | "") =>
                        handleUpdateSelectedCompany(selectedCompany.id, "conformity", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Conformité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oui">Oui</SelectItem>
                        <SelectItem value="non">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Moins disant - Entreprise */}
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {lotMoinsDisant ? lotMoinsDisant.companyName : "-"}
                    </TableCell>
                  )}

                  {/* Moins disant - Offre */}
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {lotMoinsDisant ? `${lotMoinsDisant.offer} €` : "-"}
                    </TableCell>
                  )}

                  {/* Mieux disant - Entreprise */}
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] align-middle" rowSpan={lotCompanies.length}>
                      <Select
                        value={selectedMieuxDisant?.selectedCompanyId || ""}
                        onValueChange={(value) => handleMieuxDisantSelection(lot.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent>
                          {lotMieuxDisantEligibles.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}

                  {/* Mieux disant - Offre */}
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {selectedMieuxDisant ? `${selectedMieuxDisant.offer} €` : "-"}
                    </TableCell>
                  )}

                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      value={selectedCompany.commentaires}
                      onChange={(e) => handleUpdateSelectedCompany(selectedCompany.id, "commentaires", e.target.value)}
                      placeholder="Commentaires"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
                    {!selectedCompany.isFromEntry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSelectedCompany(selectedCompany.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key={lot.id}>
                <TableCell className="bg-[#F6F5EB] text-center">{lot.name}</TableCell>
                <TableCell colSpan={3} className="bg-[#F6F5EB] text-center text-gray-500">
                  Aucune entreprise sélectionnée pour ce lot
                </TableCell>

                {/* Moins disant - Entreprise */}
                <TableCell className="bg-[#F6F5EB] text-center">
                  {lotMoinsDisant ? lotMoinsDisant.companyName : "-"}
                </TableCell>

                {/* Moins disant - Offre */}
                <TableCell className="bg-[#F6F5EB] text-center">
                  {lotMoinsDisant ? `${lotMoinsDisant.offer} €` : "-"}
                </TableCell>

                {/* Mieux disant - Entreprise */}
                <TableCell className="bg-[#F6F5EB]">
                  <Select
                    value={selectedMieuxDisant?.selectedCompanyId || ""}
                    onValueChange={(value) => handleMieuxDisantSelection(lot.id, value)}
                    disabled={lotMieuxDisantEligibles.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotMieuxDisantEligibles.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Mieux disant - Offre */}
                <TableCell className="bg-[#F6F5EB] text-center">
                  {selectedMieuxDisant ? `${selectedMieuxDisant.offer} €` : "-"}
                </TableCell>

                <TableCell className="bg-[#F6F5EB]"></TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">
                  <Button
                    onClick={() => handleAddCompany(lot.id)}
                    className="w-8 h-8 p-0 bg-custom-gold hover:bg-yellow-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
