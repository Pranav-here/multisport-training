import { formatDistanceToNow } from 'date-fns'

import type { Post } from '@/lib/mock-data'

export type ClipUser = {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
}

export type ClipSport = {
  id: number | null
  slug: string | null
  name: string | null
} | null

export type ClipMetrics = {
  likesCount: number
  likedByUser: boolean
  commentsCount: number
}

export interface ClipApiResponse {
  id: string
  userId: string
  storagePath: string
  caption: string | null
  thumbnailUrl: string | null
  visibility: string
  createdAt: string
  durationSeconds: number | null
  width: number | null
  height: number | null
  sport: ClipSport
  user: ClipUser
  metrics: ClipMetrics
}

export function buildPublicClipUrl(base: string, storagePath: string | null | undefined): string {
  if (!base || !storagePath) {
    return ''
  }
  const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${sanitizedBase}/clips/${storagePath.replace(/^\//, '')}`
}

export function formatClipDuration(durationSeconds: number | null | undefined): string {
  const seconds = Number.isFinite(durationSeconds) && durationSeconds ? Math.max(durationSeconds, 0) : 0
  if (seconds <= 0) {
    return '0:15'
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function mapClipToPost(clip: ClipApiResponse, clipsPublicBase: string): Post {
  const videoUrl = buildPublicClipUrl(clipsPublicBase, clip.storagePath)
  const thumbnailUrl = clip.thumbnailUrl
    ? clip.thumbnailUrl.startsWith('http')
      ? clip.thumbnailUrl
      : buildPublicClipUrl(clipsPublicBase, clip.thumbnailUrl)
    : videoUrl

  return {
    id: clip.id,
    userId: clip.user.id,
    userName: clip.user.displayName ?? clip.user.username ?? 'Athlete',
    userAvatar: clip.user.avatarUrl ?? '/placeholder.svg',
    sport: clip.sport?.name ?? 'MultiSport',
    caption: clip.caption ?? '',
    tags: clip.sport?.slug ? [clip.sport.slug] : [],
    location: '',
    date: formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true }),
    duration: formatClipDuration(clip.durationSeconds),
    thumbnail: thumbnailUrl,
    videoUrl,
    likes: clip.metrics.likesCount,
    comments: clip.metrics.commentsCount,
    shares: 0,
    isLiked: clip.metrics.likedByUser,
    isSaved: false,
  }
}
