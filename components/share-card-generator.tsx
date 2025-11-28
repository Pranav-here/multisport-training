'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { trackShareClicked } from '@/lib/hashtag-analytics'

interface ShareCardGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'streak' | 'hashtag' | 'leaderboard' | 'badge'
  data: {
    title: string
    subtitle?: string
    primaryStat?: { label: string; value: string | number }
    secondaryStat?: { label: string; value: string | number }
    hashtagTag?: string
    rank?: number
    icon?: React.ReactNode
    gradient?: string
  }
}

export function ShareCardGenerator({ open, onOpenChange, type, data }: ShareCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const gradient =
    data.gradient ||
    (type === 'streak'
      ? 'from-sport-orange via-sport-red to-sport-orange'
      : type === 'hashtag'
        ? 'from-sport-blue via-sport-green to-sport-blue'
        : type === 'leaderboard'
          ? 'from-amber-400 via-amber-500 to-amber-600'
          : 'from-sport-green via-sport-blue to-sport-purple')

  const downloadImage = async () => {
    if (!cardRef.current) return

    try {
      setDownloading(true)

      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      })

      const link = document.createElement('a')
      link.download = `athletiq-${type}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      toast({
        title: 'Image downloaded!',
        description: 'Your share card has been saved.',
      })

      trackShareClicked(data.hashtagTag || 'achievement', 'download')
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast({
        title: 'Download failed',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!cardRef.current) return

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      })

      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ])

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: 'Copied to clipboard!',
        description: 'Paste your share card anywhere.',
      })

      trackShareClicked(data.hashtagTag || 'achievement', 'clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Copy failed',
        description: 'Please try downloading instead.',
        variant: 'destructive',
      })
    }
  }

  const shareNative = async () => {
    if (!cardRef.current) return

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `athletiq-${type}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: data.title,
          text: `Check out my ${type} on AthletIQ!`,
          files: [file],
        })

        trackShareClicked(data.hashtagTag || 'achievement', 'native')
      } else {
        // Fallback to download
        await downloadImage()
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>Download or share your card on social media</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div
            ref={cardRef}
            className="relative aspect-[1.91/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-black via-gray-900 to-black p-8"
          >
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />

            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {data.hashtagTag && (
                    <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                      {data.hashtagTag}
                    </div>
                  )}
                  <h2 className="text-4xl font-bold text-white">{data.title}</h2>
                  {data.subtitle && <p className="text-lg text-white/80">{data.subtitle}</p>}
                </div>
                {data.icon && <div className="text-6xl">{data.icon}</div>}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                {data.primaryStat && (
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-white/60">{data.primaryStat.label}</p>
                    <p className={`text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                      {data.primaryStat.value}
                    </p>
                  </div>
                )}
                {data.secondaryStat && (
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-white/60">{data.secondaryStat.label}</p>
                    <p className="text-3xl font-bold text-white">{data.secondaryStat.value}</p>
                  </div>
                )}
                {data.rank && (
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wider text-white/60">Global Rank</p>
                    <p className="text-5xl font-bold text-amber-400">#{data.rank}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sport-blue to-sport-green">
                    <span className="text-2xl font-bold text-white">A</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">AthletIQ</p>
                    <p className="text-sm text-white/60">Multi-Sport Training</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-white/80">athletiq.app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={downloadImage}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-sport-blue to-sport-green"
              onClick={shareNative}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
