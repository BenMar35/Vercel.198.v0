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
  const { projectInfo, setProjectInfo } = useProjectInfo(projectId)
  const fileInputRefConsultation = useRef<HTMLInputElement>(null)
  const fileInputRefAllotissement = useRef<HTMLInputElement>(null)
  const transformWrapperRef = useRef<any>(null)
  const projectTitleRef = useRef<HTMLDivElement>(null)

  const centerOnProjectTitle = useCallback(() => {
    if (transformWrapperRef.current) {
      const instance = transformWrapperRef.current
      const targetX = 6350
      const targetY = 75
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const scale = 0.5
      const posX = windowWidth / 2 - targetX * scale
      const posY = windowHeight / 2 - targetY * scale

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

  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        setIsInitialized(true)
        centerOnProjectTitle()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, centerOnProjectTitle])

  const handleLotsChange = useCallback((newLots: Lot[]) => {
    if (JSON.stringify(lotsRef.current) !== JSON.stringify(newLots)) {
      setLots(newLots)
      lotsRef.current = newLots
    }
  }, [])

  const handleMieuxDisantChange = useCallback(
    (lotId: string, selectedOfferId: string, offer: string, company: string) => {
      console.log("Mieux disant sélectionné:", { lotId, selectedOfferId, offer, company })
      setMieuxDisantSelections((prev) => ({
        ...prev,
        [lotId]: { selectedOfferId, offer, company },
      }))
    },
    [],
  )

  const handleTransferToAppelOffres = useCallback((lot: number, entreprise: CsvData) => {
    setAppelOffresEntries((prev) => {
      const existingEntryIndex = prev.findIndex(
        (entry) => entry.lot === lot && entry.raisonSociale === entreprise.raisonSociale,
      )

      if (existingEntryIndex >= 0) {
        const newEntries = [...prev]
        newEntries.splice(existingEntryIndex, 1)
        return newEntries
      } else {
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

  const renderVerticalLines = () => {
    const lines = []
    const totalWidth = 12000
    const lineInterval = 2000
    const topMargin = 50
    const bottomMargin = 50
    const height = 1500 - topMargin - bottomMargin

    for (let x = lineInterval; x < totalWidth; x += lineInterval) {
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

  const renderVerticalLinesForSection = (height: number) => {
    const lines = []
    const positions = [2000, 4000, 6000, 8700, 10700]
    const topMargin = 50
    const bottomMargin = 50
    const lineHeight = height - topMargin - bottomMargin

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

    titles.forEach((title, index) => {
      const section = sectionWidths[index]
      const center = (section.start + section.end) / 2

      elements.push(
        <div
          key={`title-${index}`}
          style={{
            position: "absolute",
            left: `${center - 75}px`,
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

  const handleInteractionStart = () => {
    setIsPanningEnabled(false)
  }

  const handleInteractionEnd = () => {
    setIsPanningEnabled(true)
  }

  const handleConsultationFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log("Fichier d'entreprises sélectionné:", event.target.files[0].name)
    }
  }

  const handleAllotissementFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setProjectInfo(info)
    setIsProjectInfoModalOpen(false)
  }

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
        centerOnInit={false}
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
                width: "12700px",
                height: "2000px",
              }}
            >
              <div className="relative">
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

                <div
                  className="relative bg-white"
                  style={{
                    width: "12700px",
                    height: "1500px",
                  }}
                >
                  {renderVerticalLines()}

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
                      projectId={projectId}
                    />
                  </div>

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
                    <ComptabiliteChantierTable
                      lots={lots}
                      mieuxDisantSelections={mieuxDisantSelections}
                      projectId={projectId}
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      left: 8800,
                      top: 100,
                      width: "1800px",
                    }}
                    className="shadow-xl"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <DetTableSection projectId={projectId} lots={lots} />
                  </div>

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

                  <div
                    style={{
                      position: "absolute",
                      left: 9800,
                      top: 100,
                      width: "850px",
                    }}
                    className="shadow-xl table-container hidden"
                    onMouseDown={handleInteractionStart}
                    onMouseUp={handleInteractionEnd}
                    onTouchStart={handleInteractionStart}
                    onTouchEnd={handleInteractionEnd}
                  >
                    <TaskList lots={lots} title="Liste de tâches du projet" />
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: 4100,
                    top: 1525,
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

      <LeftSidebar
        isExpanded={isLeftSidebarExpanded}
        onToggleExpand={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
      />

      <RightSidebar
        onOpenProjectInfo={handleOpenProjectInfo}
        onOpenIntervenants={handleOpenIntervenants}
        fileInputRefLots={fileInputRefAllotissement}
        fileInputRefEntreprises={fileInputRefConsultation}
        onLotsFileChange={handleAllotissementFileUpload}
        onEntreprisesFileChange={handleConsultationFileUpload}
      />

      {projectInfo && (
        <ProjectInfoModal
          isOpen={isProjectInfoModalOpen}
          onClose={handleCloseProjectInfo}
          projectId={projectInfo.projectId}
          initialData={projectInfo}
          onSave={handleSaveProjectInfo}
        />
      )}

      <IntervenantsModal isOpen={isIntervenantsModalOpen} onClose={handleCloseIntervenants} projectId={projectId} />
    </div>
  )
}

export { InfiniteCanvas }
