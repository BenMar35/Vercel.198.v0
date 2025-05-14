"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { Project } from "@/types/project"
import { useState, useEffect } from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const getClientTypeColor = (clientType: string) => {
  switch (clientType) {
    case "professionnel":
      return "bg-red-500"
    case "particulier":
      return "bg-yellow-500"
    case "sg":
      return "bg-blue-500"
    case "credit-agricole":
      return "bg-green-500"
    default:
      return "bg-gray-400"
  }
}

const pageNames: { [key: string]: string } = {
  etudes: "ESQ",
  dce: "DCE",
  "demandes-administratives": "Adm",
  "appel-offres": "AO",
  "suivi-chantier": "DET",
  "comptabilite-chantier": "Comptabilité",
  aor: "AOR",
}

export default function ProjectSidebar() {
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const projectId = pathname.split("/")[2]
    if (projectId && projectId !== openProjectId) {
      setOpenProjectId(projectId)
    }
  }, [pathname, openProjectId])

  const sortedProjects = [...projects].sort((a, b) => {
    const aNum = Number.parseInt(a.reference.split(".")[1])
    const bNum = Number.parseInt(b.reference.split(".")[1])
    if (aNum !== bNum) {
      return aNum - bNum
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <aside className="w-24 bg-[#F6F5EB] p-2 flex flex-col h-screen relative">
      <div className="absolute top-[10px] bottom-[10px] right-0 w-[1px] bg-custom-black"></div>
      <ul className="flex-grow overflow-y-auto space-y-4 py-4">
        {sortedProjects.map((project) => (
          <li key={project.id} className="relative">
            <motion.button
              className="w-full"
              onClick={() => setOpenProjectId(openProjectId === project.id ? null : project.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 mx-auto bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="h-3/5 bg-custom-gold flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">{project.reference.split(".")[1]}</span>
                </div>
                <div className="h-2/5 flex flex-col items-center justify-center p-1">
                  <span className="text-[8px] text-gray-600 truncate w-full text-center">{project.name}</span>
                  <div className={`w-3 h-3 rounded-full mt-1 ${getClientTypeColor(project.clientType)}`}></div>
                </div>
              </div>
            </motion.button>
            <AnimatePresence>
              {openProjectId === project.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 bg-white rounded-md shadow-md overflow-hidden"
                >
                  <ul className="py-2">
                    {Object.entries(pageNames).map(([pageId, pageName]) => (
                      <motion.li
                        key={pageId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={`/projects/${project.id}/${pageId}`}
                          className="block py-2 px-3 text-xs hover:bg-gray-100 transition-colors duration-200 text-custom-black"
                        >
                          <span className="inline-block w-8 font-semibold">{pageName}</span>
                          <ChevronDown className="inline-block w-4 h-4 ml-1 transform -rotate-90" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
      <div className="mt-auto pb-4">
        <div className="flex justify-center mb-4">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%201%20point61%202024%20copie-tZH0HqcQPbk8UzDdUhbGVgLEWIWuKk.png"
            alt="1POINT61 Logo"
            width={60}
            height={30}
          />
        </div>
        <Link href="/new-project">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="w-full bg-custom-gold hover:bg-yellow-600 text-black" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        </Link>
      </div>
    </aside>
  )
}
