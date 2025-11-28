export type ContentRating = 'sfw' | 'nsfw' | 'wholesome'
export type SportLevel =
  | 'little_league'
  | 'youth'
  | 'middle_school'
  | 'high_school'
  | 'college'
  | 'amateur'
  | 'professional'
  | 'olympic'

export type RegionScope = 'local' | 'regional' | 'national' | 'international'

export interface UserDiscoveryPreferences {
  id: string
  userId: string
  contentRatings: ContentRating[]
  showWholesome: boolean
  showNsfw: boolean
  regionScope: RegionScope
  preferredRegions: string[]
  favoriteSports: string[]
  favoriteTeams: string[]
  preferredLevels: SportLevel[]
  autoPlay: boolean
  showLiveStreams: boolean
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  slug: string
  sportId?: number
  sportName?: string
  city?: string
  state?: string
  country: string
  region?: string
  level: SportLevel
  division?: string
  logoUrl?: string
  colors?: string[]
  foundedYear?: number
  homeVenue?: string
}

export interface CheerBadge {
  id: string
  name: string
  slug: string
  emoji: string
  iconUrl?: string
  teamId?: string
  sportId?: number
  region?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockRequirement?: string
}

export interface ClipReaction {
  id: string
  clipId: string
  userId: string
  badgeId: string
  badge: CheerBadge
  createdAt: string
}

export interface Comment {
  id: string
  clipId: string
  userId: string
  parentId?: string
  content: string
  isHidden: boolean
  isPinned: boolean
  flaggedCount: number
  likesCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    displayName: string
    username: string
    avatarUrl?: string
  }
  replies?: Comment[]
}

export interface LiveStream {
  id: string
  title: string
  description?: string
  streamUrl: string
  thumbnailUrl?: string
  provider?: string
  providerStreamId?: string
  sportId?: number
  sportName?: string
  teamHomeId?: string
  teamAwayId?: string
  teamHome?: Team
  teamAway?: Team
  venue?: string
  region?: string
  sportLevel?: SportLevel
  status: 'scheduled' | 'live' | 'ended'
  scheduledStart?: string
  actualStart?: string
  endedAt?: string
  viewerCount: number
  peakViewers: number
  createdAt: string
  updatedAt: string
}

export interface AthleteStats {
  id: string
  userId: string
  sportId: number
  sportName?: string
  season?: string
  stats: Record<string, number | string>
  championships: number
  awards: string[]
  teamId?: string
  team?: Team
  createdAt: string
  updatedAt: string
}

export interface DiscoveryClip {
  id: string
  videoUrl: string
  thumbnailUrl?: string
  caption: string

  // Athlete info
  athleteId: string
  athleteName: string
  athleteUsername: string
  athleteAvatar?: string
  athleteAge?: number
  athleteLocation?: string

  // Content classification
  sport: string
  sportId?: number
  contentRating: ContentRating
  isWholesome: boolean
  sportLevel?: SportLevel
  teamId?: string
  team?: Team
  region?: string
  division?: string

  // Engagement
  upvotes: number
  comments: number
  shares: number
  views: number
  hasUpvoted: boolean
  isBookmarked: boolean
  reactions?: ClipReaction[]

  // Tags
  tags: string[]

  // Sponsored content
  isSponsored: boolean
  sponsorName?: string
  sponsorLogo?: string

  createdAt: string
  updatedAt?: string
}

export interface DiscoveryFeedFilters {
  sports?: string[]
  teams?: string[]
  regions?: string[]
  levels?: SportLevel[]
  contentRatings?: ContentRating[]
  showWholesome?: boolean
  showNsfw?: boolean
  regionScope?: RegionScope
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface OnboardingData {
  favoriteSports: string[]
  favoriteTeams: string[]
  preferredRegions: string[]
  preferredLevels: SportLevel[]
  regionScope: RegionScope
  contentPreferences: {
    showWholesome: boolean
    showNsfw: boolean
  }
}
