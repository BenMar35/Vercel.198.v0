"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function UploadFontPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFonts, setUploadedFonts] = useState<{ name: string; url: string }[]>([])
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-font", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de la police")
      }

      const data = await response.json()

      setUploadedFonts([...uploadedFonts, { name: file.name, url: data.url }])

      toast({
        title: "Succès",
        description: "Police téléchargée avec succès",
      })

      setFile(null)
    } catch (error) {
      console.error("Erreur lors du téléchargement de la police:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement de la police",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Télécharger une police</CardTitle>
          <CardDescription>Téléchargez des fichiers de police pour les utiliser dans l'application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="font">Fichier de police</Label>
              <Input id="font" type="file" accept=".woff,.woff2,.ttf,.otf" onChange={handleFileChange} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFile(null)}>
            Annuler
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Téléchargement..." : "Télécharger"}
          </Button>
        </CardFooter>
      </Card>

      {uploadedFonts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Polices téléchargées</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uploadedFonts.map((font, index) => (
                <li key={index} className="flex justify-between items-center p-2 border rounded">
                  <span>{font.name}</span>
                  <a
                    href={font.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Voir
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
