'use client'

import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'

interface OnboardingData {
  sports: string[]
  username: string
  bio: string
  goals: {
    weeklySessions: number
    primarySport: string
  }
  preferredMode: 'training' | 'discovery'
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/onboarding/status')
        const data = await response.json()

        if (data.completed) {
          // Already onboarded, redirect to dashboard
          router.push('/dashboard')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setIsLoading(false)
      }
    }

    checkOnboarding()
  }, [user, router])

  const handleComplete = async (data: OnboardingData) => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      // Redirect based on preferred mode
      if (data.preferredMode === 'discovery') {
        router.push('/discovery')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast({
        title: 'Failed to save preferences',
        description: 'Please try again. If the problem persists, contact support.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-sport-blue/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sport-blue" />
      </div>
    )
  }

  return <OnboardingFlow onComplete={handleComplete} />
}
