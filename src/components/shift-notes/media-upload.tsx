"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  IconCamera,
  IconVideo,
  IconFile,
  IconUpload,
  IconX,
  IconEye,
  IconDownload,
  IconTrash,
  IconPhoto,
  IconFileText,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconMaximize,
  IconPlus,
  IconCheck
} from "@tabler/icons-react"
import { Id } from "../../../convex/_generated/dataModel"

interface MediaFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video' | 'document'
  description: string
  uploadProgress: number
  uploaded: boolean
}

interface MediaUploadProps {
  shiftNoteId?: Id<"shiftNotes">
  onMediaUploaded?: (mediaId: string) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

export function MediaUpload({ 
  shiftNoteId,
  onMediaUploaded,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx']
}: MediaUploadProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File type detection
  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  // File size validation
  const validateFileSize = (file: File): boolean => {
    const sizeInMB = file.size / (1024 * 1024)
    return sizeInMB <= maxFileSize
  }

  // File type validation
  const validateFileType = (file: File): boolean => {
    return acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType + '/')
      }
      return file.type === type || file.name.toLowerCase().endsWith(type)
    })
  }

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList) => {
    setUploadError(null)
    
    const newFiles: MediaFile[] = []
    
    Array.from(files).forEach(file => {
      // Validate file count
      if (mediaFiles.length + newFiles.length >= maxFiles) {
        setUploadError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate file size
      if (!validateFileSize(file)) {
        setUploadError(`File "${file.name}" exceeds ${maxFileSize}MB limit`)
        return
      }

      // Validate file type
      if (!validateFileType(file)) {
        setUploadError(`File type not supported: ${file.name}`)
        return
      }

      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
        type: getFileType(file),
        description: '',
        uploadProgress: 0,
        uploaded: false
      }

      newFiles.push(mediaFile)
    })

    setMediaFiles(prev => [...prev, ...newFiles])
    
    // Auto-start upload simulation
    newFiles.forEach(mediaFile => {
      simulateUpload(mediaFile.id)
    })
  }, [simulateUpload, validateFileSize, validateFileType, maxFileSize, maxFiles, mediaFiles.length])

  // Simulate file upload with progress
  const simulateUpload = async (fileId: string) => {
    const updateProgress = (progress: number) => {
      setMediaFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, uploadProgress: progress } : file
      ))
    }

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      updateProgress(progress)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Mark as uploaded
    setMediaFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, uploaded: true } : file
    ))

    onMediaUploaded?.(fileId)
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  // Remove file
  const removeFile = (fileId: string) => {
    setMediaFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.url)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  // Update file description
  const updateDescription = (fileId: string, description: string) => {
    setMediaFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, description } : file
    ))
  }

  // Get file icon
  const getFileIcon = (type: 'image' | 'video' | 'document', size: "sm" | "lg" = "sm") => {
    const className = size === "lg" ? "h-8 w-8" : "h-4 w-4"
    
    switch (type) {
      case 'image':
        return <IconPhoto className={`${className} text-blue-600`} />
      case 'video':
        return <IconVideo className={`${className} text-purple-600`} />
      case 'document':
        return <IconFileText className={`${className} text-green-600`} />
      default:
        return <IconFile className={`${className} text-gray-600`} />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCamera className="h-5 w-5" />
            Media Attachments
          </CardTitle>
          <CardDescription>
            Upload photos, videos, or documents to support your shift note
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <IconUpload className="h-8 w-8 text-muted-foreground" />
                <IconCamera className="h-8 w-8 text-muted-foreground" />
                <IconVideo className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragging ? 'Drop files here' : 'Upload Media'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to select files
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <IconPlus className="h-4 w-4" />
                  Choose Files
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Supported: Images, Videos, PDFs, Documents</p>
                <p>Max file size: {maxFileSize}MB • Max files: {maxFiles}</p>
              </div>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {mediaFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attached Media ({mediaFiles.length})</span>
              <Badge variant="outline">
                {mediaFiles.filter(f => f.uploaded).length} / {mediaFiles.length} uploaded
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mediaFiles.map((mediaFile) => (
                <div key={mediaFile.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0">
                      {mediaFile.type === 'image' ? (
                        <div className="relative">
                          <img
                            src={mediaFile.url}
                            alt={mediaFile.file.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 h-6 w-6 p-0 bg-black/50 hover:bg-black/70"
                            onClick={() => {
                              // Open image in modal/lightbox
                              window.open(mediaFile.url, '_blank')
                            }}
                          >
                            <IconEye className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      ) : mediaFile.type === 'video' ? (
                        <div className="relative">
                          <video
                            src={mediaFile.url}
                            className="w-16 h-16 object-cover rounded"
                            controls={false}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute inset-0 bg-black/50 hover:bg-black/70"
                            onClick={() => {
                              // Open video in modal
                              window.open(mediaFile.url, '_blank')
                            }}
                          >
                            <IconPlayerPlay className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          {getFileIcon(mediaFile.type, "lg")}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm truncate max-w-xs">
                            {mediaFile.file.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {getFileIcon(mediaFile.type)}
                            <span>{formatFileSize(mediaFile.file.size)}</span>
                            {mediaFile.uploaded ? (
                              <Badge variant="outline" className="text-xs">
                                <IconCheck className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Uploading...
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {mediaFile.type !== 'document' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(mediaFile.url, '_blank')}
                            >
                              <IconEye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = mediaFile.url
                              link.download = mediaFile.file.name
                              link.click()
                            }}
                          >
                            <IconDownload className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(mediaFile.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {!mediaFile.uploaded && (
                        <div className="mb-3">
                          <Progress value={mediaFile.uploadProgress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {mediaFile.uploadProgress}% uploaded
                          </p>
                        </div>
                      )}

                      {/* Description Input */}
                      <div>
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                          placeholder="Add a description for this media..."
                          value={mediaFile.description}
                          onChange={(e) => updateDescription(mediaFile.id, e.target.value)}
                          rows={2}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {mediaFiles.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Add More Files
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              mediaFiles.forEach(file => URL.revokeObjectURL(file.url))
              setMediaFiles([])
            }}
            className="text-destructive hover:text-destructive"
          >
            <IconTrash className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

// Helper function to check if user agent supports certain file types
const isVideoSupported = (file: File) => {
  const video = document.createElement('video')
  return video.canPlayType(file.type) !== ''
}

const isImageSupported = (file: File) => {
  return file.type.startsWith('image/')
}