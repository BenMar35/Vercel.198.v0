interface PageTitleProps {
  projectReference?: string
  projectName?: string
  pageTitle: string
}

// Modification de l'export pour qu'il soit un export par défaut
export default function PageTitle({ projectReference, projectName, pageTitle }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="page-title mb-2">
        {projectReference && projectName ? `${projectReference} - ${projectName} - ${pageTitle}` : pageTitle}
      </h1>
      <div className="w-full h-[1px] bg-custom-black"></div>
    </div>
  )
}

// Ajout d'un export nommé pour la rétrocompatibilité
export { PageTitle }
