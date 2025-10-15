'use client'

import Image from 'next/image'
import { Clock, Sparkles, Trophy, Users, CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Challenge } from '@/lib/mock-data'
import { useCountdown } from '@/hooks/use-countdown'

interface JoinChallengeDialogProps {
  challenge: Challenge | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (challenge: Challenge) => void
}

const difficultyColors: Record<Challenge['difficulty'], string> = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function JoinChallengeDialog({ challenge, open, onOpenChange, onConfirm }: JoinChallengeDialogProps) {
  const difficultyClass = challenge ? difficultyColors[challenge.difficulty] : difficultyColors.medium
  const countdown = useCountdown(challenge?.deadline)

  const handleConfirm = () => {
    if (!challenge) {
      onOpenChange(false)
      return
    }

    onConfirm(challenge)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg max-h-[85vh] overflow-y-auto'>
        {challenge ? (
          <>
            <DialogHeader className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='uppercase tracking-wide text-xs font-semibold text-muted-foreground'>
                  Daily Challenge
                </Badge>
                <Badge className={difficultyClass} variant='secondary'>
                  {challenge.difficulty}
                </Badge>
              </div>
              <div>
                <DialogTitle className='text-2xl font-bold leading-tight'>Join {challenge.title}</DialogTitle>
                <DialogDescription className='mt-2 text-base text-muted-foreground'>
                  {challenge.description}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className='space-y-5'>
              <div className='relative aspect-video overflow-hidden rounded-xl'>
                <Image
                  src={challenge.thumbnail || '/daily-sports-challenge.png'}
                  alt={challenge.title}
                  fill
                  className='object-cover'
                  sizes='(min-width: 768px) 640px, 100vw'
                  priority={false}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                <div className='absolute bottom-3 left-3 flex items-center gap-2 text-sm font-medium text-white'>
                  <Sparkles className='h-4 w-4' />
                  {challenge.sport}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-3'>
                <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-3'>
                  <div className='flex items-center gap-2 text-muted-foreground font-medium'>
                    <Users className='h-4 w-4' />
                    Joined
                  </div>
                  <div className='mt-1 text-lg font-semibold text-foreground'>
                    {challenge.participants.toLocaleString()}
                  </div>
                </div>
                <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-3'>
                  <div className='flex items-center gap-2 text-muted-foreground font-medium'>
                    <Clock className='h-4 w-4' />
                    Time left
                  </div>
                  <div className='mt-1 text-lg font-semibold text-foreground'>{countdown.timeRemainingLabel}</div>
                </div>
                <div className='rounded-lg border border-muted-foreground/10 bg-muted/40 p-3'>
                  <div className='flex items-center gap-2 text-muted-foreground font-medium'>
                    <Trophy className='h-4 w-4' />
                    Points
                  </div>
                  <div className='mt-1 text-lg font-semibold text-sport-blue'>+{challenge.points}</div>
                </div>
              </div>

              <div className='rounded-lg border border-muted-foreground/10 bg-background/90 p-4 shadow-sm'>
                <p className='text-sm font-semibold text-foreground'>How to complete today&apos;s challenge:</p>
                <ul className='mt-3 space-y-2 text-sm text-muted-foreground'>
                  {challenge.instructions.map((instruction, index) => (
                    <li key={`${instruction}-${index}`} className='flex items-start gap-2'>
                      <CheckCircle2 className='mt-0.5 h-4 w-4 text-sport-green' />
                      <span>
                        <span className='font-medium text-foreground'>Step {index + 1}.</span> {instruction}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className='mt-6'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Not now
              </Button>
              <Button onClick={handleConfirm}>Start challenge</Button>
            </DialogFooter>
          </>
        ) : (
          <div className='space-y-4'>
            <DialogHeader>
              <DialogTitle>Loading challenge...</DialogTitle>
              <DialogDescription>Please wait while we prepare the daily challenge details.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
