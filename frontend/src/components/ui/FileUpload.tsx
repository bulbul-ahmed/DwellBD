import React, { useState } from 'react'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  existingImages?: string[]
  onRemoveExisting?: (url: string) => void
}

/**
 * FileUpload Component
 * Drag-and-drop file upload with preview and validation
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  accept = 'image/*',
  existingImages = [],
  onRemoveExisting
}) => {
  const [dragActive, setDragActive] = useState(false)

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Validate file
  const validateFile = (file: File): boolean => {
    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    // Check type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return false
    }

    return true
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files) as File[]
    handleFiles(droppedFiles)
  }

  // Handle file selection
  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile)

    if (validFiles.length === 0) return

    const totalFiles = files.length + validFiles.length
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    onChange([...files, ...validFiles])
    toast.success(`${validFiles.length} file(s) added`)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  // Remove new file
  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const totalFiles = files.length + existingImages.length

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors p-8 text-center cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to {maxSizeMB}MB
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {totalFiles} of {maxFiles} files selected
        </p>
      </div>

      {/* Existing Images Preview */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((url) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt="existing"
                  className="w-full h-24 object-cover rounded-lg"
                />
                {onRemoveExisting && (
                  <button
                    onClick={() => onRemoveExisting(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Files Preview */}
      {files.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">New Files ({files.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
