"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

type CanvasItem = {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
}

type CanvasContextType = {
  items: CanvasItem[]
  addItem: (item: Omit<CanvasItem, "id">) => string
  updateItem: (id: string, data: Partial<CanvasItem>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, position: { x: number; y: number }) => void
  scale: number
  setScale: (scale: number) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
  resetView: () => void
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({
  children,
  projectId,
}: {
  children: React.ReactNode
  projectId: string
}) {
  const [items, setItems] = useLocalStorage<CanvasItem[]>(`canvas-items-${projectId}`, [])
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const addItem = useCallback(
    (item: Omit<CanvasItem, "id">) => {
      const id = Date.now().toString()
      const newItem = { ...item, id }
      setItems((prev) => [...prev, newItem])
      return id
    },
    [setItems],
  )

  const updateItem = useCallback(
    (id: string, data: Partial<CanvasItem>) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)))
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [setItems],
  )

  const moveItem = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, position } : item)))
    },
    [setItems],
  )

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <CanvasContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        moveItem,
        scale,
        setScale,
        position,
        setPosition,
        resetView,
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider")
  }
  return context
}
