"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import ProjectSidebar from "@/components/ProjectSidebar"
import { PageTitle } from "@/components/PageTitle"
import { motion } from "framer-motion"

const clientTypes = [
  { value: "professionnel", label: "Professionnel", color: "text-red-500" },
  { value: "particulier", label: "Particulier", color: "text-yellow-500" },
  { value: "sg", label: "SG", color: "text-blue-500" },
  { value: "credit-agricole", label: "Crédit Agricole", color: "text-green-500" },
]

export default function NewProject() {
  const [reference, setReference] = useState("")
  const [name, setName] = useState("")
  const [clientType, setClientType] = useState("")
  const router = useRouter()

  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProject: Project = {
      id: Date.now().toString(),
      reference,
      name,
      clientType,
    }
    setProjects([...projects, newProject])
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageTitle pageTitle="Nouveau Projet" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full bg-custom-gold hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              >
                Créer le projet
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
