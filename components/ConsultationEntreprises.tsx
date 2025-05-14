"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Info, Plus, Database, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Papa from "papaparse"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCompanies } from "@/hooks/useCompanies"

type Lot = {
  id: string
  name: string
  numero: string
}

type CsvData = {
  raisonSociale: string
  adresse: string
  codePostal: string
  ville: string
  telephone: string
  portable: string
  email: string
  contact: string
  [key: string]: string
}

interface ConsultationEntreprisesProps {
  lots?: Lot[]
  onTransferToAppelOffres?: (lot: number, entreprise: CsvData) => void
  fileInputRef?: React.RefObject<HTMLInputElement>
  projectId: string
}

export function ConsultationEntreprises({
  lots = [],
  onTransferToAppelOffres,
  fileInputRef,
  projectId,
}: ConsultationEntreprisesProps) {
  const { companies, isLoading, addCompany } = useCompanies()
  const [selectedLots, setSelectedLots] = useState<Record<string, Set<number>>>({})
  const internalFileInputRef = useRef<HTMLInputElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntreprise, setNewEntreprise] = useState({
    raisonSociale: "",
    adresse: "",
    codePostal: "",
    ville: "",
    telephoneSociete: "",
    emailSociete: "",
    contact: "",
    portable: "",
    email: "",
  })

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

  // Fonction pour gérer le téléchargement de fichier CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Fichier sélectionné:", file.name)

      Papa.parse(file, {
        complete: async (results) => {
          console.log("Résultats du parsing:", results)

          // Vérifier si nous avons des données
          if (results.data && results.data.length > 0) {
            // Obtenir les en-têtes (première ligne)
            const headers = results.data[0] as string[]
            console.log("En-têtes détectés:", headers)

            // Mapper les données à partir de la deuxième ligne
            const companies = results.data
              .slice(1)
              .filter((row: any) => row.length > 1 && row[0]) // Filtrer les lignes vides
              .map((row: any) => ({
                raisonSociale: row[0] || "",
                adresse: row[1] || "",
                codePostal: row[2] || "",
                ville: row[3] || "",
                telephoneSociete: row[4] || "",
                emailSociete: row[5] || "",
                contact: row[6] || "",
                portable: row[7] || "",
                email: row[5] || "", // Utiliser l'email de l'entreprise par défaut
              }))

            // Ajouter toutes les entreprises en une seule fois
            for (const company of companies) {
              try {
                await addCompany(company)
              } catch (err) {
                console.error("Erreur lors de l'ajout de l'entreprise:", err)
              }
            }
          } else {
            console.error("Aucune donnée trouvée dans le fichier CSV")
          }
        },
        error: (error) => {
          console.error("Erreur lors du parsing CSV:", error)
        },
        header: false, // Ne pas utiliser la première ligne comme en-têtes
        skipEmptyLines: true,
      })
    }
  }

  // Fonction pour ajouter une nouvelle entreprise
  const handleAddEntreprise = async () => {
    // Vérifier que les champs obligatoires sont remplis
    if (!newEntreprise.raisonSociale) {
      alert("La raison sociale est obligatoire")
      return
    }

    try {
      await addCompany(newEntreprise)

      // Réinitialiser le formulaire
      setNewEntreprise({
        raisonSociale: "",
        adresse: "",
        codePostal: "",
        ville: "",
        telephoneSociete: "",
        emailSociete: "",
        contact: "",
        portable: "",
        email: "",
      })

      // Fermer la boîte de dialogue
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entreprise:", error)
      alert("Erreur lors de l'ajout de l'entreprise")
    }
  }

  const handleLotClick = (entrepriseIndex: number, lotNumber: number) => {
    const entrepriseId = `${entrepriseIndex}`
    const entreprise = companies[entrepriseIndex]

    if (!entreprise) return

    // Mettre à jour l'état des lots sélectionnés
    setSelectedLots((prev) => {
      const newSelectedLots = { ...prev }
      if (!newSelectedLots[entrepriseId]) {
        newSelectedLots[entrepriseId] = new Set()
      }

      const lotSet = newSelectedLots[entrepriseId]
      if (lotSet.has(lotNumber)) {
        lotSet.delete(lotNumber)
      } else {
        lotSet.add(lotNumber)
      }

      return newSelectedLots
    })

    // Transférer les données vers la table appel d'offres
    if (entreprise && onTransferToAppelOffres) {
      const csvData: CsvData = {
        raisonSociale: entreprise.raisonSociale,
        adresse: entreprise.adresse || "",
        codePostal: entreprise.codePostal || "",
        ville: entreprise.ville || "",
        telephone: entreprise.telephoneSociete || "",
        portable: entreprise.portable || "",
        email: entreprise.email || "",
        contact: entreprise.contact || "",
      }
      onTransferToAppelOffres(lotNumber, csvData)
    }
  }

  const isLotSelected = (entrepriseIndex: number, lotNumber: number) => {
    const entrepriseId = `${entrepriseIndex}`
    return selectedLots[entrepriseId]?.has(lotNumber) || false
  }

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-custom-gold" />
        <span className="ml-2">Chargement des entreprises...</span>
      </div>
    )
  }

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-lg text-rendering-optimized relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Notification de mode local */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Database className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Mode local activé - Les données sont stockées uniquement dans votre navigateur.
        </AlertDescription>
      </Alert>

      {/* Bouton d'ajout d'entreprise qui apparaît au survol */}
      {isHovering && (
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-custom-gold hover:bg-yellow-500 text-black">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une entreprise
          </Button>
        </div>
      )}

      {/* Masquer le bouton d'upload puisqu'il est maintenant dans le bandeau de droite */}
      <input ref={internalFileInputRef} type="file" onChange={handleFileUpload} accept=".csv" className="hidden" />

      <Table className="border-collapse">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] bg-[#F6F5EB] text-center text-lg">Lot</TableHead>
            <TableHead className="bg-[#F6F5EB] text-center text-lg">Entreprise</TableHead>
            <TableHead className="bg-[#F6F5EB] text-center text-lg">Adresse</TableHead>
            <TableHead className="bg-[#F6F5EB] text-center text-lg">Téléphone</TableHead>
            <TableHead className="bg-[#F6F5EB] text-center text-lg">Email</TableHead>
            <TableHead className="bg-[#F6F5EB] text-center text-lg">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length > 0 ? (
            companies.map((entreprise, index) => (
              <TableRow key={entreprise.id}>
                <TableCell className="bg-[#F6F5EB]">
                  <div className="flex flex-wrap gap-1">
                    {lots.map((lot) => (
                      <Button
                        key={lot.id}
                        size="sm"
                        variant={isLotSelected(index, Number.parseInt(lot.numero)) ? "default" : "outline"}
                        className={`h-6 px-2 text-xs ${isLotSelected(index, Number.parseInt(lot.numero)) ? "bg-custom-gold text-black" : ""}`}
                        onClick={() => handleLotClick(index, Number.parseInt(lot.numero))}
                      >
                        {lot.numero}
                      </Button>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">{entreprise.raisonSociale}</TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">{`${entreprise.adresse}, ${entreprise.codePostal} ${entreprise.ville}`}</TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">{entreprise.telephoneSociete}</TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">
                  {entreprise.email || entreprise.emailSociete}
                </TableCell>
                <TableCell className="bg-[#F6F5EB] text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center cursor-pointer">
                          {entreprise.contact}
                          <Info className="h-4 w-4 ml-1 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="p-2 w-64">
                        <div className="space-y-1">
                          <p>
                            <strong>Contact:</strong> {entreprise.contact}
                          </p>
                          <p>
                            <strong>Portable:</strong> {entreprise.portable}
                          </p>
                          <p>
                            <strong>Email:</strong> {entreprise.email}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Aucune entreprise. Importez un fichier CSV pour commencer ou ajoutez une entreprise manuellement.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Boîte de dialogue pour ajouter une entreprise */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle entreprise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="raisonSociale" className="text-right">
                  Raison sociale *
                </Label>
                <Input
                  id="raisonSociale"
                  value={newEntreprise.raisonSociale}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, raisonSociale: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adresse" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  value={newEntreprise.adresse}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, adresse: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="codePostal" className="text-right">
                  Code postal
                </Label>
                <Input
                  id="codePostal"
                  value={newEntreprise.codePostal}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, codePostal: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ville" className="text-right">
                  Ville
                </Label>
                <Input
                  id="ville"
                  value={newEntreprise.ville}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, ville: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telephoneSociete" className="text-right">
                  Téléphone
                </Label>
                <Input
                  id="telephoneSociete"
                  value={newEntreprise.telephoneSociete}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, telephoneSociete: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emailSociete" className="text-right">
                  Email société
                </Label>
                <Input
                  id="emailSociete"
                  type="email"
                  value={newEntreprise.emailSociete}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, emailSociete: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contact"
                  value={newEntreprise.contact}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, contact: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="portable" className="text-right">
                  Portable
                </Label>
                <Input
                  id="portable"
                  value={newEntreprise.portable}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, portable: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-right">
                  Email contact
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newEntreprise.email}
                  onChange={(e) => setNewEntreprise({ ...newEntreprise, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddEntreprise} className="bg-custom-gold hover:bg-yellow-500 text-black">
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
