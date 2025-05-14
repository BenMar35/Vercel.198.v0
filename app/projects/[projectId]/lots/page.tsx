import { Suspense } from "react"
import { notFound } from "next/navigation"
import LotManager from "@/components/LotManager"
import PageTitle from "@/components/PageTitle"
import { Loader2 } from "lucide-react"

interface LotsPageProps {
  params: {
    projectId: string
  }
  searchParams: {
    versionId?: string
  }
}

export default function LotsPage({ params, searchParams }: LotsPageProps) {
  const { projectId } = params
  const versionId = searchParams.versionId || "default"

  if (!projectId) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <PageTitle title="Gestion des Lots" />

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <LotManager projectId={projectId} versionId={versionId} />
      </Suspense>
    </div>
  )
}
