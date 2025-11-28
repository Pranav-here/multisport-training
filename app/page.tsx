"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to discovery feed (default experience)
    router.replace('/discovery')
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-sport-blue/20 via-sport-green/10 to-sport-orange/20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-sport-blue" />
        <p className="text-sm text-muted-foreground">Loading discovery feed...</p>
      </div>
    </div>
  )
}
