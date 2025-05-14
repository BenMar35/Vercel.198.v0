import { createTask, getTasks, updateTask, deleteTask } from "@/services/task-service"
import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const versionId = searchParams.get("versionId")

    if (!projectId || !versionId) {
      return NextResponse.json({ error: "projectId et versionId sont requis" }, { status: 400 })
    }

    const tasks = await getTasks(projectId, versionId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des tâches" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, versionId, text, lotId, completed, dueDate } = body

    if (!projectId || !versionId || !text) {
      return NextResponse.json({ error: "projectId, versionId et text sont requis" }, { status: 400 })
    }

    const task = await createTask({
      project_id: projectId,
      version_id: versionId,
      lot_id: lotId,
      text,
      completed: completed || false,
      due_date: dueDate,
      created_by: user.id,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la tâche" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 })
    }

    const task = await updateTask(id, updates)
    return NextResponse.json(task)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la tâche" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id est requis" }, { status: 400 })
    }

    await deleteTask(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la tâche" }, { status: 500 })
  }
}
