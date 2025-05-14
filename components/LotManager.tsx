"use client"

import type React from "react"

import { useState } from "react"
import { useLots } from "@/hooks/useLots"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react"
import type { Lot } from "@/services/lot-service"

interface LotManagerProps {
  projectId: string
  versionId: string
}

export default function LotManager({ projectId, versionId }: LotManagerProps) {
  const { lots, isLoading, error, createLot, updateLot, deleteLot } = useLots({
    projectId,
    versionId,
  })

  const [newLot, setNewLot] = useState({
    numero: "",
    name: "",
    description: "",
  })

  const [editingLot, setEditingLot] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Lot>>({})

  // Gérer la création d'un nouveau lot
  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newLot.numero || !newLot.name) return

    try {
      await createLot({
        project_id: projectId,
        version_id: versionId,
        numero: newLot.numero,
        name: newLot.name,
        description: newLot.description,
      })

      // Réinitialiser le formulaire
      setNewLot({
        numero: "",
        name: "",
        description: "",
      })
    } catch (err) {
      console.error("Erreur lors de la création du lot:", err)
    }
  }

  // Commencer l'édition d'un lot
  const handleStartEdit = (lot: Lot) => {
    setEditingLot(lot.id)
    setEditForm({
      numero: lot.numero,
      name: lot.name,
      description: lot.description,
    })
  }

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingLot(null)
    setEditForm({})
  }

  // Sauvegarder les modifications
  const handleSaveEdit = async (lotId: string) => {
    try {
      await updateLot(lotId, editForm)
      setEditingLot(null)
      setEditForm({})
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du lot ${lotId}:`, err)
    }
  }

  // Supprimer un lot
  const handleDeleteLot = async (lotId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lot ?")) {
      try {
        await deleteLot(lotId)
      } catch (err) {
        console.error(`Erreur lors de la suppression du lot ${lotId}:`, err)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        <p>Erreur lors du chargement des lots: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestion des Lots</h2>

      {/* Formulaire de création de lot */}
      <form onSubmit={handleCreateLot} className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">N° Lot</label>
          <Input
            type="text"
            value={newLot.numero}
            onChange={(e) => setNewLot({ ...newLot, numero: e.target.value })}
            placeholder="01"
            required
          />
        </div>
        <div className="col-span-4">
          <label className="block text-sm font-medium mb-1">Nom du lot</label>
          <Input
            type="text"
            value={newLot.name}
            onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
            placeholder="Gros œuvre"
            required
          />
        </div>
        <div className="col-span-5">
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            type="text"
            value={newLot.description}
            onChange={(e) => setNewLot({ ...newLot, description: e.target.value })}
            placeholder="Description du lot"
          />
        </div>
        <div className="col-span-1">
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </form>

      {/* Liste des lots */}
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Lot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lots.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun lot trouvé. Créez votre premier lot !
                </td>
              </tr>
            ) : (
              lots.map((lot) => (
                <tr key={lot.id}>
                  {editingLot === lot.id ? (
                    // Mode édition
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="text"
                          value={editForm.numero || ""}
                          onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleSaveEdit(lot.id)}>
                          <Save className="h-4 w-4 mr-1" />
                          Enregistrer
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      </td>
                    </>
                  ) : (
                    // Mode affichage
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{lot.numero}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{lot.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{lot.description || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleStartEdit(lot)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteLot(lot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
