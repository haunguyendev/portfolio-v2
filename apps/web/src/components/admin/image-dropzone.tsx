'use client'

import { useState, useRef, useCallback } from 'react'
import NextImage from 'next/image'
import { ImageIcon, X, Upload, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadImage, getMediaUrl, type MediaFolder } from '@/lib/image-upload-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageDropzoneProps {
  value: string | null
  onChange: (url: string | null) => void
  folder: MediaFolder
  alt?: string
  onAltChange?: (alt: string) => void
  label?: string
  className?: string
}

export function ImageDropzone({
  value,
  onChange,
  folder,
  alt = '',
  onAltChange,
  label = 'Image',
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      const result = await uploadImage(file, folder)
      onChange(result.url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [folder, onChange])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  function handleRemove() {
    onChange(null)
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

  // Has image — show preview
  if (value) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="relative rounded-xl border border-border overflow-hidden bg-muted/20">
          <NextImage
            src={getMediaUrl(value)}
            alt={alt || 'Preview'}
            width={800}
            height={192}
            className="w-full h-48 object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {onAltChange && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Alt text (SEO)</label>
            <input
              className={inputCls}
              value={alt}
              onChange={(e) => onAltChange(e.target.value)}
              placeholder="Describe this image…"
            />
          </div>
        )}
      </div>
    )
  }

  // No image — show dropzone
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        {isUploading ? (
          <>
            <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-muted-foreground/60">
              Max 10MB · JPG, PNG, GIF, WebP
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* URL fallback input */}
      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            className={cn(inputCls, 'flex-1')}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
          />
          <Button type="button" size="sm" onClick={handleUrlSubmit}>Set</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowUrlInput(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="h-3 w-3" />
          Or enter URL
        </button>
      )}
    </div>
  )
}
