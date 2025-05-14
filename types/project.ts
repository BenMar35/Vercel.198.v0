export interface Project {
  id: string
  reference: string
  name: string
  clientType: string
}

export interface Phase {
  id: string
  name: string
}

export const PHASES: Phase[] = [
  { id: "etudes", name: "Etudes" },
  { id: "dce", name: "DCE" },
  { id: "demandes-administratives", name: "Demandes administratives" },
  { id: "appel-offres", name: "Appel d'offres" },
  { id: "suivi-chantier", name: "Suivi de chantier" },
  { id: "comptabilite-chantier", name: "Comptabilité chantier" },
]
