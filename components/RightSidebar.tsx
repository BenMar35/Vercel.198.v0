"use client"

import type React from "react"
import { FileText, Building, ClipboardList, Users } from "lucide-react"
import { SidebarButton } from "./SidebarButton"

interface RightSidebarProps {
  onOpenProjectInfo: () => void
  onOpenIntervenants: () => void
  fileInputRefLots: React.RefObject<HTMLInputElement>
  fileInputRefEntreprises: React.RefObject<HTMLInputElement>
  onLotsFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onEntreprisesFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function RightSidebar({
  onOpenProjectInfo,
  onOpenIntervenants,
  fileInputRefLots,
  fileInputRefEntreprises,
  onLotsFileChange,
  onEntreprisesFileChange,
}: RightSidebarProps) {
  return (
    <div className="fixed top-0 right-0 h-full w-[10%] bg-[#EDEBE0] border-l border-gray-200 shadow-md flex flex-col items-center py-4 z-40">
      <h2
        className="text-xs font-bold mb-2"
        style={{
          fontSize: "clamp(10px, calc(0.15 * 100%), 14px)",
          maxHeight: "15%",
        }}
      >
        BIBLIOTHÈQUE
      </h2>
      <div className="w-full h-px bg-gray-400 mb-4 mx-auto"></div>

      {/* Bouton Projet */}
      <SidebarButton icon={FileText} tooltip="Projet" onClick={onOpenProjectInfo} />

      {/* Bouton Intervenants */}
      <SidebarButton icon={Users} tooltip="Intervenants" onClick={onOpenIntervenants} />

      {/* Bouton Lot avec input caché */}
      <div className="w-full">
        <input ref={fileInputRefLots} type="file" onChange={onLotsFileChange} accept=".csv" className="hidden" />
        <SidebarButton icon={ClipboardList} tooltip="Lot" onClick={() => fileInputRefLots.current?.click()} />
      </div>

      {/* Bouton Entreprises avec input caché */}
      <div className="w-full">
        <input
          ref={fileInputRefEntreprises}
          type="file"
          onChange={onEntreprisesFileChange}
          accept=".csv"
          className="hidden"
        />
        <SidebarButton icon={Building} tooltip="Ets" onClick={() => fileInputRefEntreprises.current?.click()} />
      </div>
    </div>
  )
}
