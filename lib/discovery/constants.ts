import { SportLevel, ContentRating, RegionScope } from './types'

export const SPORT_LEVELS: { value: SportLevel; label: string; description: string }[] = [
  {
    value: 'little_league',
    label: 'Little League',
    description: 'Youth sports, ages 5-12',
  },
  {
    value: 'youth',
    label: 'Youth Sports',
    description: 'Organized youth leagues, ages 8-14',
  },
  {
    value: 'middle_school',
    label: 'Middle School',
    description: 'Middle school athletics, ages 11-14',
  },
  {
    value: 'high_school',
    label: 'High School',
    description: 'High school sports & tournaments',
  },
  {
    value: 'college',
    label: 'College',
    description: 'NCAA, NAIA, NJCAA athletics',
  },
  {
    value: 'amateur',
    label: 'Amateur',
    description: 'Adult amateur leagues',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Pro leagues (NBA, NFL, MLB, etc.)',
  },
  {
    value: 'olympic',
    label: 'Olympic',
    description: 'Olympic & international competition',
  },
]

export const REGION_SCOPES: { value: RegionScope; label: string; description: string }[] = [
  {
    value: 'local',
    label: 'Local',
    description: 'Your city and surrounding areas',
  },
  {
    value: 'regional',
    label: 'Regional',
    description: 'Your state and neighboring regions',
  },
  {
    value: 'national',
    label: 'National',
    description: 'All across the country',
  },
  {
    value: 'international',
    label: 'International',
    description: 'Sports from around the world',
  },
]

export const US_REGIONS = [
  { value: 'northeast', label: 'Northeast', states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'] },
  { value: 'midwest', label: 'Midwest', states: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'] },
  { value: 'south', label: 'South', states: ['DE', 'MD', 'VA', 'WV', 'KY', 'NC', 'SC', 'TN', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'] },
  { value: 'southwest', label: 'Southwest', states: ['OK', 'TX', 'NM', 'AZ'] },
  { value: 'west', label: 'West', states: ['MT', 'ID', 'WY', 'CO', 'UT', 'NV', 'CA', 'OR', 'WA', 'AK', 'HI'] },
]

export const CONTENT_RATINGS: { value: ContentRating; label: string; description: string; icon: string }[] = [
  {
    value: 'sfw',
    label: 'Safe for Work',
    description: 'Family-friendly sports content',
    icon: '✅',
  },
  {
    value: 'wholesome',
    label: 'Wholesome Moments',
    description: 'Inspiring & heartwarming stories',
    icon: '💝',
  },
  {
    value: 'nsfw',
    label: 'NSFW',
    description: 'Fighting sports, blood, intense moments',
    icon: '⚠️',
  },
]

export const POPULAR_SPORTS = [
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'football', name: 'Football', icon: '🏈' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'track', name: 'Track & Field', icon: '🏃' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'wrestling', name: 'Wrestling', icon: '🤼' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
  { id: 'lacrosse', name: 'Lacrosse', icon: '🥍' },
  { id: 'golf', name: 'Golf', icon: '⛳' },
  { id: 'gymnastics', name: 'Gymnastics', icon: '🤸' },
  { id: 'rugby', name: 'Rugby', icon: '🏉' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'boxing', name: 'Boxing', icon: '🥊' },
  { id: 'mma', name: 'MMA', icon: '🥋' },
  { id: 'skateboarding', name: 'Skateboarding', icon: '🛹' },
  { id: 'surfing', name: 'Surfing', icon: '🏄' },
  { id: 'skiing', name: 'Skiing', icon: '⛷️' },
]

export const MAJOR_CITIES = [
  // Northeast
  { city: 'New York', state: 'NY', region: 'northeast' },
  { city: 'Boston', state: 'MA', region: 'northeast' },
  { city: 'Philadelphia', state: 'PA', region: 'northeast' },

  // Midwest
  { city: 'Chicago', state: 'IL', region: 'midwest' },
  { city: 'Detroit', state: 'MI', region: 'midwest' },
  { city: 'Minneapolis', state: 'MN', region: 'midwest' },
  { city: 'Cleveland', state: 'OH', region: 'midwest' },
  { city: 'Milwaukee', state: 'WI', region: 'midwest' },
  { city: 'Indianapolis', state: 'IN', region: 'midwest' },
  { city: 'Kansas City', state: 'MO', region: 'midwest' },
  { city: 'St. Louis', state: 'MO', region: 'midwest' },

  // South
  { city: 'Atlanta', state: 'GA', region: 'south' },
  { city: 'Miami', state: 'FL', region: 'south' },
  { city: 'Dallas', state: 'TX', region: 'southwest' },
  { city: 'Houston', state: 'TX', region: 'southwest' },
  { city: 'Charlotte', state: 'NC', region: 'south' },
  { city: 'Nashville', state: 'TN', region: 'south' },
  { city: 'New Orleans', state: 'LA', region: 'south' },

  // West
  { city: 'Los Angeles', state: 'CA', region: 'west' },
  { city: 'San Francisco', state: 'CA', region: 'west' },
  { city: 'San Diego', state: 'CA', region: 'west' },
  { city: 'Phoenix', state: 'AZ', region: 'southwest' },
  { city: 'Seattle', state: 'WA', region: 'west' },
  { city: 'Portland', state: 'OR', region: 'west' },
  { city: 'Denver', state: 'CO', region: 'west' },
  { city: 'Las Vegas', state: 'NV', region: 'west' },
]

export const CONTENT_TAGS = [
  { id: 'highlight', label: 'Highlight', icon: '⭐', color: 'bg-yellow-500' },
  { id: 'game-winning', label: 'Game Winner', icon: '🏆', color: 'bg-green-500' },
  { id: 'clutch', label: 'Clutch', icon: '🔥', color: 'bg-orange-500' },
  { id: 'training', label: 'Training', icon: '💪', color: 'bg-blue-500' },
  { id: 'tutorial', label: 'Tutorial', icon: '📚', color: 'bg-purple-500' },
  { id: 'funny', label: 'Funny', icon: '😂', color: 'bg-pink-500' },
  { id: 'fail', label: 'Epic Fail', icon: '😅', color: 'bg-red-500' },
  { id: 'comeback', label: 'Comeback', icon: '📈', color: 'bg-teal-500' },
  { id: 'rookie', label: 'Rookie', icon: '🌟', color: 'bg-indigo-500' },
  { id: 'veteran', label: 'Veteran', icon: '👑', color: 'bg-amber-500' },
]

export const LIVE_STREAM_PROVIDERS = [
  { id: 'espn', name: 'ESPN', logo: '/providers/espn.svg' },
  { id: 'abc', name: 'ABC Sports', logo: '/providers/abc.svg' },
  { id: 'nbc', name: 'NBC Sports', logo: '/providers/nbc.svg' },
  { id: 'fox', name: 'FOX Sports', logo: '/providers/fox.svg' },
  { id: 'cbs', name: 'CBS Sports', logo: '/providers/cbs.svg' },
  { id: 'meta', name: 'Meta', logo: '/providers/meta.svg' },
  { id: 'youtube', name: 'YouTube Sports', logo: '/providers/youtube.svg' },
  { id: 'twitch', name: 'Twitch', logo: '/providers/twitch.svg' },
]

export const DEFAULT_PREFERENCES: Partial<Omit<import('./types').UserDiscoveryPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> = {
  contentRatings: ['sfw', 'wholesome'],
  showWholesome: true,
  showNsfw: false,
  regionScope: 'national',
  preferredRegions: [],
  favoriteSports: [],
  favoriteTeams: [],
  preferredLevels: ['high_school', 'college', 'professional'],
  autoPlay: true,
  showLiveStreams: true,
}
