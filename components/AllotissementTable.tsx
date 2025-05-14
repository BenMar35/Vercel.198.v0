"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Papa from "papaparse"

type AllotissementRow = {
  id: string
  numero: string
  lot: string
}

type Lot = {
  id: string
  name: string
  numero: string
}

interface AllotissementTableProps {
  onLotsChange?: (lots: Lot[]) => void
  fileInputRef?: React.RefObject<HTMLInputElement>
}

export const AllotissementTable = ({ onLotsChange, fileInputRef }: AllotissementTableProps) => {
  const [rows, setRows] = useState<AllotissementRow[]>([{ id: "1", numero: "", lot: "" }])
  const [lots, setLots] = useState<string[]>([])
  const [fileLoaded, setFileLoaded] = useState(false)
  const internalFileInputRef = useRef<HTMLInputElement>(null)
  const prevRowsRef = useRef<AllotissementRow[]>([])

  // Utiliser la référence externe si elle est fournie, sinon utiliser la référence interne
  const actualFileInputRef = fileInputRef || internalFileInputRef

  // Effet pour configurer l'écouteur d'événements sur la référence externe
  useEffect(() => {
    if (fileInputRef?.current) {
      const handleChange = (event: Event) => {
        const inputEvent = event as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileUpload(inputEvent)
      }

      fileInputRef.current.addEventListener("change", handleChange)

      return () => {
        fileInputRef.current?.removeEventListener("change", handleChange)
      }
    }
  }, [fileInputRef])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newLots = results.data
            .slice(1)
            .map((row: any) => row[0])
            .filter(Boolean)
          setLots(newLots)
          setFileLoaded(true)
        },
        header: false,
      })
    }
  }

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now().toString(), numero: "", lot: "" }])
  }

  const handleChange = (id: string, field: "numero" | "lot", value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  // Convertir les lignes en lots pour les partager avec AppelOffresTable
  useEffect(() => {
    // Vérifier si les rows ont réellement changé de manière significative
    const hasSignificantChange = () => {
      if (prevRowsRef.current.length !== rows.length) return true

      for (let i = 0; i < rows.length; i++) {
        const prevRow = prevRowsRef.current[i]
        const currentRow = rows[i]

        if (
          !prevRow ||
          prevRow.id !== currentRow.id ||
          prevRow.numero !== currentRow.numero ||
          prevRow.lot !== currentRow.lot
        ) {
          return true
        }
      }

      return false
    }

    if (onLotsChange && hasSignificantChange()) {
      const formattedLots = rows
        .filter((row) => row.lot && row.numero) // Filtrer les lignes incomplètes
        .map((row) => ({
          id: row.id,
          name: row.lot,
          numero: row.numero, // Ajouter le numéro du lot
        }))

      onLotsChange(formattedLots)
      prevRowsRef.current = [...rows]
    }
  }, [rows, onLotsChange])

  // Modifier les styles pour utiliser des polices plus grandes
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg text-rendering-optimized">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Allotissement</h2>
        {/* Masquer le bouton d'upload puisqu'il est maintenant dans le bandeau de droite */}
        <input ref={internalFileInputRef} type="file" onChange={handleFileUpload} accept=".csv" className="hidden" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-lg">n°</TableHead>
            <TableHead className="text-lg">Lot</TableHead>
            <TableHead className="w-[60px] text-lg"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Select onValueChange={(value) => handleChange(row.id, "numero", value)} value={row.numero}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Choisir un numéro" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 99 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()} className="text-lg">
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select onValueChange={(value) => handleChange(row.id, "lot", value)} value={row.lot}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Choisir un lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {lots.map((lot) => (
                      <SelectItem key={lot} value={lot} className="text-lg">
                        {lot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-center">
                <Button onClick={handleAddRow} className="w-10 h-10 p-0 bg-custom-gold hover:bg-yellow-600">
                  <Plus className="h-5 w-5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4 space-x-2">
        <Button className="bg-custom-gold hover:bg-yellow-600 text-black text-lg">CCTP</Button>
      </div>
    </div>
  )
}
