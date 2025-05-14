"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export function useTableData<T>(storageKey: string, initialData: T[] = [], dependencies: any[] = []) {
  const [data, setData] = useLocalStorage<T[]>(storageKey, initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Réinitialiser les données lorsque les dépendances changent
  useEffect(() => {
    // Si les données sont vides, ne rien faire
    if (data.length === 0) return

    // Si les dépendances ont changé, vérifier si les données doivent être mises à jour
    // Cette logique peut être personnalisée selon les besoins
  }, [dependencies, data])

  const addRow = (newRow: T) => {
    setData([...data, newRow])
  }

  const updateRow = (index: number, updatedRow: T) => {
    const newData = [...data]
    newData[index] = updatedRow
    setData(newData)
  }

  const updateRowField = <K extends keyof T>(index: number, field: K, value: T[K]) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: value }
    setData(newData)
  }

  const deleteRow = (index: number) => {
    const newData = [...data]
    newData.splice(index, 1)
    setData(newData)
  }

  const clearData = () => {
    setData([])
  }

  return {
    data,
    setData,
    isLoading,
    error,
    addRow,
    updateRow,
    updateRowField,
    deleteRow,
    clearData,
  }
}
