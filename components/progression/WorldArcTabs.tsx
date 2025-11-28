'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { World } from '@/lib/progression/types'
import { cn } from '@/lib/utils'

interface WorldArcTabsProps {
  worlds: World[]
  selectedWorldId: string
  onValueChange: (worldId: string) => void
  arcPercent?: Record<string, number>
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

export function WorldArcTabs({
  worlds,
  selectedWorldId,
  onValueChange,
  arcPercent = {},
  orientation = 'vertical',
  className,
}: WorldArcTabsProps) {
  return (
    <Tabs
      value={selectedWorldId}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn('w-full', className)}
      activationMode="manual"
    >
      <TabsList
        className={cn(
          'grid gap-2 bg-transparent p-0',
          orientation === 'vertical' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3',
        )}
        aria-label="World arcs"
      >
        {worlds.map((world) => (
          <TabsTrigger
            key={world.id}
            value={world.id}
            className="group flex flex-col items-start gap-1 rounded-2xl border border-transparent bg-white/5 px-4 py-3 text-left text-sm font-semibold text-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[state=active]:border-sport-blue/40 data-[state=active]:bg-sport-blue/15 data-[state=active]:text-sport-blue"
            aria-label={`${world.title} levels ${world.range[0]} to ${world.range[1]}`}
          >
            <span className="flex w-full items-center justify-between">
              {world.title}
              <Badge
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground"
              >
                Lv {world.range[0]}-{world.range[1]}
              </Badge>
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round((arcPercent[world.id] ?? 0) * 100)}% complete
            </span>
            <Progress
              value={(arcPercent[world.id] ?? 0) * 100}
              className="h-2 w-full overflow-hidden rounded-full bg-white/10 transition-all duration-200 group-data-[state=active]:bg-sport-blue/20"
            />
          </TabsTrigger>
        ))}
      </TabsList>
      {worlds.map((world) => (
        <TabsContent key={world.id} value={world.id} className="mt-6">
          {/* intentionally empty: grid sits adjacent */}
        </TabsContent>
      ))}
    </Tabs>
  )
}
