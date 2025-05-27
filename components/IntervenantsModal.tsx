"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjectInfo } from "@/hooks/useProjectInfo"

interface IntervenantsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  appelOffresEntries: any[] // Entreprises de SAO
}

const roleOptions = [
  "Maîtrise d'ouvrage",
  "Architecte",
  "BET CVC",
  "BET Lots fluides",
  "BET Structures",
  "BET VRD",
  "BET Thermique",
]

export function IntervenantsModal({ isOpen, onClose, projectId, appelOffresEntries }: IntervenantsModalProps) {
  const { projectInfo, saveProjectInfo } = useProjectInfo(projectId)
  const [activeTab, setActiveTab] = useState("maitrise-ouvrage")

  // État pour les contacts de maîtrise d'ouvrage
  const [moContacts, setMoContacts] = useState<
    { id: string; name: string; role: string; phone: string; email: string }[]
  >([])

  // État pour les contacts de maîtrise d'œuvre et BET
  const [moeContacts, setMoeContacts] = useState<
    { id: string; name: string; role: string; phone: string; email: string }[]
  >([])

  // État pour les entreprises sélectionnées
  const [selectedCompanies, setSelectedCompanies] = useState<
    { id: string; name: string; role: string; phone: string; email: string }[]
  >([])

  // Initialiser les contacts à partir des données du projet
  useEffect(() => {
    if (projectInfo?.contacts) {
      // Filtrer les contacts par rôle
      const mo = projectInfo.contacts.filter((c) => c.role === "Maîtrise d'ouvrage")
      const moe = projectInfo.contacts.filter((c) => c.role !== "Maîtrise d'ouvrage" && c.role !== "")

      if (mo.length > 0) setMoContacts(mo)
      if (moe.length > 0) setMoeContacts(moe)
    }
  }, [projectInfo])

  // Initialiser les entreprises à partir des données SAO
  useEffect(() => {
    if (appelOffresEntries && appelOffresEntries.length > 0) {
      const companies = appelOffresEntries.map((entry) => ({
        id: `company-${entry.lot}-${entry.raisonSociale}`,
        name: entry.raisonSociale,
        role: `Lot ${entry.lot}`,
        phone: entry.telephone || "",
        email: entry.email || "",
      }))

      setSelectedCompanies(companies)
    }
  }, [appelOffresEntries])

  const handleAddMoContact = () => {
    setMoContacts([
      ...moContacts,
      { id: `mo-${Date.now()}`, name: "", role: "Maîtrise d'ouvrage", phone: "", email: "" },
    ])
  }

  const handleAddMoeContact = () => {
    setMoeContacts([...moeContacts, { id: `moe-${Date.now()}`, name: "", role: "", phone: "", email: "" }])
  }

  const handleRemoveMoContact = (id: string) => {
    setMoContacts(moContacts.filter((contact) => contact.id !== id))
  }

  const handleRemoveMoeContact = (id: string) => {
    setMoeContacts(moeContacts.filter((contact) => contact.id !== id))
  }

  const handleMoContactChange = (id: string, field: string, value: string) => {
    setMoContacts(moContacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)))
  }

  const handleMoeContactChange = (id: string, field: string, value: string) => {
    setMoeContacts(moeContacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)))
  }

  const handleSave = () => {
    // Combiner tous les contacts
    const allContacts = [...moContacts, ...moeContacts]

    // Mettre à jour les informations du projet
    if (projectInfo) {
      const updatedProjectInfo = {
        ...projectInfo,
        contacts: allContacts,
      }
      saveProjectInfo(updatedProjectInfo)
    }

    onClose()
  }

  if (!isOpen) return null

  const renderTabContent = () => {
    switch (activeTab) {
      case "maitrise-ouvrage":
        return (
          <div className="p-2">
            <table className="w-full border-collapse">
              <tbody>
                {moContacts.map((contact, index) => (
                  <tr key={contact.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Nom"
                        value={contact.name}
                        onChange={(e) => handleMoContactChange(contact.id, "name", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        value="Maîtrise d'ouvrage"
                        readOnly
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Téléphone"
                        value={contact.phone}
                        onChange={(e) => handleMoContactChange(contact.id, "phone", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) => handleMoContactChange(contact.id, "email", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 w-8">
                      <button
                        onClick={() => handleRemoveMoContact(contact.id)}
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-red-500"
                        disabled={moContacts.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {moContacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 text-center text-gray-500 text-sm">
                      Aucun contact. Cliquez sur "+" pour ajouter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      case "maitrise-oeuvre":
        return (
          <div className="p-2">
            <table className="w-full border-collapse">
              <tbody>
                {moeContacts.map((contact, index) => (
                  <tr key={contact.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Nom"
                        value={contact.name}
                        onChange={(e) => handleMoeContactChange(contact.id, "name", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Select
                        value={contact.role}
                        onValueChange={(value) => handleMoeContactChange(contact.id, "role", value)}
                      >
                        <SelectTrigger className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2">
                          <SelectValue placeholder="Rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions
                            .filter((role) => role !== "Maîtrise d'ouvrage")
                            .map((role) => (
                              <SelectItem key={role} value={role} className="text-sm">
                                {role}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Téléphone"
                        value={contact.phone}
                        onChange={(e) => handleMoeContactChange(contact.id, "phone", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) => handleMoeContactChange(contact.id, "email", e.target.value)}
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 w-8">
                      <button
                        onClick={() => handleRemoveMoeContact(contact.id)}
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {moeContacts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 text-center text-gray-500 text-sm">
                      Aucun contact. Cliquez sur "+" pour ajouter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      case "entreprises":
        return (
          <div className="p-2">
            <table className="w-full border-collapse">
              <tbody>
                {selectedCompanies.map((company, index) => (
                  <tr key={company.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        value={company.name}
                        readOnly
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        value={company.role}
                        readOnly
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        value={company.phone}
                        readOnly
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 pr-1 w-1/4">
                      <Input
                        value={company.email}
                        readOnly
                        className="h-7 text-sm bg-transparent border-0 focus:ring-0 px-2"
                      />
                    </td>
                    <td className="py-1 w-8"></td>
                  </tr>
                ))}
                {selectedCompanies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 text-center text-gray-500 text-sm">
                      Aucune entreprise trouvée dans la section SAO.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Onglets en haut avec espacement */}
        <div className="flex px-4 pt-2 bg-gray-100 border-b">
          <div className="flex space-x-2 w-full">
            <div className="flex-1"></div> {/* Espace à gauche */}
            <button
              onClick={() => setActiveTab("maitrise-ouvrage")}
              className={`px-4 py-1 rounded-t-md text-sm ${
                activeTab === "maitrise-ouvrage"
                  ? "bg-white border border-gray-300 border-b-0 font-medium"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Maîtrise d'ouvrage
            </button>
            <button
              onClick={() => setActiveTab("maitrise-oeuvre")}
              className={`px-4 py-1 rounded-t-md text-sm ${
                activeTab === "maitrise-oeuvre"
                  ? "bg-white border border-gray-300 border-b-0 font-medium"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Maîtrise d'œuvre et BET
            </button>
            <button
              onClick={() => setActiveTab("entreprises")}
              className={`px-4 py-1 rounded-t-md text-sm ${
                activeTab === "entreprises"
                  ? "bg-white border border-gray-300 border-b-0 font-medium"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Entreprises
            </button>
            <div className="flex-1"></div> {/* Espace à droite */}
          </div>
        </div>

        {/* Barre d'outils minimaliste */}
        <div className="flex items-center px-2 py-1 border-b bg-gray-50">
          <Button
            type="button"
            onClick={
              activeTab === "maitrise-ouvrage"
                ? handleAddMoContact
                : activeTab === "maitrise-oeuvre"
                  ? handleAddMoeContact
                  : undefined
            }
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={activeTab === "entreprises"}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <div className="ml-auto flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-grow overflow-y-auto">{renderTabContent()}</div>
      </div>
    </div>
  )
}
