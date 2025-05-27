"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { AllotissementTable } from "./AllotissementTable"
import { AppelOffresTable } from "./AppelOffresTable"
import { ComptabiliteChantierTable } from "./ComptabiliteChantierTable"
import { ConsultationEntreprises } from "./ConsultationEntreprises"
import { LeftSidebar } from "./LeftSidebar"
import { PvrSection } from "./PvrSection"
import { TaskList } from "./TaskList"
import { Button } from "@/components/ui/button"
import { RightSidebar } from "./RightSidebar"
import { ProjectInfoModal, type ProjectInfo } from "./ProjectInfoModal"
import { IntervenantsModal } from "./IntervenantsModal"
import { useProjectInfo } from "@/hooks/useProjectInfo"
import { DetTableSection } from "./DetTableSection"

type TableData = {
  id: string
  position: { x: number; y: number }
  content: React.ReactNode
}

type Lot = {
  id: string
  name: string
  numero: string
}

type MieuxDisantSelection = {
  [lotId: string]: {
    selectedOfferId: string
    offer: string
    company: string
  }
}

type AppelOffresEntry = {
  lot: number
  raisonSociale: string
  adresse: string
  telephone: string
  email: string
  contact: string
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

type InfiniteCanvasProps = {
  tables?: TableData[]
  projectName?: string
  projectId?: string
}

const InfiniteCanvas = ({
  tables = [],
  projectName = "Nom du Projet",
  projectId = "project-1",
}: InfiniteCanvasProps) => {
  const [lots, setLots] = useState<Lot[]>([])
  const [mieuxDisantSelections, setMieuxDisantSelections] = useState<MieuxDisantSelection>({})
  const [appelOffresEntries, setAppelOffresEntries] = useState<AppelOffresEntry[]>([])
  const lotsRef = useRef<Lot[]>([])
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true)
  const [isPanningEnabled, setIsPanningEnabled] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false)
  const [isIntervenantsModalOpen, setIsIntervenantsModalOpen] = useState(false)
  const { projectInfo, saveProjectInfo } = useProjectInfo(projectId)

  // Références pour les inputs de fichiers
  const fileInputRefConsultation = useRef<HTMLInputElement>(null)
  const fileInputRefAllotissement = useRef<HTMLInputElement>(null)

  // Référence pour le wrapper de transformation et le titre du projet
  const transformWrapperRef = useRef<any>(null)
  const projectTitleRef = useRef<HTMLDivElement>(null)

  // Fonction pour centrer la vue sur le titre du projet
  const centerOnProjectTitle = useCallback(() => {
    if (transformWrapperRef.current) {
      const instance = transformWrapperRef.current

      // Coordonnées du centre du titre du projet
      const targetX = 6350
      const targetY = 75

      // Obtenir les dimensions de la fenêtre
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      // Calculer les positions pour centrer la vue
      const scale = 0.5
      const posX = windowWidth / 2 - targetX * scale
      const posY = windowHeight / 2 - targetY * scale

      // Appliquer la transformation
      if (instance.setTransformMatrix) {
        instance.setTransformMatrix({
          positionX: posX,
          positionY: posY,
          scale: scale,
        })
      } else if (instance.setTransform) {
        instance.setTransform(posX, posY, scale)
      }
    }
  }, [])

  // Effet pour initialiser la vue après le premier rendu et centrer sur le titre du projet
  useEffect(() => {
    if (!isInitialized) {
      // Délai plus long pour s'assurer que tout est bien rendu
      const timer = setTimeout(() => {
        setIsInitialized(true)
        centerOnProjectTitle()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, centerOnProjectTitle])

  // Utiliser useCallback pour éviter de recréer la fonction à chaque rendu
  const handleLotsChange = useCallback((newLots: Lot[]) => {
    // Vérifier si les lots ont réellement changé pour éviter les mises à jour inutiles
    if (JSON.stringify(lotsRef.current) !== JSON.stringify(newLots)) {
      setLots(newLots)
      lotsRef.current = newLots
    }
  }, [])

  // Gérer les sélections mieux disant
  const handleMieuxDisantChange = useCallback(
    (lotId: string, selectedOfferId: string, offer: string, company: string) => {
      setMieuxDisantSelections((prev) => ({
        ...prev,
        [lotId]: { selectedOfferId, offer, company },
      }))
    },
    [],
  )

  // Fonction pour transférer une entreprise vers la table appel d'offres
  const handleTransferToAppelOffres = useCallback((lot: number, entreprise: CsvData) => {
    setAppelOffresEntries((prev) => {
      // Vérifier si cette entreprise est déjà dans la table pour ce lot
      const existingEntryIndex = prev.findIndex(
        (entry) => entry.lot === lot && entry.raisonSociale === entreprise.raisonSociale,
      )

      if (existingEntryIndex >= 0) {
        // Si l'entrée existe déjà, la supprimer
        const newEntries = [...prev]
        newEntries.splice(existingEntryIndex, 1)
        return newEntries
      } else {
        // Sinon, ajouter une nouvelle entrée
        return [
          ...prev,
          {
            lot,
            raisonSociale: entreprise.raisonSociale,
            adresse: `${entreprise.adresse}, ${entreprise.codePostal} ${entreprise.ville}`,
            telephone: entreprise.telephone,
            email: entreprise.email,
            contact: entreprise.contact,
          },
        ]
      }
    })
  }, [])

  // Fonction pour rendre les lignes verticales dans l'espace principal
  const renderVerticalLines = () => {
    const lines = []
    const totalWidth = 12000
    const lineInterval = 2000
    const topMargin = 50
    const bottomMargin = 50
    const height = 1500 - topMargin - bottomMargin

    for (let x = lineInterval; x < totalWidth; x += lineInterval) {
      // Ajuster la position des lignes à 8000px et 10000px
      let position = x
      if (x === 8000) position = 8700
      if (x === 10000) position = 10700

      lines.push(
        <div
          key={`line-${x}`}
          style={{
            position: "absolute",
            left: `${position}px`,
            top: `${topMargin}px`,
            width: "1px",
            height: `${height}px`,
            backgroundColor: "rgb(150, 150, 150)",
          }}
        />,
      )
    }

    return lines
  }

  // Fonction pour rendre les lignes verticales dans les sections d'en-tête
  const renderVerticalLinesForSection = (height: number) => {
    const lines = []
    const positions = [2000, 4000, 6000, 8700, 10700]
    const topMargin = 50
    const bottomMargin = 50
    const lineHeight = height - topMargin - bottomMargin

    // Ajouter les lignes verticales
    positions.forEach((position, index) => {
      lines.push(
        <div
          key={`section-line-${index}`}
          style={{
            position: "absolute",
            left: `${position}px`,
            top: `${topMargin}px`,
            width: "1px",
            height: `${lineHeight}px`,
            backgroundColor: "rgb(150, 150, 150)",
          }}
        />,
      )
    })

    return lines
  }
  // Fonction pour rendre le bandeau des titres
  const renderTitleSection = () => {
    const titles = ["ESQ", "DCE", "SAO", "CGC", "DET", "AOR"]
    const sectionWidths = [
      { start: 0, end: 2000 },
      { start: 2000, end: 4000 },
      { start: 4000, end: 6000 },
      { start: 6000, end: 8700 },
      { start: 8700, end: 10700 },
      { start: 10700, end: 12700 },
    ]

    const elements = [...renderVerticalLinesForSection(125)]

    // Ajouter les titres
    titles.forEach((title, index) => {
      const section = sectionWidths[index]
      const center = (section.start + section.end) / 2

      elements.push(
        <div
          key={`title-${index}`}
          style={{
            position: "absolute",
            left: `${center - 75}px`, // Centrer approximativement
            top: "30px",
            width: "150px",
            textAlign: "center",
          }}
        >
          <h2 className="text-[65px] font-bold text-black">{title}</h2>
        </div>,
      )
    })

    return elements
  }

  // Fonction pour désactiver temporairement le panning lors de l'interaction avec les inputs
  const handleInteractionStart = () => {
    setIsPanningEnabled(false)
  }

  const handleInteractionEnd = () => {
    setIsPanningEnabled(true)
  }

  // Fonction pour gérer l'upload du fichier CSV des entreprises
  const handleConsultationFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Transmettre l'événement au composant ConsultationEntreprises
    if (event.target.files && event.target.files.length > 0) {
      console.log("Fichier d'entreprises sélectionné:", event.target.files[0].name)
    }
  }

  // Fonction pour gérer l'upload du fichier CSV des lots
  const handleAllotissementFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Transmettre l'événement au composant AllotissementTable
    if (event.target.files && event.target.files.length > 0) {
      console.log("Fichier de lots sélectionné:", event.target.files[0].name)
    }
  }

  const handleOpenProjectInfo = () => {
    setIsProjectInfoModalOpen(true)
  }

  const handleCloseProjectInfo = () => {
    setIsProjectInfoModalOpen(false)
  }

  const handleOpenIntervenants = () => {
    setIsIntervenantsModalOpen(true)
  }

  const handleCloseIntervenants = () => {
    setIsIntervenantsModalOpen(false)
  }

  const handleSaveProjectInfo = (info: ProjectInfo) => {
    saveProjectInfo(info)
    setIsProjectInfoModalOpen(false)
  }

  // Déterminer le nom du projet à afficher
  const displayProjectName = projectInfo?.projectName || projectName || "Nom du Projet"

  return (
    <div className="w-full h-full overflow-hidden bg-gray-100 relative">
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={0.5}
        minScale={0.1}
        maxScale={5}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        panning={{ disabled: !isPanningEnabled, velocityDisabled: false }}
        disablePadding={true}
        centerOnInit={false} // Désactivé car nous allons centrer manuellement
        centerZoomedOut={false}
        doubleClick={{ disabled: true }}
        initialPositionX={0}
        initialPositionY={0}
        velocityAnimation={{
          disabled: false,
          sensitivity: 1,
          animationTime: 300,
          animationType: "easeOut",
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Contrôles optionnels */}
            <div className="fixed bottom-4 right-[calc(10%+10px)] bg-white bg-opacity-70 p-2 rounded shadow-md z-50 flex gap-2">
              <Button
                onClick={() => zoomIn()}
                className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded"
              >
                +
              </Button>
              <Button
                onClick={() => zoomOut()}
                className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded"
              >
                -
              </Button>
              <Button
                onClick={() => {
                  resetTransform()
                  // Après reset, centrer sur le titre du projet
                  setTimeout(() => {
                    centerOnProjectTitle()
                  }, 500)
                }}
                className="bg-custom-gold hover:bg-yellow-600 text-black font-bold py-1 px-3 rounded"
              >
                Reset
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{
                width: "12700px", // Largeur totale du contenu
                height: "2000px", // Hauteur totale du contenu
              }}
            >
              <div className="relative">
                {/* Nouvel espace pour le nom du projet */}
                <div
                  className="relative bg-white"
                  style={{
                    width: "12700px",
                    height: "150px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    ref={projectTitleRef}
                    style={{
                      position: "absolute",
                      left: "0",
                      right: "0",
                      top: "0",
                      bottom: "0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    data-center-x="6350"
                    data-center-y="75"
                  >
                    <h1 className="text-[80px] font-bold text-black">{displayProjectName}</h1>
                  </div>
                </div>

                {/* Espace pour les titres (ESQ, DCE, etc.) */}
                <div
                  className="relative bg-white"
                  style={{
                    width: "12700px",
                    height: "125px",
                    marginBottom: "10px",
                  }}
                >
                  {renderTitleSection()}
                </div>

                {/* Espace principal */}
                <div
                  className="relative bg-white"
                  style={{
                    width: "12700px",
                    height: "1500px",
                  }}
                >
                  {/* Lignes verticales */}
                  {renderVerticalLines()}

                  {/* Table d'allotissement - déplacée de 2000px */}
                  <div
                    style={{
                      position: "absolute",
                      left: 2100,
                      top: 100,
                    }}
                    className="shadow-xl table-container"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <AllotissementTable onLotsChange={handleLotsChange} fileInputRef={fileInputRefAllotissement} />
                  </div>

                  {/* Table d'appel d'offres - déplacée de 2000px */}
                  <div
                    style={{
                      position: "absolute",
                      left: 4100,
                      top: 100,
                      width: "1800px",
                    }}
                    className="shadow-xl table-container"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <div className="bg-white p-4">
                      <h2 className="text-2xl font-bold">Appel d'offres</h2>
                    </div>
                    <AppelOffresTable
                      lots={lots}
                      entries={appelOffresEntries}
                      onMieuxDisantChange={handleMieuxDisantChange}
                    />
                  </div>

                  {/* Table de comptabilité chantier - déplacée de 2000px */}
                  <div
                    style={{
                      position: "absolute",
                      left: 6100,
                      top: 100,
                      width: "2500px",
                    }}
                    className="shadow-xl table-container"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <ComptabiliteChantierTable lots={lots} mieuxDisantSelections={mieuxDisantSelections} />
                  </div>

                  {/* Section DET - Nouvelle version avec tableau simple */}
                  <div
                    style={{
                      position: "absolute",
                      left: 8800,
                      top: 100,
                      width: "1800px", // Même largeur que l'espace SAO
                    }}
                    className="shadow-xl"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <DetTableSection projectId={projectId} lots={lots} />
                  </div>

                  {/* PV de réception - après la dernière ligne verticale (10700px) */}
                  <div
                    style={{
                      position: "absolute",
                      left: 10800,
                      top: 100,
                      width: "900px",
                    }}
                    className="shadow-xl"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <PvrSection title="PV de réception" lots={lots} position="left" />
                  </div>

                  {/* Levée des réserves - à droite du PV de réception */}
                  <div
                    style={{
                      position: "absolute",
                      left: 11750,
                      top: 100,
                      width: "900px",
                    }}
                    className="shadow-xl"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <PvrSection title="Levée des réserves" lots={lots} position="right" />
                  </div>

                  {/* Tables additionnelles */}
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      style={{
                        position: "absolute",
                        left: table.position.x,
                        top: table.position.y,
                      }}
                      className="shadow-xl table-container"
                      onMouseDown={handleInteractionStart}
                      onMouseUp={handleInteractionEnd}
                      onTouchStart={handleInteractionStart}
                      onTouchEnd={handleInteractionEnd}
                    >
                      <div className="bg-white rounded-lg p-4">{table.content}</div>
                    </div>
                  ))}

                  {/* Liste de tâches - placée à droite du suivi de chantier */}
                  <div
                    style={{
                      position: "absolute",
                      left: 9800, // Après le suivi de chantier (8800 + espace)
                      top: 100,
                      width: "850px", // Largeur ajustée pour ne pas dépasser la ligne de fin de zone (10700)
                    }}
                    className="shadow-xl table-container hidden" // Caché pour le moment car remplacé par la section DET
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <TaskList lots={lots} title="Liste de tâches du projet" />
                  </div>
                </div>

                {/* Table de consultation entreprises - placée sous l'espace principal */}
                <div
                  style={{
                    position: "absolute",
                    left: 4100,
                    top: 1525, // 1500px (hauteur de l'espace principal) + 25px d'espace
                    width: "1800px",
                  }}
                  className="shadow-xl table-container"
                  onMouseDown={handleInteractionStart}
                  onMouseUp={handleInteractionEnd}
                  onTouchStart={handleInteractionStart}
                  onTouchEnd={handleInteractionEnd}
                >
                  <div className="bg-white p-4">
                    <h2 className="text-2xl font-bold">Consultation Entreprises</h2>
                  </div>
                  <ConsultationEntreprises
                    lots={lots}
                    onTransferToAppelOffres={handleTransferToAppelOffres}
                    fileInputRef={fileInputRefConsultation}
                  />
                </div>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Ruban à gauche - fixe par rapport à la fenêtre */}
      <LeftSidebar
        isExpanded={isLeftSidebarExpanded}
        onToggleExpand={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
      />

      {/* Remplacer le div du ruban à droite par le composant RightSidebar */}
      <RightSidebar
        onOpenProjectInfo={handleOpenProjectInfo}
        onOpenIntervenants={handleOpenIntervenants}
        fileInputRefLots={fileInputRefAllotissement}
        fileInputRefEntreprises={fileInputRefConsultation}
        onLotsFileChange={handleAllotissementFileUpload}
        onEntreprisesFileChange={handleConsultationFileUpload}
      />

      {/* Fenêtre modale pour les informations du projet */}
      {projectInfo && (
        <ProjectInfoModal
          isOpen={isProjectInfoModalOpen}
          onClose={handleCloseProjectInfo}
          projectId={projectInfo.projectId}
          initialData={projectInfo}
          onSave={handleSaveProjectInfo}
        />
      )}

      {/* Fenêtre modale pour les intervenants */}
      <IntervenantsModal
        isOpen={isIntervenantsModalOpen}
        onClose={handleCloseIntervenants}
        projectId={projectId}
        appelOffresEntries={appelOffresEntries}
      />
    </div>
  )
}

export { InfiniteCanvas }
