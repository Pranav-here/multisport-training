"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Upload as UploadIcon, FileVideo2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { ClipApiResponse } from '@/lib/clips'
import type { ApiResponse } from '@/lib/api-response'

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024

const ACCEPTED_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
])

type SportOption = {
  slug: string
  name: string
}

const DEFAULT_SPORT_OPTIONS: SportOption[] = [
  { slug: 'multisport', name: 'MultiSport' },
  { slug: 'basketball', name: 'Basketball' },
  { slug: 'soccer', name: 'Soccer' },
  { slug: 'tennis', name: 'Tennis' },
  { slug: 'volleyball', name: 'Volleyball' },
  { slug: 'strength-training', name: 'Strength & Conditioning' },
]

type SignedUrlResponse = {
  url: string
  path: string
}

type UploadClipApiResponse = {
  clip: ClipApiResponse
}

type UploadProgressPhase = 'idle' | 'preparing' | 'uploading' | 'saving'

export type UploadClipSuccessPayload = {
  clip: ClipApiResponse
  form: {
    caption: string
    sportSlug: string
    sportName: string
  }
}

interface UploadClipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: (payload: UploadClipSuccessPayload) => void
}

type VideoMetadata = {
  durationSeconds: number | null
  width: number | null
  height: number | null
}

function isAcceptedFile(file: File) {
  if (ACCEPTED_MIME_TYPES.has(file.type)) {
    return true
  }
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  return extension === 'mp4' || extension === 'mov'
}

async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(video.duration) ? Math.round(video.duration) : null
      const width = Number.isFinite(video.videoWidth) ? video.videoWidth : null
      const height = Number.isFinite(video.videoHeight) ? video.videoHeight : null
      URL.revokeObjectURL(video.src)
      resolve({ durationSeconds, width, height })
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      resolve({ durationSeconds: null, width: null, height: null })
    }
    video.src = URL.createObjectURL(file)
  })
}

export function UploadClipDialog({ open, onOpenChange, onUploaded }: UploadClipDialogProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { toast } = useToast()

  const [sports, setSports] = useState<SportOption[]>(DEFAULT_SPORT_OPTIONS)
  const [sportsLoading, setSportsLoading] = useState(false)
  const [selectedSportSlug, setSelectedSportSlug] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phase, setPhase] = useState<UploadProgressPhase>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false
    setSportsLoading(true)

    const loadSports = async () => {
      try {
        const { data, error } = await supabase.from('sports').select('slug, name').order('name', { ascending: true })
        if (cancelled) {
          return
        }
        if (error || !data?.length) {
          setSports(DEFAULT_SPORT_OPTIONS)
          return
        }
        const rows = Array.isArray(data) ? data : []
        const options = rows
          .map((row) => {
            const record = row as Record<string, unknown>
            if (typeof record.slug !== 'string' || typeof record.name !== 'string') {
              return null
            }
            return { slug: record.slug, name: record.name }
          })
          .filter((option): option is SportOption => option !== null)
        setSports(options)
      } catch (error) {
        console.error('[UploadClipDialog] load sports', error)
        if (!cancelled) {
          setSports(DEFAULT_SPORT_OPTIONS)
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(false)
        }
      }
    }

    loadSports()

    return () => {
      cancelled = true
    }
  }, [open, supabase])

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  const resetForm = useCallback(() => {
    setFile(null)
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
    }
    setFilePreview(null)
    setCaption('')
    setPhase('idle')
    setIsSubmitting(false)
    setErrorMessage(null)
    setSelectedSportSlug('')
  }, [filePreview])

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) {
      setFile(null)
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
        setFilePreview(null)
      }
      return
    }

    if (!isAcceptedFile(nextFile)) {
      toast({
        title: 'Unsupported file',
        description: 'Please upload an MP4 or MOV clip.',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: 'File too large',
        description: 'Clips must be 200MB or smaller.',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview)
    }

    setFile(nextFile)
    setFilePreview(URL.createObjectURL(nextFile))
    setErrorMessage(null)
  }

  const selectedSportName = useMemo(() => {
    const match = sports.find((option) => option.slug === selectedSportSlug)
    return match?.name ?? ''
  }, [selectedSportSlug, sports])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    if (!file) {
      setErrorMessage('Choose a clip to upload.')
      return
    }
    if (!selectedSportSlug) {
      setErrorMessage('Select a sport so we can tag your clip.')
      return
    }

    setIsSubmitting(true)
    setPhase('preparing')
    setErrorMessage(null)

    try {
      const metadataPromise = extractVideoMetadata(file)
      const signedUrlResponse = await fetch('/api/upload/create-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      const signedPayload = (await signedUrlResponse.json()) as ApiResponse<SignedUrlResponse>
      if (!signedPayload.ok) {
        throw new Error(signedPayload.error.message || 'Unable to initialise upload.')
      }

      setPhase('uploading')

      const uploadResponse = await fetch(signedPayload.data.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload clip to storage. Please try again.')
      }

      const metadata = await metadataPromise

      setPhase('saving')

      const clipResponse = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sportSlug: selectedSportSlug,
          storagePath: signedPayload.data.path,
          caption: caption ? caption.trim() : undefined,
          visibility: 'public',
          durationSeconds: metadata.durationSeconds ?? undefined,
          width: metadata.width ?? undefined,
          height: metadata.height ?? undefined,
        }),
      })

      const clipPayload = (await clipResponse.json()) as ApiResponse<UploadClipApiResponse>
      if (!clipPayload.ok) {
        throw new Error(clipPayload.error.message || 'Unable to save clip metadata.')
      }

      onUploaded({
        clip: clipPayload.data.clip,
        form: {
          caption,
          sportSlug: selectedSportSlug,
          sportName: selectedSportName || selectedSportSlug,
        },
      })
      onOpenChange(false)
      toast({
        title: 'Clip uploaded',
        description: 'Your highlight is live on the dashboard.',
      })
    } catch (error) {
      console.error('[UploadClipDialog] upload', error)
      const message =
        error instanceof Error ? error.message : 'We could not upload your clip. Please try again.'
      setErrorMessage(message)
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setPhase('idle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a training clip</DialogTitle>
          <DialogDescription>
            Share your latest highlight to motivate the team. We support MP4 and MOV files up to 200MB.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="clip-file">Clip file</Label>
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-4 text-sm">
              <Input
                id="clip-file"
                type="file"
                accept=".mp4,.mov,video/mp4,video/quicktime"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <p className="text-muted-foreground">
                Drag a file or click to browse. Max 200MB, MP4 or MOV formats recommended.
              </p>
              {file && (
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
                  <FileVideo2 className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type || 'video'}
                    </p>
                  </div>
                </div>
              )}
              {filePreview && (
                <video
                  className="w-full rounded-md border border-border"
                  src={filePreview}
                  controls
                  preload="metadata"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clip-sport">Sport</Label>
            <Select
              value={selectedSportSlug}
              onValueChange={setSelectedSportSlug}
              disabled={sportsLoading || isSubmitting}
            >
              <SelectTrigger id="clip-sport">
                <SelectValue placeholder={sportsLoading ? 'Loading sports...' : 'Choose a sport'} />
              </SelectTrigger>
              <SelectContent>
                {sports.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clip-caption">Caption</Label>
            <Textarea
              id="clip-caption"
              placeholder="Tell everyone what this drill focuses on..."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/500 characters
            </p>
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          {phase !== 'idle' && (
            <p className="text-sm text-muted-foreground">
              {phase === 'preparing' && 'Preparing your upload...'}
              {phase === 'uploading' && 'Uploading clip to storage...'}
              {phase === 'saving' && 'Saving clip details...'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload clip
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
