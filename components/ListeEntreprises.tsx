"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const COMPANY_COLUMNS = [
  "Raison sociale",
  "Adresse",
  "Code postal",
  "Ville",
  "Téléphone société",
  "Email société",
  "Contact",
  "Portable",
  "Email",
]

type Company = {
  id: string
  [key: string]: string
}

export default function ListeEntreprises() {
  const [companies, setCompanies] = useLocalStorage<Company[]>("companies", [])
  const [newCompany, setNewCompany] = useState<Company>({
    id: "",
    "Raison sociale": "",
    Adresse: "",
    "Code postal": "",
    Ville: "",
    "Téléphone société": "",
    "Email société": "",
    Contact: "",
    Portable: "",
    Email: "",
  })

  const handleInputChange = (column: string, value: string) => {
    setNewCompany((prev) => ({ ...prev, [column]: value }))
  }

  const handleAddCompany = () => {
    const companyWithId = { ...newCompany, id: Date.now().toString() }
    setCompanies([...companies, companyWithId])
    setNewCompany({
      id: "",
      "Raison sociale": "",
      Adresse: "",
      "Code postal": "",
      Ville: "",
      "Téléphone société": "",
      "Email société": "",
      Contact: "",
      Portable: "",
      Email: "",
    })
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Liste des entreprises</h2>
      <Table>
        <TableHeader>
          <TableRow>
            {COMPANY_COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              {COMPANY_COLUMNS.map((column) => (
                <TableCell key={`${company.id}-${column}`}>{company[column]}</TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            {COMPANY_COLUMNS.map((column) => (
              <TableCell key={`new-${column}`}>
                <Input
                  value={newCompany[column]}
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  placeholder={column}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={handleAddCompany} className="mt-4">
        Ajouter une entreprise
      </Button>
    </div>
  )
}
