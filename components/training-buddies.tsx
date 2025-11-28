'use client'

import { useState } from 'react'
import { Users, MapPin, Clock, Calendar as CalendarIcon, Dumbbell, ChevronRight, Plus, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface TrainingBuddy {
  id: string
  name: string
  avatar: string
  sport: string
  location: string
  distance?: string
  nextSession?: {
    time: string
    date: string
  }
  availability: 'now' | 'today' | 'this-week'
  matchScore?: number
  commonSports?: string[]
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'tournament' | 'camp' | 'clinic' | 'scrimmage'
  sport: string
  date: string
  time: string
  location: string
  spotsLeft?: number
  price?: string
}

interface TrainingBuddiesProps {
  buddies?: TrainingBuddy[]
  upcomingEvents?: UpcomingEvent[]
  onFindPartners?: () => void
  onViewEvents?: () => void
  className?: string
  mode?: 'buddies' | 'events'
}

export function TrainingBuddies({
  buddies = [],
  upcomingEvents = [],
  onFindPartners,
  onViewEvents,
  className,
  mode = 'buddies'
}: TrainingBuddiesProps) {
  const [selectedMode, setSelectedMode] = useState<'buddies' | 'events'>(mode)
  const [expandedBuddy, setExpandedBuddy] = useState<string | null>(null)

  const availabilityColors = {
    now: 'bg-sport-green/15 text-sport-green border-sport-green/30',
    today: 'bg-sport-blue/15 text-sport-blue border-sport-blue/30',
    'this-week': 'bg-muted/40 text-muted-foreground border-border/40'
  }

  const availabilityLabels = {
    now: 'Available now',
    today: 'Later today',
    'this-week': 'This week'
  }

  const eventTypeColors = {
    tournament: 'from-sport-orange/20 to-sport-orange/5 text-sport-orange',
    camp: 'from-sport-blue/20 to-sport-blue/5 text-sport-blue',
    clinic: 'from-sport-green/20 to-sport-green/5 text-sport-green',
    scrimmage: 'from-purple-500/20 to-purple-500/5 text-purple-500'
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sport-green/5 via-transparent to-sport-blue/5 opacity-70" />

      <CardHeader className="relative z-10 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Users className="h-5 w-5 text-sport-green" />
            {selectedMode === 'buddies' ? 'Training Partners' : 'Upcoming Events'}
          </CardTitle>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1">
            <button
              onClick={() => setSelectedMode('buddies')}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                selectedMode === 'buddies'
                  ? "bg-sport-green text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Partners
            </button>
            <button
              onClick={() => setSelectedMode('events')}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                selectedMode === 'events'
                  ? "bg-sport-blue text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Events
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-3">
        {selectedMode === 'buddies' ? (
          <>
            {buddies.length > 0 ? (
              <div className="space-y-2">
                {buddies.slice(0, 3).map((buddy) => {
                  const isExpanded = expandedBuddy === buddy.id
                  return (
                    <div
                      key={buddy.id}
                      className="group/buddy overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-all duration-300 hover:border-sport-green/40 hover:bg-muted/30 hover:shadow-md"
                    >
                      <button
                        onClick={() => setExpandedBuddy(isExpanded ? null : buddy.id)}
                        className="w-full p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-background">
                              <AvatarImage src={buddy.avatar} alt={buddy.name} />
                              <AvatarFallback className="text-xs font-semibold">
                                {buddy.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {buddy.availability === 'now' && (
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-sport-green">
                                <div className="h-full w-full animate-ping rounded-full bg-sport-green" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground truncate">{buddy.name}</p>
                              {buddy.matchScore && buddy.matchScore >= 80 && (
                                <Badge variant="secondary" className="rounded-full bg-sport-orange/15 px-2 py-0 text-[10px] font-medium text-sport-orange">
                                  {buddy.matchScore}% match
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="rounded-full border-border/40 bg-background/50 px-2 py-0 text-[10px] text-muted-foreground">
                                {buddy.sport}
                              </Badge>
                              {buddy.distance && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {buddy.distance}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={cn("rounded-full px-2 py-1 text-[10px] font-medium", availabilityColors[buddy.availability])}>
                              {availabilityLabels[buddy.availability]}
                            </Badge>
                            <ChevronRight className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )} />
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/40 bg-muted/10 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          {buddy.nextSession && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 text-sport-blue" />
                              <span>Next session: {buddy.nextSession.date} at {buddy.nextSession.time}</span>
                            </div>
                          )}
                          {buddy.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-sport-orange" />
                              <span>{buddy.location}</span>
                            </div>
                          )}
                          {buddy.commonSports && buddy.commonSports.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {buddy.commonSports.map((sport, idx) => (
                                <Badge key={idx} variant="outline" className="rounded-full border-border/40 bg-background/50 px-2 py-0 text-[10px]">
                                  {sport}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" className="flex-1 h-8 rounded-full bg-gradient-to-r from-sport-green to-sport-blue text-xs text-white">
                              <Zap className="mr-1 h-3 w-3" />
                              Connect
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 rounded-full text-xs">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-foreground">No partners nearby</p>
                <p className="mt-1 text-xs text-muted-foreground">Try expanding your search radius</p>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full border-sport-green/40 bg-sport-green/5 text-foreground transition-all hover:border-sport-green hover:bg-sport-green/10"
              onClick={onFindPartners}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Find More Partners
            </Button>
          </>
        ) : (
          <>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="group/event overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-3 transition-all duration-300 hover:border-sport-blue/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gradient-to-r", eventTypeColors[event.type])}>
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-border/40 px-2 py-0 text-[10px] text-muted-foreground">
                            {event.sport}
                          </Badge>
                        </div>

                        <h4 className="text-sm font-semibold text-foreground leading-tight">{event.title}</h4>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{event.date} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {event.spotsLeft !== undefined && (
                            <span className="text-xs font-medium text-sport-orange">
                              {event.spotsLeft} spots left
                            </span>
                          )}
                          {event.price && (
                            <span className="text-xs font-semibold text-foreground">{event.price}</span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" className="h-8 rounded-full bg-gradient-to-r from-sport-blue to-sport-green text-xs text-white shadow-sm transition-all hover:shadow-md">
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium text-foreground">No upcoming events</p>
                <p className="mt-1 text-xs text-muted-foreground">Check back soon for new opportunities</p>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full border-sport-blue/40 bg-sport-blue/5 text-foreground transition-all hover:border-sport-blue hover:bg-sport-blue/10"
              onClick={onViewEvents}
            >
              <Dumbbell className="mr-1.5 h-4 w-4" />
              Browse All Events
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
