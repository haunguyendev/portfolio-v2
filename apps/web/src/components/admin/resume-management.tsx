'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { getAuthenticatedGqlClient } from '@/lib/graphql-client'
import { uploadResume } from '@/lib/resume-upload-service'
import { gql } from 'graphql-request'
import type { ResumeItem } from '@/app/(admin)/admin/resume/page'
import profileData from '@/content/profile.json'
import skillsData from '@/content/skills.json'
import experienceData from '@/content/experience.json'

const SET_ACTIVE_MUTATION = gql`
  mutation SetActiveResume($id: ID!) {
    setActiveResume(id: $id) { id isActive }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteResume($id: ID!) {
    deleteResume(id: $id)
  }
`

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ResumeManagement({
  initialResumes,
}: {
  initialResumes: ResumeItem[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const resumes = initialResumes
  const activeResume = resumes.find((r) => r.isActive)
  const inactiveResumes = resumes.filter((r) => !r.isActive)

  const refresh = useCallback(() => router.refresh(), [router])

  // Handle file upload
  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        await uploadResume(file)
        refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [refresh],
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') handleUpload(file)
  }

  // Set active
  const handleSetActive = useCallback(
    async (id: string) => {
      setActionLoading(id)
      try {
        const client = await getAuthenticatedGqlClient()
        await client.request(SET_ACTIVE_MUTATION, { id })
        refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to set active')
      } finally {
        setActionLoading(null)
      }
    },
    [refresh],
  )

  // Generate CV from portfolio data
  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      // Assemble CvData from static JSON content files
      const cvData = {
        name: profileData.name,
        title: profileData.title,
        email: profileData.contact.email,
        phone: profileData.contact.phone,
        location: profileData.location,
        linkedin: profileData.social.linkedin,
        github: profileData.social.github,
        website: 'https://portfolio.haunguyendev.xyz',
        summary: profileData.bio.full,
        experience: experienceData
          .filter((e) => e.role !== 'Computer Science Student')
          .map((e) => ({
            company: e.company,
            role: e.role,
            duration: e.duration,
            highlights: e.highlights,
          })),
        skills: skillsData
          .filter((s) => s.category !== 'Soft Skills')
          .map((s) => ({ category: s.category, items: s.items })),
        education: experienceData
          .filter((e) => e.role === 'Computer Science Student')
          .map((e) => ({
            institution: e.company,
            degree: 'Bachelor of Computer Science',
            duration: e.duration,
          })),
        certificates: [],
      }

      // Get auth token
      const sessionRes = await fetch('/api/auth/get-session', {
        credentials: 'include',
      })
      const sessionData = await sessionRes.json()
      const token = sessionData?.session?.token

      const res = await fetch(`${API_URL}/api/resume/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cvData),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Generation failed' }))
        throw new Error(error.message || `Generation failed: ${res.status}`)
      }

      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }, [refresh])

  // Delete
  const handleDelete = useCallback(
    async (id: string) => {
      setActionLoading(id)
      try {
        const client = await getAuthenticatedGqlClient()
        await client.request(DELETE_MUTATION, { id })
        setDeleteConfirm(null)
        refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete')
      } finally {
        setActionLoading(null)
      }
    },
    [refresh],
  )

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
      >
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Drag & drop PDF here'}
          </p>
          <p className="text-xs text-muted-foreground">or click to browse (max 10MB)</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Active Resume */}
      {activeResume && (
        <div className="rounded-lg border-2 border-green-500/30 bg-green-50/50 p-4 dark:bg-green-950/10">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              Active Resume
            </span>
          </div>
          <ResumeCard
            resume={activeResume}
            isActive
            actionLoading={actionLoading}
            onPreview={() =>
              window.open(`${API_URL}/api/resume/download?preview=true`, '_blank')
            }
            onDownload={() =>
              window.open(`${API_URL}/api/resume/download`, '_blank')
            }
          />
        </div>
      )}

      {/* No active resume message */}
      {!activeResume && resumes.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 text-sm text-amber-700 dark:bg-amber-950/10 dark:text-amber-400">
          No active resume. Set one as active so visitors can download it.
        </div>
      )}

      {/* Resume History */}
      {inactiveResumes.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Resume History
          </h2>
          <div className="space-y-2">
            {inactiveResumes.map((resume) => (
              <div key={resume.id} className="rounded-lg border border-border p-4">
                {deleteConfirm === resume.id ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delete &quot;{resume.fileName}&quot;?</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-md px-3 py-1 text-xs hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(resume.id)}
                        disabled={actionLoading === resume.id}
                        className="rounded-md bg-destructive px-3 py-1 text-xs text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {actionLoading === resume.id ? 'Deleting...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <ResumeCard
                    resume={resume}
                    isActive={false}
                    actionLoading={actionLoading}
                    onSetActive={() => handleSetActive(resume.id)}
                    onPreview={() =>
                      window.open(
                        `${API_URL}/api/media/${resume.filePath}`,
                        '_blank',
                      )
                    }
                    onDelete={() => setDeleteConfirm(resume.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate from Data */}
      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-2 text-sm font-semibold">Generate from Portfolio Data</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Generate a CV PDF from your profile, experience, and skills data.
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {generating ? 'Generating...' : 'Generate CV'}
        </button>
      </div>

      {/* Empty state */}
      {resumes.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No resumes yet. Upload your first CV above.
        </div>
      )}
    </div>
  )
}

function ResumeCard({
  resume,
  isActive,
  actionLoading,
  onSetActive,
  onPreview,
  onDownload,
  onDelete,
}: {
  resume: ResumeItem
  isActive: boolean
  actionLoading: string | null
  onSetActive?: () => void
  onPreview?: () => void
  onDownload?: () => void
  onDelete?: () => void
}) {
  const loading = actionLoading === resume.id

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <FileText className="size-8 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-medium">{resume.fileName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                resume.type === 'UPLOADED'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}
            >
              {resume.type === 'UPLOADED' ? 'Uploaded' : 'Generated'}
            </span>
            <span>{formatFileSize(resume.fileSize)}</span>
            <span>{formatDate(resume.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!isActive && onSetActive && (
          <button
            type="button"
            onClick={onSetActive}
            disabled={loading}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {loading ? 'Setting...' : 'Set Active'}
          </button>
        )}
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            title="Preview"
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
          >
            <Eye className="size-3.5" />
          </button>
        )}
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            title="Download"
            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
          >
            <Download className="size-3.5" />
          </button>
        )}
        {!isActive && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="inline-flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
