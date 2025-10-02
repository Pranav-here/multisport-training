'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Target, Play } from 'lucide-react'
import type { Drill } from '@/lib/drill-data'

interface DrillCardProps {
  drill: Drill
}

export function DrillCard({ drill }: DrillCardProps) {
  const [thumbnailSrc, setThumbnailSrc] = useState(drill.thumbnail || '/placeholder.svg')

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleImageError = () => {
    if (thumbnailSrc !== '/sports-drill-demo.png') {
      setThumbnailSrc('/sports-drill-demo.png')
    }
  }

  return (
    <Card className='overflow-hidden transition-shadow hover:shadow-lg'>
      <div className='relative aspect-video'>
        <Image
          src={thumbnailSrc}
          alt={drill.title}
          fill
          className='object-cover'
          sizes='(min-width: 768px) 640px, 100vw'
          onError={handleImageError}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        <div className='absolute bottom-2 left-2 text-sm font-medium text-white'>{drill.sport}</div>
        <div className='absolute top-2 right-2'>
          <Badge className={getDifficultyColor(drill.difficulty)} variant='secondary'>
            {drill.difficulty}
          </Badge>
        </div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-black/50'>
            <Play className='ml-1 h-6 w-6 text-white' />
          </div>
        </div>
      </div>

      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg line-clamp-2'>{drill.title}</CardTitle>
            <CardDescription className='mt-1 line-clamp-2'>{drill.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div className='flex items-center space-x-1'>
            <Clock className='h-4 w-4' />
            <span>{drill.duration}</span>
          </div>
          <div className='flex items-center space-x-1'>
            <Target className='h-4 w-4' />
            <span>{drill.targetSkills.length} skills</span>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-sm font-medium'>Equipment needed:</p>
          <div className='flex flex-wrap gap-1'>
            {drill.equipment.map((item, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-sm font-medium'>Target skills:</p>
          <div className='flex flex-wrap gap-1'>
            {drill.targetSkills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant='secondary' className='text-xs'>
                {skill}
              </Badge>
            ))}
            {drill.targetSkills.length > 6 && (
              <Badge variant='secondary' className='text-xs'>
                +{drill.targetSkills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        <Link href={`/drills/${drill.id}`}>
          <Button className='w-full'>Start Drill</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
