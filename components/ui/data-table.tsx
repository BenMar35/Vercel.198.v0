"use client"

import type React from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export type Column<T> = {
  key: string
  header: React.ReactNode
  cell: (row: T, index: number) => React.ReactNode
  width?: string
  className?: string
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  onRowAdd?: () => void
  onRowDelete?: (index: number) => void
  onDataChange?: (newData: T[]) => void
  className?: string
  title?: string
  emptyMessage?: string
  isEditable?: boolean
  headerClassName?: string
  rowClassName?: (row: T, index: number) => string
}

export function DataTable<T>({
  data,
  columns,
  onRowAdd,
  onRowDelete,
  onDataChange,
  className = "",
  title,
  emptyMessage = "Aucune donnée disponible",
  isEditable = false,
  headerClassName = "bg-[#F6F5EB] text-center text-lg",
  rowClassName = () => "bg-[#F6F5EB]",
}: DataTableProps<T>) {
  // Fonction pour arrêter la propagation des événements
  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow-lg text-rendering-optimized ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {onRowAdd && (
            <Button
              onClick={(e) => {
                stopPropagation(e)
                onRowAdd()
              }}
              className="bg-custom-gold hover:bg-yellow-600 text-black"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          )}
        </div>
      )}

      <div className="transform-disable" onMouseDown={stopPropagation} onPointerDown={stopPropagation}>
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={`header-${column.key}-${index}`}
                  className={column.className || headerClassName}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
              {isEditable && onRowDelete && (
                <TableHead className={headerClassName} style={{ width: "50px" }}>
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`cell-${rowIndex}-${column.key}-${colIndex}`}
                      className={typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName}
                    >
                      {column.cell(row, rowIndex)}
                    </TableCell>
                  ))}
                  {isEditable && onRowDelete && (
                    <TableCell
                      className={typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          stopPropagation(e)
                          onRowDelete(rowIndex)
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (isEditable ? 1 : 0)} className="text-center py-4">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
