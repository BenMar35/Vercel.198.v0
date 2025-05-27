import { InfiniteCanvas } from "@/components/InfiniteCanvas"

interface CanvasPageProps {
  params: {
    projectId: string
  }
}

export default function CanvasPage({ params }: CanvasPageProps) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <InfiniteCanvas projectId={params.projectId} />
    </div>
  )
}
