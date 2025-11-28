'use client'

import { useRouter } from 'next/navigation'
import { Target, ArrowRight, Dumbbell, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NoSportsEmptyState() {
  const router = useRouter()

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-dashed border-white/25 bg-white/5 backdrop-blur-xl shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
      <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/10 via-transparent to-sport-orange/15 opacity-70" />

      <CardContent className="relative p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sport-blue/10 ring-4 ring-sport-blue/20">
          <Target className="w-10 h-10 text-sport-blue" />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">
            Choose Your Sports
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select the sports you train in to get personalized daily challenges tailored to your goals.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto pt-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <Dumbbell className="w-6 h-6 text-sport-green mx-auto mb-2" />
            <p className="text-sm font-medium">Personalized</p>
            <p className="text-xs text-muted-foreground mt-1">Challenges match your sports</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <Trophy className="w-6 h-6 text-sport-blue mx-auto mb-2" />
            <p className="text-sm font-medium">Earn More</p>
            <p className="text-xs text-muted-foreground mt-1">Better point multipliers</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <Target className="w-6 h-6 text-sport-orange mx-auto mb-2" />
            <p className="text-sm font-medium">Track Progress</p>
            <p className="text-xs text-muted-foreground mt-1">Multi-sport achievements</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            size="lg"
            className="rounded-full gap-2"
            onClick={() => router.push('/settings')}
          >
            Add Your Sports
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full"
            onClick={() => router.push('/onboarding')}
          >
            Complete Setup
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          You're currently seeing general challenges. Add your sports for a personalized experience.
        </p>
      </CardContent>
    </Card>
  )
}
