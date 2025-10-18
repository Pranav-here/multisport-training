"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { Sparkles, HelpCircle, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type QuickPostMood = "progress" | "question" | "celebration"

export interface QuickPostPayload {
  content: string
  mood: QuickPostMood | null
  tags: string[]
}

interface QuickPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: QuickPostPayload) => void | Promise<void>
  characterLimit?: number
  suggestedHashtag?: string
}

const DEFAULT_CHARACTER_LIMIT = 200

const moodOptions: Array<{
  value: QuickPostMood
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    value: "progress",
    label: "Progress update",
    description: "Share what you worked on today.",
    icon: Sparkles,
  },
  {
    value: "question",
    label: "Need tips",
    description: "Ask the community for advice.",
    icon: HelpCircle,
  },
  {
    value: "celebration",
    label: "Win to celebrate",
    description: "Log a milestone or breakthrough.",
    icon: Trophy,
  },
]

export function QuickPostDialog({
  open,
  onOpenChange,
  onSubmit,
  characterLimit = DEFAULT_CHARACTER_LIMIT,
  suggestedHashtag,
}: QuickPostDialogProps) {
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<QuickPostMood | null>("progress")
  const [helperMessage, setHelperMessage] = useState<string | null>(null)
  const [helperTone, setHelperTone] = useState<"info" | "error">("info")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setContent("")
      setMood("progress")
      setHelperMessage(null)
      setHelperTone("info")
      setIsSubmitting(false)
    }
  }, [open])

  const charactersUsed = content.length
  const remainingCharacters = characterLimit - charactersUsed
  const progressValue = useMemo(() => {
    const ratio = (charactersUsed / characterLimit) * 100
    return Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 100) : 0
  }, [charactersUsed, characterLimit])

  const hasContent = content.trim().length > 0

  const handleInsertHashtag = () => {
    if (!suggestedHashtag) {
      return
    }

    const alreadyPresent = content.includes(suggestedHashtag)
    if (alreadyPresent) {
      setHelperTone("info")
      setHelperMessage(`You've already added ${suggestedHashtag}.`)
      return
    }

    const contentWithSpace = content.trim().length > 0 ? `${content.trim()} ${suggestedHashtag}` : suggestedHashtag
    if (contentWithSpace.length > characterLimit) {
      setHelperTone("error")
      setHelperMessage("Adding the hashtag would exceed your 200 character limit.")
      return
    }

    setContent(contentWithSpace)
    setHelperTone("info")
    setHelperMessage(`${suggestedHashtag} added to your post.`)
  }

  const handleMoodSelect = (value: QuickPostMood) => {
    setMood((current) => (current === value ? null : value))
  }

  const extractTags = (text: string): string[] => {
    const matches = text.match(/#\w+/g)
    if (!matches) {
      return []
    }
    const seen = new Set<string>()
    const tags: string[] = []
    matches.forEach((tag) => {
      const normalized = tag.toLowerCase()
      if (seen.has(normalized)) {
        return
      }
      seen.add(normalized)
      tags.push(tag.slice(1))
    })
    return tags
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) {
      setHelperTone("error")
      setHelperMessage("Write a quick update before posting.")
      return
    }

    if (trimmed.length > characterLimit) {
      setHelperTone("error")
      setHelperMessage("Your update is too long. Trim it down to 200 characters.")
      return
    }

    const payload: QuickPostPayload = {
      content: trimmed,
      mood,
      tags: extractTags(trimmed),
    }

    try {
      setIsSubmitting(true)
      await Promise.resolve(onSubmit(payload))
      setContent("")
      setMood("progress")
      setHelperMessage(null)
      setHelperTone("info")
    } catch (error) {
      console.error("[QuickPostDialog] Failed to submit quick post", error)
      setHelperTone("error")
      setHelperMessage("We couldn't share that update. Please try again.")
      return
    } finally {
      setIsSubmitting(false)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Share a quick update</DialogTitle>
            <DialogDescription>Drop a fast note for your teammates. Keep it short and impactful.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quick-post-text">What&apos;s on your training mind?</Label>
              <span className={`text-xs ${remainingCharacters < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {remainingCharacters} left
              </span>
            </div>
            <Textarea
              id="quick-post-text"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Crushed a new drill? Need feedback? Post it here."
              maxLength={characterLimit}
              rows={4}
              className="rounded-xl border border-input/60 bg-background/80 px-4 py-3 text-base shadow-none focus-visible:border-sport-blue focus-visible:ring-sport-blue/40"
            />
            <Progress value={progressValue} className="h-1.5 rounded-full bg-muted/60" />
          </div>

          {suggestedHashtag && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-muted-foreground/20 bg-muted/10 px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Trending</span>
              <Badge
                variant="secondary"
                className="cursor-pointer rounded-full border border-sport-blue/40 bg-sport-blue/15 px-3 py-1 text-xs font-semibold text-sport-blue hover:bg-sport-blue/25"
                onClick={handleInsertHashtag}
                role="button"
              >
                {suggestedHashtag}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Set the tone</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {moodOptions.map((option) => {
                const Icon = option.icon
                const isSelected = mood === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleMoodSelect(option.value)}
                    className={cn(
                      "w-full rounded-xl border border-input/60 bg-background/70 px-4 py-3 text-left transition-all hover:border-sport-blue/40 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isSelected ? "border-sport-blue bg-sport-blue/10 shadow-sm" : "shadow-none",
                    )}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>{option.label}</span>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {helperMessage && (
            <p className={`text-sm ${helperTone === "error" ? "text-destructive" : "text-muted-foreground"}`}>
              {helperMessage}
            </p>
          )}

          <DialogFooter>
            <div className="flex w-full justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!hasContent || isSubmitting}>
                {isSubmitting ? "Posting..." : "Post update"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
