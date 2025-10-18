import type { ClipApiResponse } from '@/lib/clips'

const STORAGE_PREFIX = 'athletiqs-training'
const DASHBOARD_CLIPS_KEY = `${STORAGE_PREFIX}:dashboard:clips`
const DASHBOARD_QUICK_POSTS_KEY = `${STORAGE_PREFIX}:dashboard:quick-posts`
const STORAGE_VERSION = 1
const QUICK_POST_STORAGE_VERSION = 1
const QUICK_POST_STORAGE_LIMIT = 20

export interface StoredQuickPost {
  id: string
  content: string
  createdAt: string
  mood: string | null
  tags: string[]
  schemaVersion: number
}

export type StoredClip = ClipApiResponse & {
  schemaVersion: number
}

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safelyParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn('[localStorage] Failed to parse value', error)
    return fallback
  }
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowserEnvironment()) {
    return fallback
  }
  const value = window.localStorage.getItem(key)
  return safelyParse(value, fallback)
}

function writeToStorage<T>(key: string, value: T) {
  if (!isBrowserEnvironment()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('[localStorage] Failed to persist value', error)
  }
}

export function loadStoredClips(): StoredClip[] {
  const stored = readFromStorage<unknown>(DASHBOARD_CLIPS_KEY, [])
  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter((item): item is StoredClip => {
    if (!item || typeof item !== 'object') {
      return false
    }
    return (item as { schemaVersion?: number }).schemaVersion === STORAGE_VERSION
  })
}

export function saveStoredClips(clips: StoredClip[]): void {
  writeToStorage(DASHBOARD_CLIPS_KEY, clips)
}

export function addStoredClip(clip: ClipApiResponse): StoredClip[] {
  const storedClip: StoredClip = {
    ...clip,
    schemaVersion: STORAGE_VERSION,
  }

  const existing = loadStoredClips().filter((item) => item.id !== storedClip.id)
  const updated = [storedClip, ...existing]
  saveStoredClips(updated)
  return updated
}

export function removeStoredClip(clipId: string): StoredClip[] {
  const updated = loadStoredClips().filter((clip) => clip.id !== clipId)
  saveStoredClips(updated)
  return updated
}

export function clearStoredClips(): void {
  if (!isBrowserEnvironment()) {
    return
  }
  window.localStorage.removeItem(DASHBOARD_CLIPS_KEY)
}

export function storedClipToClip(storedClip: StoredClip): ClipApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { schemaVersion: _schemaVersion, ...clip } = storedClip
  return clip
}

export function loadStoredQuickPosts(): StoredQuickPost[] {
  const stored = readFromStorage<unknown>(DASHBOARD_QUICK_POSTS_KEY, [])
  if (!Array.isArray(stored)) {
    return []
  }

  return stored.filter((item): item is StoredQuickPost => {
    if (!item || typeof item !== "object") {
      return false
    }
    const candidate = item as Partial<StoredQuickPost>
    return candidate.schemaVersion === QUICK_POST_STORAGE_VERSION && typeof candidate.content === "string"
  })
}

export function saveStoredQuickPosts(posts: StoredQuickPost[]): void {
  writeToStorage(
    DASHBOARD_QUICK_POSTS_KEY,
    posts.map((post) => ({
      ...post,
      schemaVersion: QUICK_POST_STORAGE_VERSION,
    })),
  )
}

export function addStoredQuickPost(post: Omit<StoredQuickPost, "schemaVersion">): StoredQuickPost[] {
  const entry: StoredQuickPost = {
    ...post,
    schemaVersion: QUICK_POST_STORAGE_VERSION,
  }
  const existing = loadStoredQuickPosts().filter((item) => item.id !== entry.id)
  const updated = [entry, ...existing].slice(0, QUICK_POST_STORAGE_LIMIT)
  saveStoredQuickPosts(updated)
  return updated
}
