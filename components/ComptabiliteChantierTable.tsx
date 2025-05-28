"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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

type ComptabiliteRow = {
  id: string
  lotId: string
  raisonSociale: string
  offre: string
  avenants: { id: string; value: string }[]
  bps: { id: string; value: string }[]
}

interface ComptabiliteChantierTableProps {
  lots?: Lot[]
  mieuxDisantSelections?: MieuxDisantSelection
  projectId?: string
}

export const ComptabiliteChantierTable = ({
  lots = [],
  mieuxDisantSelections = {},
  projectId = "project-1",
}: ComptabiliteChantierTableProps) => {
  const [rows, setRows] = useState<ComptabiliteRow[]>([])
  const [avenantCount, setAvenantCount] = useState(1)
  const [bpCount, setBpCount] = useState(1)

  // Charger les données depuis le localStorage ou initialiser avec les sélections mieux disant
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`comptabilite_chantier_${projectId}`)

      if (savedData) {
        const parsedData = JSON.parse(savedData)

        // Mettre à jour avec les nouvelles sélections mieux disant
        const updatedRows = lots.map((lot) => {
          const existingRow = parsedData.find((r: ComptabiliteRow) => r.lotId === lot.id)
          const mieuxDisant = mieuxDisantSelections[lot.id]

          if (existingRow) {
            // Mettre à jour la raison sociale et l'offre si une nouvelle sélection mieux disant existe
            return {
              ...existingRow,
              raisonSociale: mieuxDisant?.company || existingRow.raisonSociale,
              offre: mieuxDisant?.offer || existingRow.offre,
            }
          }

          return {
            id: lot.id,
            lotId: lot.id,
            raisonSociale: mieuxDisant?.company || "",
            offre: mieuxDisant?.offer || "",
            avenants: [{ id: "avenant1", value: "" }],
            bps: [{ id: "bp1", value: "" }],
          }
        })

        setRows(updatedRows)
        saveToLocalStorage(updatedRows)

        // Déterminer le nombre d'avenants et de BPs
        let maxAvenants = 1
        let maxBPs = 1

        updatedRows.forEach((row) => {
          if (row.avenants && row.avenants.length > maxAvenants) {
            maxAvenants = row.avenants.length
          }
          if (row.bps && row.bps.length > maxBPs) {
            maxBPs = row.bps.length
          }
        })

        setAvenantCount(maxAvenants)
        setBpCount(maxBPs)
      } else {
        // Initialiser avec les sélections mieux disant
        initializeRows()
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de comptabilité:", error)
      initializeRows()
    }
  }, [lots, mieuxDisantSelections, projectId])

  // Initialiser les lignes basées sur les lots et les sélections mieux disant
  const initializeRows = () => {
    const newRows = lots.map((lot) => {
      const mieuxDisant = mieuxDisantSelections[lot.id] || { company: "", offer: "" }

      return {
        id: lot.id,
        lotId: lot.id,
        raisonSociale: mieuxDisant.company || "",
        offre: mieuxDisant.offer || "",
        avenants: [{ id: "avenant1", value: "" }],
        bps: [{ id: "bp1", value: "" }],
      }
    })

    setRows(newRows)
    saveToLocalStorage(newRows)
  }

  // Sauvegarder les données dans le localStorage
  const saveToLocalStorage = (data: ComptabiliteRow[]) => {
    try {
      localStorage.setItem(`comptabilite_chantier_${projectId}`, JSON.stringify(data))
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données de comptabilité:", error)
    }
  }

  const handleAddAvenant = () => {
    const newCount = avenantCount + 1
    setAvenantCount(newCount)

    const updatedRows = rows.map((row) => ({
      ...row,
      avenants: [...row.avenants, { id: `avenant${newCount}`, value: "" }],
    }))

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  const handleAddBP = () => {
    const newCount = bpCount + 1
    setBpCount(newCount)

    const updatedRows = rows.map((row) => ({
      ...row,
      bps: [...row.bps, { id: `bp${newCount}`, value: "" }],
    }))

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  const handleAvenantChange = (rowId: string, avenantId: string, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          avenants: row.avenants.map((avenant) => (avenant.id === avenantId ? { ...avenant, value } : avenant)),
        }
      }
      return row
    })

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  const handleBPChange = (rowId: string, bpId: string, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          bps: row.bps.map((bp) => (bp.id === bpId ? { ...bp, value } : bp)),
        }
      }
      return row
    })

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  const handleRaisonSocialeChange = (rowId: string, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          raisonSociale: value,
        }
      }
      return row
    })

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  const handleOffreChange = (rowId: string, value: string) => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          offre: value,
        }
      }
      return row
    })

    setRows(updatedRows)
    saveToLocalStorage(updatedRows)
  }

  // Calculer les totaux pour chaque ligne
  const rowsWithTotals = useMemo(() => {
    return rows.map((row) => {
      const offreValue = Number.parseFloat(row.offre) || 0

      const avenantTotal = row.avenants.reduce((sum, avenant) => {
        return sum + (Number.parseFloat(avenant.value) || 0)
      }, 0)

      const bpTotal = row.bps.reduce((sum, bp) => {
        return sum + (Number.parseFloat(bp.value) || 0)
      }, 0)

      const total = offreValue + avenantTotal
      const resteAPayer = total - bpTotal

      return {
        ...row,
        total,
        totalPaiement: bpTotal,
        resteAPayer,
      }
    })
  }, [rows])

  // Calculer les totaux des colonnes
  const columnTotals = useMemo(() => {
    const offreTotal = rowsWithTotals.reduce((sum, row) => sum + (Number.parseFloat(row.offre) || 0), 0)
    const total = rowsWithTotals.reduce((sum, row) => sum + row.total, 0)
    const totalPaiement = rowsWithTotals.reduce((sum, row) => sum + row.totalPaiement, 0)
    const resteAPayer = total - totalPaiement

    return {
      offreTotal,
      total,
      totalPaiement,
      resteAPayer,
    }
  }, [rowsWithTotals])

  // Trouver le lot correspondant à l'ID
  const getLot = (lotId: string) => {
    return lots.find((lot) => lot.id === lotId) || { numero: "", name: "" }
  }

  // Fonction pour arrêter la propagation des événements
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg text-rendering-optimized" style={{ width: "2500px" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Comptabilité chantier</h2>
      </div>

      <div className="transform-disable" onMouseDown={stopPropagation} onPointerDown={stopPropagation}>
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%] bg-[#F6F5EB] text-center text-lg">Lot</TableHead>
              <TableHead className="w-[15%] bg-[#F6F5EB] text-center text-lg">Raison sociale</TableHead>
              <TableHead className="w-[8%] bg-[#F6F5EB] text-center text-lg">Offre (€)</TableHead>

              {Array.from({ length: avenantCount }).map((_, index) => (
                <TableHead key={`avenant-head-${index + 1}`} className="w-[8%] bg-[#F6F5EB] text-center text-lg">
                  Avenant {index + 1}
                  {index === avenantCount - 1 && (
                    <Button onClick={handleAddAvenant} className="ml-1 w-6 h-6 p-0 bg-custom-gold hover:bg-yellow-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </TableHead>
              ))}

              <TableHead className="w-[8%] bg-[#F6F5EB] text-center border-l border-gray-300 text-lg">Total</TableHead>

              {Array.from({ length: bpCount }).map((_, index) => (
                <TableHead key={`bp-head-${index + 1}`} className="w-[8%] bg-[#F6F5EB] text-center text-lg">
                  BP {index + 1}
                  {index === bpCount - 1 && (
                    <Button onClick={handleAddBP} className="ml-1 w-6 h-6 p-0 bg-custom-gold hover:bg-yellow-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </TableHead>
              ))}

              <TableHead className="w-[8%] bg-[#F6F5EB] text-center border-l border-gray-300 text-lg">
                Total paiements
              </TableHead>
              <TableHead className="w-[8%] bg-[#F6F5EB] text-center border-l border-gray-300 text-lg">
                Reste à payer
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsWithTotals.map((row) => {
              const lot = getLot(row.lotId)

              return (
                <TableRow key={row.id}>
                  <TableCell className="bg-[#F6F5EB] text-center text-lg">
                    <span className="font-bold mr-2">{lot.numero}</span>
                    {lot.name}
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center text-lg">
                    <Input
                      type="text"
                      value={row.raisonSociale}
                      onChange={(e) => handleRaisonSocialeChange(row.id, e.target.value)}
                      className="w-full bg-[#F6F5EB] border-none shadow-none text-center text-lg"
                      placeholder="Raison sociale"
                    />
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center text-lg">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={row.offre}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          handleOffreChange(row.id, value)
                        }
                      }}
                      placeholder="0.00"
                      className="w-full bg-[#F6F5EB] border-none shadow-none text-center text-lg"
                    />
                  </TableCell>

                  {row.avenants.map((avenant) => (
                    <TableCell key={`${row.id}-${avenant.id}`} className="bg-[#F6F5EB]">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={avenant.value}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            handleAvenantChange(row.id, avenant.id, value)
                          }
                        }}
                        placeholder="0.00"
                        className="w-full bg-[#F6F5EB] border-none shadow-none text-center text-lg"
                      />
                    </TableCell>
                  ))}

                  <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                    {row.total.toFixed(2)} €
                  </TableCell>

                  {row.bps.map((bp) => (
                    <TableCell key={`${row.id}-${bp.id}`} className="bg-[#F6F5EB]">
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={bp.value}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            handleBPChange(row.id, bp.id, value)
                          }
                        }}
                        placeholder="0.00"
                        className="w-full bg-[#F6F5EB] border-none shadow-none text-center text-base"
                      />
                    </TableCell>
                  ))}

                  <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                    {row.totalPaiement.toFixed(2)} €
                  </TableCell>
                  <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                    {row.resteAPayer.toFixed(2)} €
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Ligne des totaux */}
            <TableRow>
              <TableCell colSpan={2} className="bg-[#F6F5EB] text-right font-bold text-base">
                Total :
              </TableCell>
              <TableCell className="bg-[#F6F5EB] text-center font-bold text-base">
                {columnTotals.offreTotal.toFixed(2)} €
              </TableCell>
              <TableCell colSpan={avenantCount} className="bg-[#F6F5EB]"></TableCell>
              <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                {columnTotals.total.toFixed(2)} €
              </TableCell>
              <TableCell colSpan={bpCount} className="bg-[#F6F5EB]"></TableCell>
              <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                {columnTotals.totalPaiement.toFixed(2)} €
              </TableCell>
              <TableCell className="bg-[#F6F5EB] text-center font-bold border-l border-gray-300 text-base">
                {columnTotals.resteAPayer.toFixed(2)} €
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
