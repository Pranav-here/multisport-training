"use client"

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONTENT_TAGS } from '@/lib/discovery/constants'

interface CreatorInfoCardProps {
  // Athlete info
  athleteName: string
  athleteUsername: string
  athleteAvatar?: string
  athleteLocation?: string

  // Sponsored content
  isSponsored?: boolean
  sponsorName?: string
  sponsorLogo?: string

  // Content
  caption: string
  tags?: string[]

  // Actions
  onFollowClick?: () => void
}

export function CreatorInfoCard({
  athleteName,
  athleteUsername,
  athleteAvatar,
  athleteLocation,
  isSponsored = false,
  sponsorName,
  sponsorLogo,
  caption,
  tags = [],
  onFollowClick,
}: CreatorInfoCardProps) {
  if (isSponsored && sponsorName) {
    return (
      <div className="space-y-3">
        <Badge className="bg-yellow-500 text-black border-0 font-bold text-xs px-3 py-1 shadow-lg">
          SPONSORED
        </Badge>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-yellow-500 shadow-lg">
            <AvatarImage src={sponsorLogo} />
            <AvatarFallback className="bg-yellow-500 text-black font-bold">
              {sponsorName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-white text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {sponsorName}
            </h3>
            <p className="text-white/90 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Advertisement
            </p>
          </div>
        </div>
        <p className="text-white text-sm leading-relaxed line-clamp-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {caption}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Avatar and name row */}
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 border-2 border-white/40 shadow-lg flex-shrink-0">
          <AvatarImage src={athleteAvatar} />
          <AvatarFallback className="bg-sport-blue text-white font-semibold">
            {athleteName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-white text-base truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {athleteName}
            </h3>
            {onFollowClick && (
              <Button
                onClick={onFollowClick}
                size="sm"
                className="bg-sport-blue hover:bg-sport-blue/90 active:scale-95 text-white font-semibold rounded-full px-4 h-7 text-xs shadow-lg flex-shrink-0 transition-all duration-200 ease-out"
              >
                Follow
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <span>@{athleteUsername}</span>
            {athleteLocation && (
              <>
                <span>•</span>
                <span className="truncate">{athleteLocation}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {caption}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tagId) => {
            const tag = CONTENT_TAGS.find((t) => t.id === tagId)
            return tag ? (
              <Badge
                key={tagId}
                variant="secondary"
                className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] px-2 py-0.5 shadow-md"
              >
                <span className="mr-1">{tag.icon}</span>
                {tag.label}
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
