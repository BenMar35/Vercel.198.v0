"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Plus } from "lucide-react"

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
  multiple?: boolean
  isFileLoaded?: boolean
}

export const FileUploadButton = ({
  onFileSelect,
  accept = "*",
  className = "",
  multiple = false,
  isFileLoaded = false,
}: FileUploadButtonProps) => {
  const [hasFile, setHasFile] = useState(isFileLoaded)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setHasFile(true)
      if (multiple) {
        Array.from(files).forEach((file) => onFileSelect(file))
      } else {
        onFileSelect(files[0])
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
          hasFile ? "bg-custom-gold hover:bg-yellow-600" : "bg-gray-300 hover:bg-gray-400"
        }`}
      >
        <Plus className="w-6 h-6 text-black" />
      </button>
    </div>
  )
}
