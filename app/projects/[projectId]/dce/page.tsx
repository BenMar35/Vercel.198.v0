"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProjectSidebar from "@/components/ProjectSidebar"
import { Button } from "@/components/ui/button"
import { PageTitle } from "@/components/PageTitle"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Papa from "papaparse"

type UploadedFile = {
  id: string
  name: string
  type: string
  url: string
}

type Lot = {
  id: string
  nom: string
}

type Allotissement = {
  id: string
  numero: string
  lotId: string
}

export default function DCEPage() {
  const params = useParams()
  const router = useRouter()
  const { projectId } = params
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [files, setFiles] = useLocalStorage<UploadedFile[]>(`dce-files-${projectId}`, [])
  const [lots, setLots] = useLocalStorage<Lot[]>(`lots-${projectId}`, [])
  const [allotissement, setAllotissement] = useLocalStorage<Allotissement[]>(`allotissement-${projectId}`, [])
  const [project, setProject] = useState<Project | null>(null)
  const [showLotsDialog, setShowLotsDialog] = useState(false)

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)
    }
  }, [projectId, projects])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file) => ({
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }))
      setFiles([...files, ...newFiles])
    }
  }

  const handleAddAllotissement = () => {
    setAllotissement([...allotissement, { id: Date.now().toString(), numero: "", lotId: "" }])
  }

  const handleAllotissementChange = (id: string, field: "numero" | "lotId", value: string) => {
    setAllotissement(allotissement.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  const handleLotsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newLots = results.data
            .slice(1)
            .map((row: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              nom: row[0] || "",
            }))
            .filter((lot) => lot.nom) // Filtrer les lots vides
          setLots(newLots)
          setShowLotsDialog(true)

          // Mise à jour de l'allotissement avec les nouveaux lots
          setAllotissement((prevAllotissement) =>
            prevAllotissement.map((item) => ({
              ...item,
              lotId: newLots[Number.parseInt(item.numero) - 1]?.id || item.lotId,
            })),
          )
        },
        header: false,
      })
    }
  }

  if (!project) {
    return <div>Projet non trouvé</div>
  }

  return (
    <div className="flex h-screen bg-[#F6F5EB]">
      <ProjectSidebar />
      <main className="flex-1 p-8 flex flex-col">
        <PageTitle projectReference={project.reference} projectName={project.name} pageTitle="DCE" />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-custom-black">Fichiers DCE</h2>
            <div className="mb-6">
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
                multiple
                className="font-caviar bg-white"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="w-full aspect-square bg-white">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.name}
                        className="max-w-full max-h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="font-bold mb-2">{file.name}</p>
                        <p>{file.type.split("/")[1].toUpperCase()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="w-full h-[1px] bg-custom-black my-4"></div>
          <div className="flex-1 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-custom-black">Section 2</h2>
            <p>Contenu de la section 2</p>
          </div>
          <div className="w-full h-[1px] bg-custom-black my-4"></div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-custom-black">Allotissement</h2>
              <div className="space-x-2">
                <Input
                  type="file"
                  onChange={handleLotsFileUpload}
                  accept=".csv"
                  className="hidden"
                  id="lots-file-upload"
                />
                <label
                  htmlFor="lots-file-upload"
                  className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded cursor-pointer"
                >
                  Charger CSV
                </label>
                <Button
                  onClick={() => router.push(`/projects/${projectId}/liste-des-lots`)}
                  className="bg-custom-gold hover:bg-yellow-600 text-black font-bold"
                >
                  Voir la liste
                </Button>
              </div>
            </div>
            <Table className="bg-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px] p-1">N°</TableHead>
                  <TableHead className="p-1">Lot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allotissement.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-1">
                      <Select
                        value={item.numero}
                        onValueChange={(value) => handleAllotissementChange(item.id, "numero", value)}
                      >
                        <SelectTrigger className="w-[70px]">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 99 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1">
                      <Select
                        value={item.lotId}
                        onValueChange={(value) => handleAllotissementChange(item.id, "lotId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un lot" />
                        </SelectTrigger>
                        <SelectContent>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleAddAllotissement} className="mt-4 bg-custom-gold hover:bg-yellow-600 text-black">
              Ajouter un allotissement
            </Button>
          </div>
        </div>
      </main>
      <Dialog open={showLotsDialog} onOpenChange={setShowLotsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liste des lots chargée</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du lot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell>{lot.nom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}
