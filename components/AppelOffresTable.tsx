"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useSWRLotCompanies } from "@/hooks/useSWRLotCompanies"
import { useSWRCompanies } from "@/hooks/useSWRCompanies"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Lot = {
  id: string
  name: string
  numero: string
}

type MieuxDisantSelection = {
  [lotId: string]: {
    selectedOfferId: string
    offer: string
    company: string
  }
}

type AppelOffresEntry = {
  lot: number
  raisonSociale: string
  adresse: string
  telephone: string
  email: string
  contact: string
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
  const [mieuxDisantSelections, setMieuxDisantSelections] = useState<MieuxDisantSelection>({})
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Utiliser le hook SWR pour les relations lots-entreprises
  const {
    lotCompanies,
    isLoading: lotCompaniesLoading,
    error: lotCompaniesError,
    createLotCompany,
    updateLotCompany,
    deleteLotCompany,
  } = useSWRLotCompanies({
    project_id: projectId,
  })

  // Utiliser le hook SWR pour les entreprises
  const { companies, isLoading: companiesLoading, error: companiesError } = useSWRCompanies()

  // État pour stocker les données en mode hors ligne
  const [offlineLotCompanies, setOfflineLotCompanies] = useState<any[]>([])

  // Détecter si nous devons passer en mode hors ligne
  useEffect(() => {
    if (lotCompaniesError || companiesError) {
      console.warn("Erreur de connexion à Supabase, passage en mode hors ligne", lotCompaniesError || companiesError)
      setIsOfflineMode(true)

      // Initialiser les données hors ligne à partir des entrées
      if (entries.length > 0) {
        const offlineData = entries
          .map((entry) => {
            const lot = lots.find((l) => Number(l.numero) === entry.lot)
            if (!lot) return null

            return {
              id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              lot_id: lot.id,
              company_id: entry.raisonSociale, // Utiliser la raison sociale comme ID temporaire
              company_name: entry.raisonSociale,
              montant_ht: "",
              conformity: "",
              moins_disant: false,
              mieux_disant: false,
              commentaires: "",
            }
          })
          .filter(Boolean)

        setOfflineLotCompanies(offlineData)
      }
    }
  }, [lotCompaniesError, companiesError, entries, lots])

  // Fonction pour ajouter une entreprise à un lot
  const handleAddCompany = async (lotId: string) => {
    if (isOfflineMode) {
      // Mode hors ligne
      const newId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setOfflineLotCompanies([
        ...offlineLotCompanies,
        {
          id: newId,
          lot_id: lotId,
          company_id: "",
          company_name: "",
          montant_ht: "",
          conformity: "",
          moins_disant: false,
          mieux_disant: false,
          commentaires: "",
        },
      ])
    } else {
      // Mode en ligne
      try {
        await createLotCompany({
          lot_id: lotId,
          company_id: "", // Sera mis à jour lorsque l'utilisateur sélectionnera une entreprise
          montant_ht: null,
          status: "consulté",
          selected: false,
        })
      } catch (error) {
        console.error("Erreur lors de l'ajout d'une entreprise:", error)
        // Passer en mode hors ligne en cas d'erreur
        setIsOfflineMode(true)
        handleAddCompany(lotId) // Réessayer en mode hors ligne
      }
    }
  }

  // Fonction pour mettre à jour une entreprise sélectionnée
  const handleUpdateSelectedCompany = async (id: string, field: string, value: any) => {
    if (isOfflineMode) {
      // Mode hors ligne
      setOfflineLotCompanies((prevCompanies) =>
        prevCompanies.map((company) => (company.id === id ? { ...company, [field]: value } : company)),
      )

      // Gérer la sélection "mieux disant"
      if (field === "mieux_disant" && value === true) {
        const company = offlineLotCompanies.find((c) => c.id === id)
        if (company && onMieuxDisantChange) {
          // Mettre à jour la sélection mieux disant
          setMieuxDisantSelections((prev) => ({
            ...prev,
            [company.lot_id]: {
              selectedOfferId: id,
              offer: company.montant_ht,
              company: company.company_name,
            },
          }))

          // Notifier le parent
          onMieuxDisantChange(company.lot_id, id, company.montant_ht, company.company_name)

          // Désactiver mieux_disant pour les autres entreprises du même lot
          setOfflineLotCompanies((prev) =>
            prev.map((c) => (c.lot_id === company.lot_id && c.id !== id ? { ...c, mieux_disant: false } : c)),
          )
        }
      }
    } else {
      // Mode en ligne
      try {
        // Convertir le nom du champ si nécessaire
        const fieldMapping: Record<string, string> = {
          companyId: "company_id",
          offer: "montant_ht",
          conformity: "conformity",
          moinsDisant: "moins_disant",
          mieuxDisant: "mieux_disant",
          commentaires: "commentaires",
        }

        const apiField = fieldMapping[field] || field

        // Mettre à jour dans la base de données
        await updateLotCompany(id, { [apiField]: value })

        // Gérer la sélection "mieux disant"
        if (field === "mieuxDisant" && value === true) {
          const company = lotCompanies.find((c) => c.id === id)
          if (company && onMieuxDisantChange) {
            // Mettre à jour la sélection mieux disant
            setMieuxDisantSelections((prev) => ({
              ...prev,
              [company.lot_id]: {
                selectedOfferId: id,
                offer: company.montant_ht?.toString() || "",
                company: company.company_id,
              },
            }))

            // Notifier le parent
            onMieuxDisantChange(company.lot_id, id, company.montant_ht?.toString() || "", company.company_id)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour d'une entreprise:", error)
        // Passer en mode hors ligne en cas d'erreur
        setIsOfflineMode(true)
        handleUpdateSelectedCompany(id, field, value) // Réessayer en mode hors ligne
      }
    }
  }

  // Fonction pour supprimer une entreprise sélectionnée
  const handleRemoveSelectedCompany = async (id: string) => {
    if (isOfflineMode) {
      // Mode hors ligne
      setOfflineLotCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== id))
    } else {
      // Mode en ligne
      try {
        await deleteLotCompany(id)
      } catch (error) {
        console.error("Erreur lors de la suppression d'une entreprise:", error)
        // Passer en mode hors ligne en cas d'erreur
        setIsOfflineMode(true)
        handleRemoveSelectedCompany(id) // Réessayer en mode hors ligne
      }
    }
  }

  // Déterminer les données à afficher (en ligne ou hors ligne)
  const displayData = isOfflineMode ? offlineLotCompanies : lotCompanies

  // Grouper les entreprises par lot
  const companiesByLot = lots.map((lot) => {
    return {
      lot,
      companies: displayData.filter((sc) => sc.lot_id === lot.id),
    }
  })

  // Fonction pour arrêter la propagation des événements
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  // Afficher un indicateur de chargement
  if (!isOfflineMode && (lotCompaniesLoading || companiesLoading)) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Chargement des données...</span>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg text-rendering-optimized" onMouseDown={stopPropagation}>
      {isOfflineMode && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mode hors ligne activé. Les modifications ne seront pas sauvegardées dans la base de données.
          </AlertDescription>
        </Alert>
      )}

      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%] bg-[#F6F5EB] text-center">Lot</TableHead>
            <TableHead className="w-[20%] bg-[#F6F5EB] text-center">Raison sociale</TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Offre (€)</TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Conformité</TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Moins disant</TableHead>
            <TableHead className="w-[10%] bg-[#F6F5EB] text-center">Mieux disant</TableHead>
            <TableHead className="w-[20%] bg-[#F6F5EB] text-center">Commentaires</TableHead>
            <TableHead className="w-[5%] bg-[#F6F5EB] text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companiesByLot.map((lotGroup) => {
            const { lot, companies: lotCompanies } = lotGroup

            return lotCompanies.length > 0 ? (
              lotCompanies.map((selectedCompany, index) => (
                <TableRow key={selectedCompany.id}>
                  {index === 0 && (
                    <TableCell className="bg-[#F6F5EB] text-center align-middle" rowSpan={lotCompanies.length}>
                      {lot.name}
                    </TableCell>
                  )}
                  <TableCell className="bg-[#F6F5EB]">
                    <Select
                      value={isOfflineMode ? selectedCompany.company_id : selectedCompany.company_id || ""}
                      onValueChange={(value) =>
                        handleUpdateSelectedCompany(
                          selectedCompany.id,
                          isOfflineMode ? "company_id" : "companyId",
                          value,
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une entreprise" />
                      </SelectTrigger>
                      <SelectContent>
                        {isOfflineMode
                          ? // Mode hors ligne: utiliser les entrées
                            entries
                              .filter((entry) => Number(lot.numero) === entry.lot)
                              .map((entry, i) => (
                                <SelectItem key={`${entry.raisonSociale}-${i}`} value={entry.raisonSociale}>
                                  {entry.raisonSociale}
                                </SelectItem>
                              ))
                          : // Mode en ligne: utiliser les entreprises de la base de données
                            companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      type="number"
                      value={
                        isOfflineMode ? selectedCompany.montant_ht || "" : selectedCompany.montant_ht?.toString() || ""
                      }
                      onChange={(e) =>
                        handleUpdateSelectedCompany(
                          selectedCompany.id,
                          isOfflineMode ? "montant_ht" : "offer",
                          e.target.value,
                        )
                      }
                      placeholder="Montant"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Select
                      value={isOfflineMode ? selectedCompany.conformity || "" : selectedCompany.conformity || ""}
                      onValueChange={(value: "oui" | "non" | "") =>
                        handleUpdateSelectedCompany(selectedCompany.id, "conformity", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          selectedCompany.conformity === "oui" && "bg-green-100",
                          selectedCompany.conformity === "non" && "bg-orange-100",
                        )}
                      >
                        <SelectValue placeholder="Conformité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oui" className="bg-green-100">
                          Oui
                        </SelectItem>
                        <SelectItem value="non" className="bg-orange-100">
                          Non
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
                    <Checkbox
                      checked={isOfflineMode ? selectedCompany.moins_disant : selectedCompany.moins_disant}
                      onCheckedChange={(checked) =>
                        handleUpdateSelectedCompany(
                          selectedCompany.id,
                          isOfflineMode ? "moins_disant" : "moinsDisant",
                          !!checked,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
                    <Checkbox
                      checked={isOfflineMode ? selectedCompany.mieux_disant : selectedCompany.mieux_disant}
                      onCheckedChange={(checked) =>
                        handleUpdateSelectedCompany(
                          selectedCompany.id,
                          isOfflineMode ? "mieux_disant" : "mieuxDisant",
                          !!checked,
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB]">
                    <Input
                      value={isOfflineMode ? selectedCompany.commentaires || "" : selectedCompany.commentaires || ""}
                      onChange={(e) => handleUpdateSelectedCompany(selectedCompany.id, "commentaires", e.target.value)}
                      placeholder="Commentaires"
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center">
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key={lot.id}>
                <TableCell className="bg-[#F6F5EB] text-center">{lot.name}</TableCell>
                <TableCell colSpan={6} className="bg-[#F6F5EB] text-center text-gray-500">
                  Aucune entreprise sélectionnée pour ce lot
                </TableCell>
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
