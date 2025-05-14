"use client"

import type React from "react"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { MoreHorizontal, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

type Task = {
  id: string
  text: string
  completed: boolean
  lotId?: string
  lotName?: string
}

type Lot = {
  id: string
  name: string
  numero: string
}

interface TaskListProps {
  projectId?: string
  versionId?: string
  lots?: Lot[]
  title?: string
}

export function TaskList({ projectId, versionId, lots = [], title = "Liste de tâches" }: TaskListProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([{ id: "1", text: "", completed: false }])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Charger les tâches depuis l'API
  useEffect(() => {
    if (projectId && versionId) {
      fetchTasks()
    }
  }, [projectId, versionId])

  const fetchTasks = async () => {
    if (!projectId || !versionId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/tasks?projectId=${projectId}&versionId=${versionId}`)

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tâches")
      }

      const data = await response.json()

      // Transformer les données pour correspondre à notre format
      const formattedTasks = data.map((task: any) => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        lotId: task.lot_id,
        lotName: task.lots?.name,
      }))

      if (formattedTasks.length === 0) {
        // Si aucune tâche n'existe, créer une tâche vide
        setTasks([{ id: "1", text: "", completed: false }])
      } else {
        setTasks(formattedTasks)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarder une tâche dans l'API
  const saveTask = async (task: Task) => {
    if (!projectId || !versionId || !user) return

    try {
      // Si l'ID est numérique, c'est une nouvelle tâche locale
      if (!isNaN(Number(task.id))) {
        // Créer une nouvelle tâche
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            versionId,
            text: task.text,
            lotId: task.lotId,
            completed: task.completed,
          }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la création de la tâche")
        }

        const newTask = await response.json()

        // Mettre à jour l'ID local avec l'ID de la base de données
        setTasks(
          tasks.map((t) =>
            t.id === task.id
              ? {
                  ...task,
                  id: newTask.id,
                }
              : t,
          ),
        )

        return newTask.id
      } else {
        // Mettre à jour une tâche existante
        const response = await fetch("/api/tasks", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: task.id,
            text: task.text,
            lot_id: task.lotId,
            completed: task.completed,
          }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour de la tâche")
        }

        return task.id
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tâche:", error)
      return task.id
    }
  }

  // Supprimer une tâche de l'API
  const deleteTaskFromApi = async (taskId: string) => {
    // Si l'ID est numérique, c'est une tâche locale qui n'a pas été sauvegardée
    if (!isNaN(Number(taskId))) {
      return
    }

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la tâche")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error)
    }
  }

  // Fonction pour ajouter une nouvelle tâche
  const addTask = (afterId: string) => {
    const newTaskId = Date.now().toString()

    // Vérifier si tasks est vide ou si l'ID n'existe pas
    if (tasks.length === 0 || !tasks.find((task) => task.id === afterId)) {
      setTasks([...tasks, { id: newTaskId, text: "", completed: false }])

      // Focus sur le nouvel input après le rendu
      setTimeout(() => {
        if (inputRefs.current[newTaskId]) {
          inputRefs.current[newTaskId]?.focus()
        }
      }, 10)
      return
    }

    const taskIndex = tasks.findIndex((task) => task.id === afterId)

    if (taskIndex === -1) return

    const newTasks = [...tasks]
    newTasks.splice(taskIndex + 1, 0, { id: newTaskId, text: "", completed: false })
    setTasks(newTasks)

    // Focus sur le nouvel input après le rendu
    setTimeout(() => {
      if (inputRefs.current[newTaskId]) {
        inputRefs.current[newTaskId]?.focus()
      }
    }, 10)
  }

  // Fonction pour gérer l'appui sur Entrée
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTask(taskId)
    }
  }

  // Fonction pour mettre à jour le texte d'une tâche
  const updateTaskText = async (id: string, text: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, text } : task)))

    // Sauvegarder la tâche après un délai pour éviter trop de requêtes
    const task = tasks.find((t) => t.id === id)
    if (task && text !== task.text) {
      const updatedTask = { ...task, text }
      // Utiliser un debounce pour éviter trop de requêtes
      setTimeout(() => {
        saveTask(updatedTask)
      }, 1000)
    }
  }

  // Fonction pour basculer l'état d'achèvement d'une tâche
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const updatedTask = { ...task, completed: !task.completed }
    setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)))

    // Sauvegarder immédiatement le changement d'état
    await saveTask(updatedTask)
  }

  // Fonction pour supprimer une tâche
  const deleteTask = async (id: string) => {
    await deleteTaskFromApi(id)
    setTasks(tasks.filter((task) => task.id !== id))
  }

  // Fonction pour affilier une tâche à un lot
  const assignTaskToLot = async (taskId: string, lotId: string) => {
    const lot = lots.find((l) => l.id === lotId)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, lotId, lotName: lot?.name || "" }
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
    setIsDialogOpen(false)

    // Sauvegarder immédiatement l'affiliation
    await saveTask(updatedTask)
  }

  // Fonction pour ouvrir le dialogue d'affiliation à un lot
  const openLotDialog = (taskId: string) => {
    setSelectedTaskId(taskId)
    const task = tasks.find((t) => t.id === taskId)
    setSelectedLotId(task?.lotId || null)
    setIsDialogOpen(true)
  }

  // Focus sur le premier input vide au chargement
  useEffect(() => {
    const emptyTask = tasks.find((task) => task.text === "")
    if (emptyTask && inputRefs.current[emptyTask.id]) {
      inputRefs.current[emptyTask.id]?.focus()
    }
  }, [])

  // Arrêter la propagation des événements pour éviter que le canvas ne capture les événements
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  if (isLoading) {
    return (
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full"
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-gold"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onTouchStart={stopPropagation}
    >
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 group"
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onTouchStart={stopPropagation}
          >
            <button
              onClick={() => toggleTaskCompletion(task.id)}
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center",
                task.completed ? "bg-custom-gold" : "bg-white",
              )}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <input
              ref={(el) => (inputRefs.current[task.id] = el)}
              value={task.text}
              onChange={(e) => updateTaskText(task.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e as unknown as KeyboardEvent<HTMLInputElement>, task.id)}
              className={cn(
                "flex-grow px-2 py-1 border-none outline-none focus:ring-0 focus:outline-none",
                "bg-transparent hover:bg-gray-50 rounded",
                task.completed ? "line-through text-gray-500" : "",
              )}
              placeholder="Nouvelle tâche..."
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
              onTouchStart={stopPropagation}
            />

            {task.lotName && <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">{task.lotName}</div>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openLotDialog(task.id)}>Affilier à un lot</DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteTask(task.id)}>Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                deleteTask(task.id)
              }}
              onMouseDown={stopPropagation}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={(e) => {
          e.stopPropagation()
          // Vérifier si tasks est vide
          if (tasks.length === 0) {
            addTask("") // Passer une chaîne vide si tasks est vide
          } else {
            addTask(tasks[tasks.length - 1].id)
          }
        }}
        onMouseDown={stopPropagation}
      >
        Ajouter une tâche
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClick={stopPropagation} onMouseDown={stopPropagation}>
          <DialogHeader>
            <DialogTitle>Affilier à un lot</DialogTitle>
            <DialogDescription>Choisissez un lot auquel affilier cette tâche</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className={cn(
                    "p-2 rounded-md cursor-pointer hover:bg-gray-100",
                    selectedLotId === lot.id ? "bg-gray-100 border border-gray-300" : "",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedLotId(lot.id)
                  }}
                  onMouseDown={stopPropagation}
                >
                  <div className="font-medium">{lot.name}</div>
                  <div className="text-sm text-gray-500">Lot n°{lot.numero}</div>
                </div>
              ))}
              {lots.length === 0 && <div className="text-center py-4 text-gray-500">Aucun lot disponible</div>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={stopPropagation} onMouseDown={stopPropagation}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                selectedTaskId && selectedLotId && assignTaskToLot(selectedTaskId, selectedLotId)
              }}
              disabled={!selectedLotId}
              onMouseDown={stopPropagation}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
