"use client"

import { useLocalStorage } from "@/hooks/useLocalStorage"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Project = {
  id: string
  reference: string
  name: string
  clientType: string
}

export default function Projects() {
  const [projects] = useLocalStorage<Project[]>("projects", [])

  return (
    <div className="min-h-screen bg-custom-gray p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-custom-gold text-center">Projets en cours</h1>
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-custom-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{project.name}</h2>
              <p>Référence: {project.reference}</p>
              <p>Type de client: {project.clientType}</p>
            </div>
          ))}
        </div>
        <Link href="/" className="block mt-6">
          <Button className="w-full bg-custom-gold hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  )
}
