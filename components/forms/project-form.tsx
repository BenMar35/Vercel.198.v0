"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "@/types/project"

interface ProjectFormProps {
  initialData?: Partial<Project>
  onSubmit: (data: Omit<Project, "id">) => void
  submitLabel?: string
  isLoading?: boolean
}

export function ProjectForm({
  initialData = {},
  onSubmit,
  submitLabel = "Enregistrer",
  isLoading = false,
}: ProjectFormProps) {
  const [reference, setReference] = useState(initialData.reference || "")
  const [name, setName] = useState(initialData.name || "")
  const [clientType, setClientType] = useState(initialData.clientType || "")

  const clientTypes = [
    { value: "professionnel", label: "Professionnel", color: "text-red-500" },
    { value: "particulier", label: "Particulier", color: "text-yellow-500" },
    { value: "sg", label: "SG", color: "text-blue-500" },
    { value: "credit-agricole", label: "Crédit Agricole", color: "text-green-500" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      reference,
      name,
      clientType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-custom-black">
          Référence 1.61
        </label>
        <Input
          type="text"
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
          className="bg-[#F6F5EB]"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-custom-black">
          Nom du projet
        </label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-[#F6F5EB]"
        />
      </div>

      <div>
        <label htmlFor="clientType" className="block text-sm font-medium text-custom-black">
          Type de maîtrise d'ouvrage
        </label>
        <Select onValueChange={setClientType} value={clientType} required>
          <SelectTrigger className="w-full bg-[#F6F5EB]">
            <SelectValue placeholder="Sélectionnez le type de client">
              {clientType && (
                <span className={`${clientTypes.find((t) => t.value === clientType)?.color} font-bold`}>
                  {clientTypes.find((t) => t.value === clientType)?.label}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#F6F5EB]">
            {clientTypes.map((type) => (
              <SelectItem
                key={type.value}
                value={type.value}
                className={`${type.color} bg-[#F6F5EB] hover:bg-[#E6E5DB] hover:font-semibold data-[state=checked]:font-bold`}
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-custom-gold hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
      >
        {isLoading ? "Chargement..." : submitLabel}
      </Button>
    </form>
  )
}
