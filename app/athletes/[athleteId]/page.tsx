'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { MobileNav } from '@/components/mobile-nav'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAthleteProfile } from '@/lib/athlete-profiles'
import { ArrowLeft, Award, Play, Target } from 'lucide-react'

export default function AthleteProfilePage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = typeof params.athleteId === 'string' ? params.athleteId : Array.isArray(params.athleteId) ? params.athleteId[0] : ''
  const profile = athleteId ? getAthleteProfile(athleteId) : undefined

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-10 space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {!profile ? (
            <Card>
              <CardHeader>
                <CardTitle>Profile coming soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We&apos;re still assembling the scouting report for this athlete. Check back later or explore more drills in the meantime.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard">
                    <Button>Go to dashboard</Button>
                  </Link>
                  <Link href="/drills">
                    <Button variant="outline">Explore drills</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="relative h-48 w-full sm:h-64">
                  <Image
                    src={profile.coverImage}
                    alt={`${profile.name} cover`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1024px) 960px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>
                <div className="relative px-6 pb-6 sm:px-10 sm:pb-10">
                  <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-background shadow-lg sm:h-28 sm:w-28">
                        <Image
                          src={profile.avatar}
                          alt={profile.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="uppercase tracking-wide">
                            {profile.sport}
                          </Badge>
                          <Badge variant="secondary">#{profile.number ?? '—'}</Badge>
                          <Badge>{profile.position}</Badge>
                        </div>
                        <h1 className="text-3xl font-bold sm:text-4xl">{profile.name}</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Team: {profile.team}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href="/drills/strength-shoulder-raise">Try his Tomahawk Dunk</Link>
                      </Button>
                      <Button variant="outline" className="bg-transparent" onClick={() => router.push('/leaderboards')}>
                        View leaderboards
                      </Button>
                    </div>
                  </div>
                  <p className="mt-6 max-w-4xl text-sm text-muted-foreground sm:text-base">{profile.biography}</p>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {profile.careerStats.map((stat) => (
                  <Card key={stat.label} className="border-primary/10 bg-gradient-to-br from-primary/5 to-background">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{stat.value}</div>
                      {stat.subtext && <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>}
                    </CardContent>
                  </Card>
                ))}
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
                <Card className="space-y-0">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-sport-orange" />
                        Career Achievements
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        The accolades that define LeBron&apos;s unmatched resume.
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {profile.achievements.map((achievement) => (
                        <li key={achievement} className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                          <span className="text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-sport-green" />
                      Current Focus Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {profile.focusAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-sm">
                        {area}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-2xl font-semibold">Recent Highlights</h2>
                  <p className="text-sm text-muted-foreground">
                    Watch how LeBron keeps the edge during the grind of the season.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {profile.recentHighlights.map((highlight) => (
                    <Card key={highlight.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        {highlight.videoUrl ? (
                          <video
                            key={highlight.videoUrl}
                            src={highlight.videoUrl}
                            poster={highlight.thumbnail || profile.coverImage}
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={highlight.thumbnail || profile.coverImage}
                            alt={highlight.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 480px, 100vw"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {highlight.videoUrl && <Play className="h-4 w-4 text-primary" />}
                          {highlight.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-pretty">{highlight.description}</p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  )
}
