'use client'

import React from 'react'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { motion } from 'framer-motion'
import { Search, Filter, Lock, Play, CheckCircle2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Level, LevelStatus } from '@/lib/progression/types'
import { useMediaQuery } from '@/hooks/use-media-query'

interface LevelGridProps {
  levels: Level[]
  query: string
  difficultyFilter: number[]
  statusFilter: LevelStatus[]
  resultCount: number
  selectedLevelId: string | null
  onQueryChange: (query: string) => void
  onToggleDifficulty: (difficulty: number) => void
  onToggleStatus: (status: LevelStatus) => void
  onClearFilters: () => void
  onSelectLevel: (level: Level) => void
  loading?: boolean
}

const difficultyOptions = [1, 2, 3, 4, 5]
const statusOptions: LevelStatus[] = ['in_progress', 'unlocked', 'complete', 'locked']

export function LevelGrid({
  levels,
  query,
  difficultyFilter,
  statusFilter,
  resultCount,
  selectedLevelId,
  onQueryChange,
  onToggleDifficulty,
  onToggleStatus,
  onClearFilters,
  onSelectLevel,
  loading = false,
}: LevelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState<number>(-1)
  const [columnCount, setColumnCount] = useState<number>(4)
  const isTablet = useMediaQuery('(max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')

  const tileSize = isMobile ? 64 : isTablet ? 72 : 84
  const tileGap = isMobile ? 12 : 16
  const shouldVirtualize = useMemo(() => levels.length > columnCount * 6, [levels.length, columnCount])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        const cols = Math.max(1, Math.floor(width / (tileSize + tileGap)))
        setColumnCount(cols)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [tileSize, tileGap])

  useEffect(() => {
    if (levels.length === 0) {
      setFocusIndex(-1)
    } else if (selectedLevelId) {
      const index = levels.findIndex((level) => level.id === selectedLevelId)
      setFocusIndex(index)
    }
  }, [levels, selectedLevelId])

  const rowCount = Math.ceil(levels.length / columnCount)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => tileSize + tileGap,
    overscan: 6,
  })

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (levels.length === 0) {
        return
      }
      let nextIndex = focusIndex < 0 ? 0 : focusIndex
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = Math.min(levels.length - 1, nextIndex + 1)
          break
        case 'ArrowLeft':
          nextIndex = Math.max(0, nextIndex - 1)
          break
        case 'ArrowUp':
          nextIndex = Math.max(0, nextIndex - columnCount)
          break
        case 'ArrowDown':
          nextIndex = Math.min(levels.length - 1, nextIndex + columnCount)
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = levels.length - 1
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusIndex >= 0 && levels[focusIndex]) {
            onSelectLevel(levels[focusIndex])
          }
          return
        default:
          return
      }
      event.preventDefault()
      setFocusIndex(nextIndex)
      if (shouldVirtualize) {
        const rowIndex = Math.floor(nextIndex / columnCount)
        rowVirtualizer.scrollToIndex(rowIndex, { align: 'auto' })
      }
    },
    [focusIndex, levels, columnCount, onSelectLevel, rowVirtualizer, shouldVirtualize],
  )

  useEffect(() => {
    if (focusIndex < 0) return
    const button = containerRef.current?.querySelector<HTMLButtonElement>(`[data-index="${focusIndex}"]`)
    button?.focus({ preventScroll: true })
  }, [focusIndex])

  const handleTileFocus = (index: number) => {
    setFocusIndex(index)
  }

  const renderTile = (level: Level, index: number) => {
    const isSelected = level.id === selectedLevelId
    const isComplete = level.status === 'complete'
    const isLocked = level.status === 'locked'
    return (
      <TooltipProvider delayDuration={150} key={level.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              layout
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              data-index={index}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`Level ${level.number}, ${level.status.replace('_', ' ')}, ${level.estMinutes} minutes, ${level.objectives.length} objectives, press Enter for details.`}
              onClick={() => onSelectLevel(level)}
              onFocus={() => handleTileFocus(index)}
              className={cn(
                'relative flex h-[56px] w-full items-center justify-center rounded-2xl border text-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:h-[72px] lg:h-[82px]',
                isSelected
                  ? 'border-sport-blue bg-sport-blue/20 text-sport-blue'
                  : 'border-white/10 bg-white/5 text-foreground hover:border-sport-blue/40 hover:bg-sport-blue/10',
                isLocked ? 'opacity-60 text-muted-foreground' : '',
              )}
            >
              <span>{level.number}</span>
              {isComplete ? (
                <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-emerald-400" aria-hidden />
              ) : isLocked ? (
                <Lock className="absolute right-2 top-2 h-4 w-4" aria-hidden />
              ) : (
                <Play className="absolute right-2 top-2 h-3.5 w-3.5 text-sport-green" aria-hidden />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs rounded-xl border border-white/10 bg-background/95">
            <p className="text-sm font-semibold text-foreground">{level.title}</p>
            <p className="text-xs text-muted-foreground">
              {level.estMinutes} min · {level.objectives.length} objectives · Difficulty {level.difficulty}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()

  const resultLabel = useMemo(() => {
    if (loading) return 'Loading levels…'
    if (levels.length === 0) return "No levels match. Clear filters or try 'passing'."
    return `${resultCount} level${resultCount === 1 ? '' : 's'}`
  }, [loading, levels.length, resultCount])

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <div className="relative sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search levels, tags, or milestones…"
              className="w-full rounded-full border-white/20 bg-white/5 pl-9 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Search levels"
            />
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>
        </div>
        <Badge variant="outline" className="h-8 w-fit rounded-full border-white/20 bg-white/5 px-4 text-xs">
          {resultLabel}
        </Badge>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
          {difficultyOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onToggleDifficulty(value)}
              aria-pressed={difficultyFilter.includes(value)}
              className={cn(
                'rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150',
                difficultyFilter.includes(value)
                  ? 'border-sport-blue/50 bg-sport-blue/15 text-sport-blue'
                  : 'bg-white/5 hover:border-sport-blue/40 hover:text-sport-blue',
              )}
            >
              D{value}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onToggleStatus(status)}
              aria-pressed={statusFilter.includes(status)}
              className={cn(
                'rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150',
                statusFilter.includes(status)
                  ? 'border-sport-green/50 bg-sport-green/15 text-sport-green'
                  : 'bg-white/5 hover:border-sport-green/40 hover:text-sport-green',
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        {(difficultyFilter.length > 0 || statusFilter.length > 0 || query.length > 0) && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-sport-blue underline hover:text-sport-blue/80"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        role="grid"
        aria-label="Level grid"
        tabIndex={0}
        className="group relative flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {!loading && levels.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No levels match. Clear filters or try ‘passing’.
          </div>
        ) : shouldVirtualize ? (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }} className="grid" role="presentation">
            {virtualItems.map((virtualRow) => {
              const startIndex = virtualRow.index * columnCount
              const rowLevels = levels.slice(startIndex, startIndex + columnCount)
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, minmax(${tileSize}px, 1fr))`,
                    gap: `${tileGap}px`,
                    paddingBottom: `${tileGap}px`,
                  }}
                  role="row"
                >
                  {rowLevels.map((level, columnOffset) => renderTile(level, startIndex + columnOffset))}
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columnCount}, minmax(${tileSize}px, 1fr))`,
              gap: `${tileGap}px`,
            }}
            role="presentation"
          >
            {levels.map((level, index) => renderTile(level, index))}
          </div>
        )}
      </div>
    </div>
  )
}
