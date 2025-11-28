// Adapter to convert old discovery clips to new format
import { MOCK_DISCOVERY_CLIPS as OLD_CLIPS } from './mock-data'
import { mockPosts } from '../mock-data'

interface NewDiscoveryClip {
  id: string
  videoUrl: string
  thumbnailUrl?: string
  caption: string
  athleteId: string
  athleteName: string
  athleteUsername: string
  athleteAvatar?: string
  athleteAge?: number
  athleteLocation?: string
  sport: string
  sportId?: number
  contentRating: 'sfw' | 'nsfw' | 'wholesome'
  isWholesome: boolean
  sportLevel?: string
  teamId?: string
  region?: string
  division?: string
  upvotes: number
  comments: number
  shares: number
  views: number
  hasUpvoted: boolean
  isBookmarked: boolean
  reactions?: any[]
  tags: string[]
  isSponsored: boolean
  sponsorName?: string
  sponsorLogo?: string
  createdAt: string
  updatedAt?: string
}

// Convert old clips to new format
export function convertClips(): NewDiscoveryClip[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return OLD_CLIPS.map((clip: any) => ({
    id: clip.id,
    videoUrl: clip.videoUrl,
    thumbnailUrl: clip.thumbnailUrl,
    caption: clip.caption,
    athleteId: clip.athleteId,
    athleteName: clip.athleteName,
    athleteUsername: clip.athleteId, // use athleteId as username fallback
    athleteAvatar: clip.athleteAvatar,
    athleteAge: clip.athleteAge || 17,
    athleteLocation: clip.athleteLocation,
    sport: clip.sport?.toLowerCase() || 'basketball',
    sportId: 1,
    contentRating: determineContentRating(clip),
    isWholesome: isWholesomeClip(clip),
    sportLevel: 'high_school',
    region: 'midwest',
    upvotes: clip.upvotes || 0,
    comments: clip.upvotes ? Math.floor(clip.upvotes / 10) : 0,
    shares: clip.upvotes ? Math.floor(clip.upvotes / 30) : 0,
    views: clip.views || 0,
    hasUpvoted: false,
    isBookmarked: false,
    tags: clip.tags || [],
    isSponsored: clip.isSponsored || false,
    sponsorName: clip.sponsorName,
    sponsorLogo: clip.sponsorLogo,
    createdAt: clip.createdAt,
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineContentRating(clip: any): 'sfw' | 'nsfw' | 'wholesome' {
  if (clip.tags?.includes('sportsmanship') || clip.tags?.includes('inclusive')) {
    return 'wholesome'
  }
  return 'sfw'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isWholesomeClip(clip: any): boolean {
  return clip.tags?.includes('sportsmanship') || clip.tags?.includes('inclusive') || false
}

// Sponsored Ads
const SPONSORED_ADS: NewDiscoveryClip[] = [
  {
    id: 'ad-nike-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: '/placeholder.svg',
    caption: 'Train like a champion with Nike Pro. Elite performance starts with elite gear. Get 20% off with code ATHLETE20',
    athleteId: 'sponsor-nike',
    athleteName: 'Nike',
    athleteUsername: '@nike',
    athleteAvatar: 'https://logo.clearbit.com/nike.com',
    sport: 'Sponsored',
    sportId: 999,
    contentRating: 'sfw',
    isWholesome: false,
    sportLevel: 'professional',
    upvotes: 1234,
    comments: 45,
    shares: 89,
    views: 54321,
    hasUpvoted: false,
    isBookmarked: false,
    tags: [],
    isSponsored: true,
    sponsorName: 'Nike',
    sponsorLogo: 'https://logo.clearbit.com/nike.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad-gatorade-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: '/placeholder.svg',
    caption: 'Fuel your game with Gatorade. The choice of champions for over 50 years. Available in 20+ flavors!',
    athleteId: 'sponsor-gatorade',
    athleteName: 'Gatorade',
    athleteUsername: '@gatorade',
    athleteAvatar: 'https://logo.clearbit.com/gatorade.com',
    sport: 'Sponsored',
    sportId: 999,
    contentRating: 'sfw',
    isWholesome: false,
    sportLevel: 'professional',
    upvotes: 892,
    comments: 23,
    shares: 34,
    views: 32190,
    hasUpvoted: false,
    isBookmarked: false,
    tags: [],
    isSponsored: true,
    sponsorName: 'Gatorade',
    sponsorLogo: 'https://logo.clearbit.com/gatorade.com',
    createdAt: new Date().toISOString(),
  },
]

// Convert top posts from dashboard mock data
function convertTopPosts(): NewDiscoveryClip[] {
  // Take first 4 posts from mockPosts (these are "top posts today")
  return mockPosts.slice(0, 4).map((post) => ({
    id: `top-${post.id}`,
    videoUrl: post.videoUrl,
    thumbnailUrl: post.thumbnail,
    caption: post.caption,
    athleteId: post.userId,
    athleteName: post.userName,
    athleteUsername: `@${post.userName.toLowerCase().replace(/\s+/g, '')}`,
    athleteAvatar: post.userAvatar,
    athleteAge: 17,
    athleteLocation: post.location,
    sport: post.sport,
    sportId: 1,
    contentRating: 'sfw' as const,
    isWholesome: true,
    sportLevel: 'high_school',
    region: 'midwest',
    upvotes: post.likes,
    comments: post.comments,
    shares: post.shares,
    views: post.likes * 25, // Estimate views as 25x likes
    hasUpvoted: post.isLiked,
    isBookmarked: post.isSaved,
    tags: post.tags,
    isSponsored: false,
    createdAt: new Date().toISOString(),
  }))
}

// Mix sponsored ads into the feed (every 4th clip after top posts)
function insertSponsoredAds(clips: NewDiscoveryClip[]): NewDiscoveryClip[] {
  const topPosts = convertTopPosts()
  const result: NewDiscoveryClip[] = [...topPosts] // Start with top 4 posts
  let adIndex = 0

  // After top 4 posts, insert Nike ad
  result.push(SPONSORED_ADS[0])
  adIndex++

  // Then continue with regular clips and insert more ads
  clips.forEach((clip, index) => {
    result.push(clip)

    // Insert ad every 5 clips (after the first Nike ad)
    if ((index + 1) % 5 === 0 && adIndex < SPONSORED_ADS.length) {
      result.push(SPONSORED_ADS[adIndex])
      adIndex++
    }
  })

  return result
}

export const CONVERTED_CLIPS = insertSponsoredAds(convertClips())
