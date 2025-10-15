'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Clock } from 'lucide-react'
import type { Challenge } from '@/lib/mock-data'
import { useCountdown } from '@/hooks/use-countdown'

interface DailyChallengeCardProps {
  challenge: Challenge
  onJoin?: (challenge: Challenge) => void
}

export function DailyChallengeCard({ challenge, onJoin }: DailyChallengeCardProps) {
  const [imageSrc, setImageSrc] = useState(challenge.thumbnail || '/placeholder.svg')
  const countdown = useCountdown(challenge.deadline)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleImageError = () => {
    if (imageSrc !== '/daily-sports-challenge.png') {
      setImageSrc('/daily-sports-challenge.png')
    }
  }

  const sportBadge = useMemo(() => challenge.sport.replace(/\b\w/g, (char) => char.toUpperCase()), [challenge.sport])

  return (
    <Card className='overflow-hidden bg-gradient-to-br from-sport-blue/5 to-sport-green/5 border-sport-blue/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Trophy className='h-5 w-5 text-sport-blue' />
            <CardTitle className='text-lg'>Daily Challenge</CardTitle>
          </div>
          <Badge className={getDifficultyColor(challenge.difficulty)} variant='secondary'>
            {challenge.difficulty}
          </Badge>
        </div>
        <CardDescription className='text-base font-medium text-foreground'>{challenge.title}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='relative aspect-video overflow-hidden rounded-lg'>
          <Image
            src={imageSrc}
            alt={challenge.title}
            fill
            className='object-cover'
            sizes='(min-width: 768px) 640px, 100vw'
            onError={handleImageError}
            priority={false}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
          <div className='absolute bottom-2 left-2 text-sm font-medium text-white'>{sportBadge}</div>
        </div>

        <p className='text-sm text-muted-foreground text-balance'>{challenge.description}</p>

        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-1 text-muted-foreground'>
              <Users className='h-4 w-4' />
              <span>{challenge.participants.toLocaleString()} joined</span>
            </div>
            <div className='flex items-center space-x-1 text-muted-foreground'>
              <Clock className='h-4 w-4' />
              <span>{countdown.timeRemainingLabel} left</span>
            </div>
          </div>
          <div className='font-semibold text-sport-blue'>+{challenge.points} pts</div>
        </div>

        <Button className='w-full' onClick={() => onJoin?.(challenge)}>
          Join Challenge
        </Button>
      </CardContent>
    </Card>
  )
}
