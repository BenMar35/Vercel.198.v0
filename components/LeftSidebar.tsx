"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

type TaskItem = {
  id: string
  title: string
  completed: boolean
  children?: TaskItem[]
}

interface LeftSidebarProps {
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export const LeftSidebar = ({ isExpanded: propIsExpanded, onToggleExpand }: LeftSidebarProps) => {
  const [tasks, setTasks] = useState<Record<string, TaskItem[]>>({
    faisabilite: [
      {
        id: "fais-1",
        title: "Après première visite, offre pour faisabilité à rédiger et enveloppe financière à définir avec la MOA",
        completed: false,
      },
      {
        id: "fais-2",
        title: "L'étude de faisabilité comporte",
        completed: false,
      },
      {
        id: "fais-2-1",
        title: "Analyse Urbaine (synthèse de l'analyse PLUI, règles relatives au patrimoine s'il y en a)",
        completed: false,
      },
      {
        id: "fais-2-2",
        title: "Planche avec inspirations et ambiances intérieures et extérieures suivant projet",
        completed: false,
      },
      { id: "fais-2-3", title: "Propositions projets, 1-3 projets à la main", completed: false },
      { id: "fais-2-4", title: "Chiffrage (y compris honoraires agence et frais autres)", completed: false },
      {
        id: "fais-3",
        title: "Important, informer dès le début la maitrise d'ouvrage des frais suivants",
        completed: false,
      },
      { id: "fais-3-1", title: "Bornage géomètre (si bornage de terrain à réaliser)", completed: false },
      { id: "fais-3-2", title: "Honoraires architecte", completed: false },
      { id: "fais-3-3", title: "Analyse amiante RAAT et plomb", completed: false },
      { id: "fais-3-4", title: "Honoraires BET lots structure", completed: false },
      { id: "fais-3-5", title: "Honoraires BET lots Cfo / Cfa, (projet pro)", completed: false },
      { id: "fais-3-6", title: "Honoraires BET lots CVC", completed: false },
      {
        id: "fais-3-7",
        title: "Honoraires BET thermique (en dessous de 50m², 50 à 70m², supérieur à 70m²)",
        completed: false,
      },
      { id: "fais-3-8", title: "Honoraires géotechnie G2 AVP et G2 PRO", completed: false },
      { id: "fais-3-9", title: "Mission CSPS, (projet pro)", completed: false },
      { id: "fais-3-10", title: "Bureau de contrôle, (projet pro)", completed: false },
      { id: "fais-3-11", title: "Assurance dommage ouvrage", completed: false },
      { id: "fais-3-12", title: "Constat d'huissier des alentours", completed: false },
      { id: "fais-3-13", title: "Constat d'huissier affichage permis", completed: false },
      { id: "fais-3-14", title: "Test intermédiaire d'étanchéité à l'air", completed: false },
      { id: "fais-3-15", title: "Test final d'étanchéité à l'air", completed: false },
    ],
    contrat: [
      { id: "contrat-1", title: "Attention à la TVA, 10% ou 20%", completed: false },
      { id: "contrat-2", title: "Mission complète ou partielle + OPC", completed: false },
    ],
    esquisse: [
      {
        id: "esquisse-1",
        title: "Relevé par bureau spécialisé ou agence et saisie des plans existants DAO",
        completed: false,
      },
      {
        id: "esquisse-2",
        title: "Demande de devis pour études structures, thermique et études de sol à réaliser",
        completed: false,
      },
      { id: "esquisse-3", title: "Sélection matériaux", completed: false },
    ],
    aps: [{ id: "aps-1", title: "G2 AVP", completed: false }],
    adap: [
      { id: "adap-1", title: "Plan cadastral et plan de situation", completed: false },
      { id: "adap-2", title: "Plan masse", completed: false },
      { id: "adap-3", title: "Existant / sécurité incendie", completed: false },
      { id: "adap-4", title: "Non conforme", completed: false },
      { id: "adap-5", title: "Travaux envisagés", completed: false },
      { id: "adap-6", title: "Cerfa", completed: false },
      { id: "adap-7", title: "Notice sécurité incendie", completed: false },
      { id: "adap-8", title: "Notice accessibilité PMR", completed: false },
    ],
    declaration: [
      { id: "declaration-1", title: "Page de garde", completed: false },
      { id: "declaration-2", title: "Plan cadastral et plan de situation", completed: false },
      { id: "declaration-3", title: "Plan masse", completed: false },
      { id: "declaration-4", title: "Plan existant RdC", completed: false },
      { id: "declaration-5", title: "Plan projet RdC", completed: false },
      { id: "declaration-6", title: "Façades existantes", completed: false },
      { id: "declaration-7", title: "Façades projet", completed: false },
      { id: "declaration-8", title: "Insertion proche", completed: false },
      { id: "declaration-9", title: "Insertion lointaine", completed: false },
      { id: "declaration-10", title: "Notice architecturale", completed: false },
    ],
    demarches: [
      { id: "demarches-1", title: "Ouverture du dossier AMI sur MAF", completed: false },
      {
        id: "demarches-2",
        title: "Panneau de chantier avec arrêté de la mairie à afficher sur site dès réception",
        completed: false,
      },
      {
        id: "demarches-3",
        title: "Faire valider les plans au bureau de contrôle (désenfumage, PMR, etc)",
        completed: false,
      },
      {
        id: "demarches-4",
        title: "En cas de besoin d'intervention chez le voisinage (lettre à rédiger pour autorisation)",
        completed: false,
      },
    ],
    dce: [
      {
        id: "dce-1",
        title: "Présenter, proposer et définir avec le client la liste des entreprises à consulter",
        completed: false,
      },
      { id: "dce-2", title: "Le dossier doit comporter", completed: false },
      { id: "dce-2-1", title: "Avis d'appel d'offres", completed: false },
      { id: "dce-2-2", title: "CCTP", completed: false },
      { id: "dce-2-3", title: "Plans", completed: false },
      { id: "dce-2-3-1", title: "Page de garde", completed: false },
      { id: "dce-2-3-2", title: "Plan cadastral et plan de situation", completed: false },
      { id: "dce-2-3-3", title: "Plan masse existant", completed: false },
      { id: "dce-2-3-4", title: "Plan masse projet", completed: false },
      { id: "dce-2-3-5", title: "Plan existant RdC", completed: false },
      { id: "dce-2-3-6", title: "Plan projet RdC", completed: false },
      { id: "dce-2-3-7", title: "Façades existantes", completed: false },
      { id: "dce-2-3-8", title: "Façades projet", completed: false },
      { id: "dce-2-3-9", title: "Coupe(s) longitudinale(s)", completed: false },
      { id: "dce-2-3-10", title: "Coupe(s) transversale(s)", completed: false },
      { id: "dce-2-3-11", title: "Plan de faux-plafond", completed: false },
      { id: "dce-2-3-12", title: "Plan d'électricité", completed: false },
      { id: "dce-2-3-13", title: "Carnet de détails menuiserie", completed: false },
      { id: "dce-2-3-14", title: "Insertions suivant besoins", completed: false },
      { id: "dce-2-4", title: "Lettre de transparence", completed: false },
      { id: "dce-2-5", title: "Planning prévisionnel (avec Phasage ou non)", completed: false },
      {
        id: "dce-2-6",
        title: "Date de remise des offres et sous quel forme (sur plateforme, par mail, etc)",
        completed: false,
      },
      { id: "dce-2-7", title: "Documents bureaux d'études (structure, thermique et G2PRO)", completed: false },
    ],
    visa: [
      {
        id: "visa-1",
        title:
          "Vérification de l'ensemble des plans d'entreprises : structures, réseaux VRD, charpente, couverture et étanchéité",
        completed: false,
      },
      {
        id: "visa-2",
        title: "Attention : ne pas réaliser les plans d'EXE seulement des plans de principe",
        completed: false,
      },
    ],
    chantier: [
      { id: "chantier-1", title: "Réunion préparatoire", completed: false },
      { id: "chantier-1-1", title: "2 à 7 semaines avant le démarrage de chantier, suivant les cas", completed: false },
      { id: "chantier-2", title: "A transmettre avant la réunion", completed: false },
      {
        id: "chantier-2-1",
        title: "Fiche de tâche à remplir par les entreprises et confirmer la disponibilité suivant planning transmis",
        completed: false,
      },
      {
        id: "chantier-2-2",
        title: "Liste documents à transmettre ou préparer pour réunion, échantillons, etc…",
        completed: false,
      },
      { id: "chantier-3", title: "A définir lors de la réunion", completed: false },
      { id: "chantier-3-1", title: "Type d'accès au chantier (boite à clé, gardiennage)", completed: false },
      { id: "chantier-3-2", title: "Implantation de bennes à gravats si besoin", completed: false },
      {
        id: "chantier-3-3",
        title:
          "Installation de chantier : toilettes micro-onde, frigo sur site ou en cabanon de chantier si possibilité",
        completed: false,
      },
      { id: "chantier-3-4", title: "Nettoyage de chantier", completed: false },
      {
        id: "chantier-3-5",
        title: "Protection de chantier et confirmer qu'un état des lieux a bien été réalisé",
        completed: false,
      },
      { id: "chantier-4", title: "A transmettre suite à la réunion", completed: false },
      { id: "chantier-4-1", title: "CR N°01", completed: false },
      { id: "chantier-4-2", title: "Planning recalé", completed: false },
      { id: "chantier-4-3", title: "Divers plans, documents", completed: false },
      { id: "chantier-4-4", title: "Plan dwg MAJ", completed: false },
      { id: "chantier-5", title: "Avant commencement des travaux", completed: false },
      {
        id: "chantier-5-1",
        title: "S'assurer de la bonne réception de l'ensemble des AE et des assurances des entreprises",
        completed: false,
      },
      { id: "chantier-5-2", title: "Informé les réseaux de l'ouverture du chantier sur INERIS", completed: false },
      {
        id: "chantier-5-3",
        title: "Saisir l'avancement du dossier AMI sur MAF (si projet particulier)",
        completed: false,
      },
      { id: "chantier-5-4", title: "Test intermédiaire d'étanchéité à l'air", completed: false },
      { id: "chantier-5-5", title: "Test final d'étanchéité à l'air", completed: false },
    ],
    facturation: [
      { id: "facturation-1", title: "Mise à jour du contrat si les travaux sont plus importants", completed: false },
      { id: "facturation-2", title: "Facturation des kms", completed: false },
    ],
  })

  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  // Utiliser la prop isExpanded si elle est fournie, sinon utiliser l'état local
  const [isExpandedState, setIsExpandedState] = useState(true)
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : isExpandedState
  const sidebarWidth = "min(35%, 1000px)" // Largeur de 35% avec un maximum de 1000px

  // Gérer l'affichage de la barre de défilement
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    sidebar.addEventListener("mouseenter", handleMouseEnter)
    sidebar.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      sidebar.removeEventListener("mouseenter", handleMouseEnter)
      sidebar.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const toggleSidebar = () => {
    if (onToggleExpand) {
      onToggleExpand()
    } else {
      setIsExpandedState(!isExpandedState)
    }
  }

  const toggleTask = (sectionKey: string, taskId: string) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev }

      if (updatedTasks[sectionKey]) {
        updatedTasks[sectionKey] = updatedTasks[sectionKey].map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        )
      }

      return updatedTasks
    })
  }

  const renderTaskList = (sectionKey: string, tasks: TaskItem[], level = 0) => {
    return tasks.map((task) => (
      <div key={task.id} className={`flex items-start mb-1 ${level > 0 ? `ml-${level * 3}` : ""}`}>
        <button
          className={cn(
            "w-3 h-3 rounded-full flex-shrink-0 mr-2 mt-1",
            "flex items-center justify-center transition-all duration-200",
            "border border-gray-400",
            task.completed ? "bg-gray-300" : "bg-transparent",
          )}
          onClick={() => toggleTask(sectionKey, task.id)}
        ></button>
        <span
          className={cn("text-left font-light", task.completed ? "text-black" : "text-gray-500")}
          style={{ fontSize: "clamp(10px, calc(0.08 * 100%), 14px)" }}
        >
          {task.title}
        </span>
      </div>
    ))
  }

  return (
    <div
      ref={sidebarRef}
      className={cn("fixed left-0 top-0 h-full bg-[#EDEBE0] border-r border-gray-200 shadow-md flex flex-col z-40")}
      style={{
        width: sidebarWidth,
        minWidth: "50px",
        transition: "transform 0.3s ease-in-out",
        transform: isExpanded ? "translateX(0)" : "translateX(calc(-100% + 8px))",
        overflow: "visible", // Toujours visible pour que le bouton reste accessible
      }}
    >
      {/* Bouton pour ouvrir/fermer le bandeau - toujours visible sur le bord droit */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute w-8 h-16 bg-custom-gold flex items-center justify-center shadow-md z-50 rounded-r-md",
          "top-1/2 transform -translate-y-1/2", // Centré verticalement
        )}
        style={{
          right: "-8px", // Positionné à l'extérieur du bandeau
          transition: "all 0.3s ease-in-out",
        }}
      >
        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* En-tête */}
      <div className="p-3 border-b border-gray-200">
        <h2
          className="font-bold text-center pb-1"
          style={{
            fontSize: "clamp(12px, calc(0.15 * 100%), 18px)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Avancement projet
        </h2>
        <div className="w-full h-px bg-gray-400 mt-1"></div>
      </div>

      {/* Contenu */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-2 custom-scrollbar",
          isHovered ? "scrollbar-visible" : "scrollbar-hidden",
        )}
      >
        {/* Élaboration des dossiers */}
        <div className="mb-3">
          <h3
            className="font-bold text-left mb-2"
            style={{
              fontSize: "clamp(11px, calc(0.12 * 100%), 16px)",
              maxHeight: "15%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Élaboration des dossiers
          </h3>

          {/* Faisabilité */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Faisabilité
            </h4>
            <div className="ml-1">{renderTaskList("faisabilite", tasks["faisabilite"] || [])}</div>
          </div>

          {/* Rédaction contrat d'architecte */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Rédaction contrat d'architecte
            </h4>
            <div className="ml-1">{renderTaskList("contrat", tasks["contrat"] || [])}</div>
          </div>

          {/* Esquisse */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Esquisse
            </h4>
            <div className="ml-1">{renderTaskList("esquisse", tasks["esquisse"] || [])}</div>
          </div>

          {/* APS */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              APS
            </h4>
            <div className="ml-1">{renderTaskList("aps", tasks["aps"] || [])}</div>
          </div>

          {/* Ad'AP */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Ad'AP
            </h4>
            <div className="ml-1">{renderTaskList("adap", tasks["adap"] || [])}</div>
          </div>

          {/* Autorisation de Travaux */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Autorisation de Travaux
            </h4>
          </div>

          {/* Déclaration préalable */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Déclaration préalable
            </h4>
            <div className="ml-1">{renderTaskList("declaration", tasks["declaration"] || [])}</div>
          </div>

          {/* Recherche de droit privé */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Recherche de droit privé
            </h4>
          </div>

          {/* Permis de construire */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Permis de construire
            </h4>
          </div>

          {/* Démarches administratives après permis */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Démarches administratives après permis
            </h4>
            <div className="ml-1">{renderTaskList("demarches", tasks["demarches"] || [])}</div>
          </div>

          {/* Dossier de Consultation des entreprises */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Dossier de Consultation des entreprises
            </h4>
            <div className="ml-1">{renderTaskList("dce", tasks["dce"] || [])}</div>
          </div>

          {/* VISA */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              VISA
            </h4>
            <div className="ml-1">{renderTaskList("visa", tasks["visa"] || [])}</div>
          </div>

          {/* Chantier */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Chantier
            </h4>
            <div className="ml-1">{renderTaskList("chantier", tasks["chantier"] || [])}</div>
          </div>

          {/* Réception */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Réception
            </h4>
          </div>

          {/* Levée des réserves */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Levée des réserves
            </h4>
          </div>

          {/* DOE */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              DOE
            </h4>
          </div>

          {/* Facturation */}
          <div className="mb-3">
            <h4
              className="font-semibold text-left mb-1"
              style={{
                fontSize: "clamp(10px, calc(0.1 * 100%), 14px)",
              }}
            >
              Facturation
            </h4>
            <div className="ml-1">{renderTaskList("facturation", tasks["facturation"] || [])}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
