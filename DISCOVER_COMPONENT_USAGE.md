# Discover/Reels Components - Usage Guide

## Component Architecture

The Discover/Reels screen is now built with modular, reusable components that follow a clean separation of concerns.

## Component Tree

```
DiscoveryPage
├── DiscoverHeader
│   ├── Logo (Sparkles icon)
│   ├── Title + LIVE badge
│   ├── View mode toggle (Reels/Live)
│   └── Settings button
│
└── ReelsFeed
    ├── Video player (full bleed)
    ├── Gradient overlays (top + bottom)
    ├── Volume control (top-right)
    ├── Navigation arrows (desktop only)
    ├── CreatorInfoCard (bottom-left)
    ├── RightActionRail (bottom-right)
    ├── Progress indicator (vertical dots)
    ├── Swipe hint (mobile, first clip)
    ├── CommentsDrawer (modal)
    └── EmojiBadgePicker (modal)
```

---

## Components

### 1. DiscoverHeader

**Purpose**: Top navigation bar with branding, mode switching, and settings access

**Props**:
```typescript
interface DiscoverHeaderProps {
  viewMode: 'reels' | 'live'
  isLiveFeed?: boolean  // Shows LIVE badge if true
  onViewModeChange: (mode: 'reels' | 'live') => void
  onSettingsClick: () => void
}
```

**Usage**:
```tsx
<DiscoverHeader
  viewMode={viewMode}
  isLiveFeed={true}
  onViewModeChange={setViewMode}
  onSettingsClick={() => setShowSettings(true)}
/>
```

**Features**:
- Responsive: Icon-only on mobile, full labels on desktop
- LIVE badge animates with pulse effect
- Proper z-index (50) to stay above all content
- Gradient background for visibility
- Minimal horizontal padding to avoid overflow

---

### 2. RightActionRail

**Purpose**: Vertical action buttons for like, comment, cheer, bookmark, share

**Props**:
```typescript
interface RightActionRailProps {
  upvotes: number
  comments: number
  shares: number
  cheerCount?: number  // Defaults to 0
  hasUpvoted: boolean
  isBookmarked: boolean
  showCheer?: boolean  // Defaults to true
  onUpvote: () => void
  onComment: () => void
  onShare: () => void
  onBookmark: () => void
  onCheer?: () => void
}
```

**Usage**:
```tsx
<RightActionRail
  upvotes={currentState.upvotes}
  comments={currentState.comments}
  shares={currentState.shares}
  cheerCount={currentClip.reactions?.length || 0}
  hasUpvoted={currentState.hasUpvoted}
  isBookmarked={currentState.isBookmarked}
  onUpvote={handleUpvote}
  onComment={handleComment}
  onShare={handleShare}
  onBookmark={handleBookmark}
  onCheer={handleAddReaction}
/>
```

**Features**:
- Positioned at bottom-right (not floating in middle)
- All buttons show counts below icons
- Cheer button shows count, not "Cheer" text
- Backdrop blur for visibility on any background
- Smooth hover animations (scale + brightness)
- Active states with color changes
- Responsive sizing (48px mobile, 56px desktop)

---

### 3. CreatorInfoCard

**Purpose**: Display creator info, caption, and follow button

**Props**:
```typescript
interface CreatorInfoCardProps {
  athleteName: string
  athleteUsername: string
  athleteAvatar?: string
  athleteLocation?: string

  isSponsored?: boolean
  sponsorName?: string
  sponsorLogo?: string

  caption: string
  tags?: string[]  // Tag IDs from CONTENT_TAGS

  onFollowClick?: () => void
}
```

**Usage**:
```tsx
<CreatorInfoCard
  athleteName="Alex Chen"
  athleteUsername="alex_chen"
  athleteAvatar="/avatars/alex.jpg"
  athleteLocation="Lincoln High School"
  caption="Working on my first touch control! Finally getting consistent with both feet 🔥"
  tags={['first-touch-friday', 'skill-development']}
  onFollowClick={() => {
    toast({ title: 'Following Alex Chen!' })
  }}
/>
```

**Features**:
- Two layouts: regular athlete vs sponsored content
- Avatar + name + Follow button on first line
- Handle and location on second line
- Caption with 2-line clamp for long text
- Shows first 3 tags maximum
- All text has drop shadows for readability
- Truncates gracefully on small screens

---

### 4. ReelsFeed

**Purpose**: Main video feed with swipe navigation and controls

**Props**:
```typescript
interface ReelsFeedProps {
  clips: DiscoveryClip[]
  autoPlay?: boolean  // Defaults to true
  onClipChange?: (index: number) => void
}
```

**Usage**:
```tsx
<ReelsFeed
  clips={filteredClips}
  autoPlay={true}
  onClipChange={(index) => {
    console.log('Viewing clip:', index)
    trackAnalytics('clip_view', { clipIndex: index })
  }}
/>
```

**Features**:
- Full-screen video player
- Swipe navigation (mobile/tablet)
- Keyboard navigation (↑↓ arrows, M for mute)
- Mouse wheel navigation (desktop)
- Auto-play with muting
- Video click to play/pause
- Smooth transitions between clips
- Progress indicator (vertical dots)
- Desktop navigation arrows (left side)

**Keyboard Shortcuts**:
- `↑` - Previous clip
- `↓` - Next clip
- `M` - Toggle mute

---

## Layout System

### Z-Index Hierarchy
```
z-50  Header, dev tools
z-40  Clips counter
z-30  Action rail, creator card, navigation, progress
z-20  Gradient overlays, swipe hint
z-10  Video content (active)
```

### Gradient Overlays

The ReelsFeed uses a dual-gradient system for optimal readability:

**Top Gradient** (Header area):
- Height: 128px (32)
- From: `black/70` → `black/30` → transparent
- Purpose: Ensure header is visible

**Bottom Gradient** (Creator area):
- Height: 256px (64) - about 30% of screen
- From: `black/95` → `black/60` → transparent
- Purpose: Make captions readable over bright backgrounds

### Responsive Breakpoints

**Mobile** (< 640px):
```css
- Action rail: 12px from right, 128px from bottom
- Creator card: 16px padding, pb-12
- Navigation arrows: Hidden
- Progress dots: More subtle
- Toggle: Icon only
```

**Desktop** (≥ 1024px):
```css
- Action rail: 20px from right, 112px from bottom
- Creator card: Max-width 576px
- Navigation arrows: Visible on left
- Progress dots: Full size
- Toggle: Full labels
```

---

## Best Practices

### 1. Handling Empty States

```tsx
if (clips.length === 0) {
  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <p className="text-white/60">No clips available</p>
        <p className="text-sm text-white/40">Adjust your filters</p>
      </div>
    </div>
  )
}
```

### 2. State Management

The ReelsFeed maintains its own state for:
- Current clip index
- Mute status
- Like/bookmark states
- Modal visibility

Parent components should only provide:
- Clip data
- Event handlers for analytics

### 3. Performance

**Video Loading**:
- Only 3 videos are rendered at a time (prev, current, next)
- Videos are paused when not active
- Poster images for instant load

**Transitions**:
- Throttled scroll events (800ms)
- Disabled interactions during transitions
- GPU-accelerated transforms

### 4. Accessibility

**ARIA Labels**:
```tsx
<button aria-pressed={viewMode === 'reels'}>Reels</button>
<button aria-label={`Go to clip ${index + 1}`}>•</button>
```

**Keyboard Navigation**:
- All interactive elements are keyboard accessible
- Focus indicators on all buttons
- Logical tab order

**Touch Targets**:
- Minimum 44px × 44px for mobile
- Adequate spacing between buttons

---

## Theming

### Colors

The components use Tailwind CSS variables:

```css
--sport-blue: #3B82F6   /* Primary brand color */
--red-600: #DC2626      /* Active/live states */
--yellow-500: #EAB308   /* Sponsored/cheer */
```

### Customization

To customize colors, update your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'sport-blue': '#YOUR_COLOR',
      }
    }
  }
}
```

---

## Common Patterns

### Adding a New Action Button

1. Add to `RightActionRail` props:
```typescript
interface RightActionRailProps {
  // ... existing props
  reportCount?: number
  onReport?: () => void
}
```

2. Add button in component:
```tsx
<ActionButton
  icon={<Flag className="h-6 w-6" />}
  count={reportCount}
  onClick={onReport}
/>
```

### Customizing Gradients

Edit in `reels-feed.tsx`:
```tsx
<div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
```

Adjust:
- `h-64` - Height (256px)
- `black/95` - Bottom opacity (95%)
- `black/60` - Middle opacity (60%)

---

## Troubleshooting

### Issue: Action rail overlaps creator card on small screens

**Solution**: Increase `right-20 sm:right-28` spacing on creator card container

### Issue: Caption not readable on bright backgrounds

**Solution**: Increase bottom gradient opacity or height

### Issue: Follow button not clickable

**Solution**: Check z-index, ensure parent has `pointer-events-auto`

### Issue: Videos not auto-playing

**Solution**: Browsers block autoplay with sound. Ensure `muted={true}` is set

---

## Future Enhancements

Potential improvements for the component system:

1. **Virtualization**: For 100+ clips, use virtual scrolling
2. **Prefetching**: Preload next 2-3 videos for smoother experience
3. **Analytics**: Built-in view tracking and engagement metrics
4. **A/B Testing**: Component variants for experimentation
5. **Animations**: More sophisticated clip transitions (cube, flip)
6. **Gestures**: Pinch to zoom, double-tap to like
7. **Picture-in-Picture**: Continue watching while browsing

---

## Component API Summary

| Component | Size (lines) | Complexity | External Deps |
|-----------|-------------|-----------|---------------|
| DiscoverHeader | ~70 | Low | lucide-react, ui/button |
| RightActionRail | ~130 | Low | lucide-react |
| CreatorInfoCard | ~110 | Low | ui/avatar, ui/badge |
| ReelsFeed | ~580 | High | All above + drawers |

**Total**: ~890 lines of clean, documented code
