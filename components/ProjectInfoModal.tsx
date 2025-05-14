"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProjectInfoModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  initialData?: ProjectInfo
  onSave: (data: ProjectInfo) => void
}

export interface ProjectInfo {
  projectId: string
  affaireNumber: string
  projectName: string
  maitriseOuvrage: string
  references: { id: string; value: string }[]
  contacts: { id: string; name: string; role: string; phone: string; email: string }[]
  address: {
    street: string
    postalCode: string
    city: string
  }
}

export function ProjectInfoModal({ isOpen, onClose, projectId, initialData, onSave }: ProjectInfoModalProps) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectId,
    affaireNumber: "",
    projectName: "",
    maitriseOuvrage: "",
    references: [{ id: "ref-1", value: "" }],
    contacts: [{ id: "contact-1", name: "", role: "", phone: "", email: "" }],
    address: {
      street: "",
      postalCode: "",
      city: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      setProjectInfo(initialData)
    }
  }, [initialData])

  const handleAddReference = () => {
    setProjectInfo((prev) => ({
      ...prev,
      references: [...prev.references, { id: `ref-${Date.now()}`, value: "" }],
    }))
  }

  const handleRemoveReference = (id: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      references: prev.references.filter((ref) => ref.id !== id),
    }))
  }

  const handleReferenceChange = (id: string, value: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      references: prev.references.map((ref) => (ref.id === id ? { ...ref, value } : ref)),
    }))
  }

  const handleAddContact = () => {
    setProjectInfo((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { id: `contact-${Date.now()}`, name: "", role: "", phone: "", email: "" }],
    }))
  }

  const handleRemoveContact = (id: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((contact) => contact.id !== id),
    }))
  }

  const handleContactChange = (id: string, field: keyof (typeof projectInfo.contacts)[0], value: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)),
    }))
  }

  const handleAddressChange = (field: keyof typeof projectInfo.address, value: string) => {
    setProjectInfo((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const handleSave = () => {
    onSave(projectInfo)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Informations du projet</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="affaireNumber">Numéro d'affaire</Label>
              <Input
                id="affaireNumber"
                value={projectInfo.affaireNumber}
                onChange={(e) => setProjectInfo((prev) => ({ ...prev, affaireNumber: e.target.value }))}
                className="bg-[#F6F5EB]"
              />
            </div>
            <div>
              <Label htmlFor="projectName">Nom du projet</Label>
              <Input
                id="projectName"
                value={projectInfo.projectName}
                onChange={(e) => setProjectInfo((prev) => ({ ...prev, projectName: e.target.value }))}
                className="bg-[#F6F5EB]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maitriseOuvrage">Maîtrise d'ouvrage</Label>
            <Input
              id="maitriseOuvrage"
              value={projectInfo.maitriseOuvrage}
              onChange={(e) => setProjectInfo((prev) => ({ ...prev, maitriseOuvrage: e.target.value }))}
              className="bg-[#F6F5EB]"
            />
          </div>

          {/* Références maîtrise d'ouvrages */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Références maîtrise d'ouvrages</Label>
              <Button
                type="button"
                onClick={handleAddReference}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="space-y-2">
              {projectInfo.references.map((ref) => (
                <div key={ref.id} className="flex gap-2">
                  <Input
                    value={ref.value}
                    onChange={(e) => handleReferenceChange(ref.id, e.target.value)}
                    placeholder="Référence"
                    className="bg-[#F6F5EB]"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveReference(ref.id)}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={projectInfo.references.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Personnes référentes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Personnes référentes</Label>
              <Button
                type="button"
                onClick={handleAddContact}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="space-y-4">
              {projectInfo.contacts.map((contact) => (
                <div key={contact.id} className="p-3 border rounded-md bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Contact</h4>
                    <Button
                      type="button"
                      onClick={() => handleRemoveContact(contact.id)}
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      disabled={projectInfo.contacts.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`contact-name-${contact.id}`}>Nom</Label>
                      <Input
                        id={`contact-name-${contact.id}`}
                        value={contact.name}
                        onChange={(e) => handleContactChange(contact.id, "name", e.target.value)}
                        className="bg-[#F6F5EB]"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-role-${contact.id}`}>Fonction</Label>
                      <Input
                        id={`contact-role-${contact.id}`}
                        value={contact.role}
                        onChange={(e) => handleContactChange(contact.id, "role", e.target.value)}
                        className="bg-[#F6F5EB]"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-phone-${contact.id}`}>Téléphone</Label>
                      <Input
                        id={`contact-phone-${contact.id}`}
                        value={contact.phone}
                        onChange={(e) => handleContactChange(contact.id, "phone", e.target.value)}
                        className="bg-[#F6F5EB]"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-email-${contact.id}`}>Email</Label>
                      <Input
                        id={`contact-email-${contact.id}`}
                        value={contact.email}
                        onChange={(e) => handleContactChange(contact.id, "email", e.target.value)}
                        className="bg-[#F6F5EB]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adresse du projet */}
          <div>
            <h3 className="text-lg font-medium mb-2">Adresse du projet</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="address-street">Adresse</Label>
                <Input
                  id="address-street"
                  value={projectInfo.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className="bg-[#F6F5EB]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="address-postalCode">Code postal</Label>
                  <Input
                    id="address-postalCode"
                    value={projectInfo.address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                    className="bg-[#F6F5EB]"
                  />
                </div>
                <div>
                  <Label htmlFor="address-city">Ville</Label>
                  <Input
                    id="address-city"
                    value={projectInfo.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="bg-[#F6F5EB]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </div>
    </div>
  )
}
