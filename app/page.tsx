"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { BrandWordmark } from "@/components/brand-wordmark"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Target, Trophy, Users, Video, BarChart3, Shield, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import {
  PLACEHOLDER_AUTH_COOKIE,
  PLACEHOLDER_AUTH_COOKIE_VALUE,
  PLACEHOLDER_AUTH_EVENT,
  PLACEHOLDER_AUTH_MAX_AGE_SECONDS,
  PLACEHOLDER_AUTH_STORAGE_KEY,
  isPlaceholderAuthEnabled,
} from "@/lib/auth-placeholder"

const features = [
  {
    icon: Target,
    title: "Daily Challenges",
    description: "New skill challenges every day to keep you motivated and improving across all your sports.",
    details:
      "Personalised micro-challenges arrive every morning so you always know what to train next. Sets adjust to your current streak, ensuring the right blend of difficulty and momentum.",
    highlights: [
      "Skill trees adapt based on your recent performance trends",
      "Push notifications and reminders keep streaks alive",
      "Earn XP multipliers for submitting video proof within 24 hours",
    ],
  },
  {
    icon: Trophy,
    title: "One App, Many Sports",
    description: "Track progress in soccer, basketball, volleyball, cricket, rugby, baseball, tennis, and more.",
    details:
      "Swap seamlessly between training plans for different sports without losing context. Each sport has drills, scoring models, and workload guidance created with specialists.",
    highlights: [
      "10+ sport-specific progression ladders with video cues",
      "Unified calendar so multi-sport athletes avoid session clashes",
      "Smart recommendations suggest complementary drills across sports",
    ],
  },
  {
    icon: BarChart3,
    title: "Local Leaderboards",
    description: "Compete with athletes from your school, club, or city in friendly competitions.",
    details:
      "Every drill, clip, and completed challenge feeds real-time leaderboards. Filter by school, club, or city to see where you stand and unlock badges as you climb.",
    highlights: [
      "Live standings with heat maps and weekly position deltas",
      "Create custom leaderboard groups for friends or entire teams",
      "Performance-based matchmaking keeps matchups competitive",
    ],
  },
  {
    icon: Users,
    title: "Coach Mode",
    description: "Tools for coaches to create sessions, track team progress, and provide feedback.",
    details:
      "Coaches get a dedicated workspace to launch multi-sport training blocks, assign challenges, and annotate athlete clips with time-stamped feedback.",
    highlights: [
      "Template library with season-ready blocks you can clone and tweak",
      "Session dashboards highlight athletes who need attention",
      "Shared clip review with threaded comments and emoji reactions",
    ],
  },
  {
    icon: Video,
    title: "Video-first Progress",
    description: "Record your attempts, track improvements, and share your best moments.",
    details:
      "Capture reps directly in-app or upload from camera roll. AI-assisted tagging auto-detects drill type, body position, and highlight-worthy clips for you.",
    highlights: [
      "Side-by-side comparisons show form changes over time",
      "Instant export packages for recruiters and social sharing",
      "Auto-generated captions make every clip accessible",
    ],
  },
  {
    icon: Shield,
    title: "Injury-aware Workloads",
    description: "Smart tracking that helps prevent overtraining and reduces injury risk.",
    details:
      "Workload monitoring blends session RPE, jump counts, sprint load, and recovery surveys to flag when you need to scale back or switch to light technical work.",
    highlights: [
      "Traffic-light readiness system updates after every session",
      "Integrations with wearables to sync heart-rate variability",
      "Personalised recovery recommendations and prehab playlists",
    ],
  },
]

const testimonials = [
  {
    name: "Alex Chen",
    role: "Multi-sport Athlete",
    avatar: "/asian-athlete.png",
    quote:
      "AthletIQs helped me improve my ball control in soccer while maintaining my basketball shooting form. The cross-training insights are incredible.",
  },
  {
    name: "Maria Rodriguez",
    role: "High School Coach",
    avatar: "/latina-coach.png",
    quote:
      "Our team's engagement skyrocketed. The kids love the daily challenges and the friendly competition between schools.",
  },
  {
    name: "James Thompson",
    role: "College Athlete",
    avatar: "/black-athlete.png",
    quote:
      "Finally, one app for all my sports. The analytics help me understand my training load across volleyball and track.",
  },
]

const steps = [
  {
    number: "01",
    title: "Pick Your Sports",
    description: "Select from soccer, basketball, volleyball, cricket, rugby, baseball, tennis, and more.",
  },
  {
    number: "02",
    title: "Record Your Progress",
    description: "Capture short clips of your training sessions and track your improvement over time.",
  },
  {
    number: "03",
    title: "Build Your Streaks",
    description: "Stay consistent with daily challenges and watch your skills develop across all sports.",
  },
  {
    number: "04",
    title: "Compete & Connect",
    description: "Join local leaderboards, message teammates directly, and compete with athletes from your school or club.",
  },
  {
    number: "05",
    title: "Analyze & Improve",
    description: "Review detailed analytics to understand your progress and optimize your training.",
  },
]

const heroSecondaryText = "Dominate every sport"

const heroStats = [
  {
    label: "Sessions Logged",
    value: "1.4M",
    change: "+18% vs last month",
    accent: "from-sport-blue/60 via-transparent to-sport-green/40",
  },
  {
    label: "Clips Shared",
    value: "980K",
    change: "Epic plays uploaded daily",
    accent: "from-sport-orange/50 via-transparent to-sport-blue/40",
  },
  {
    label: "Teams Competing",
    value: "12.4K",
    change: "Fresh rivalries every week",
    accent: "from-sport-green/50 via-transparent to-sport-orange/40",
  },
]

const sportsTicker = [
  "Soccer",
  "Basketball",
  "Volleyball",
  "Cricket",
  "Rugby",
  "Baseball",
  "Tennis",
  "Track",
  "Swimming",
  "Esports",
]

const scoreboardMatches = [
  {
    sport: "NBA",
    stage: "Chase Center",
    status: "Q4 | 02:14",
    highlight: "Celtics drop 23 threes on the road",
    home: { name: "Golden State Warriors", score: 80, color: "from-[#FDB927] to-[#006BB6]" },
    away: { name: "Boston Celtics", score: 140, color: "from-[#007A33] to-[#BA9653]" },
    metrics: [
      { label: "Top Scorer", value: "J. Brown - 38 PTS" },
      { label: "Run", value: "BOS 24-2 burst" },
    ],
  },
  {
    sport: "IPL",
    stage: "Rajiv Gandhi Stadium",
    status: "1st Inn | 19.4",
    highlight: "SRH rewrite the record books",
    home: { name: "Sunrisers Hyderabad", score: "287/3", color: "from-[#F26D21] to-[#000000]" },
    away: { name: "Royal Challengers Bengaluru", score: "229/8", color: "from-[#D71920] to-[#FED700]" },
    metrics: [
      { label: "Strike Rate", value: "215 vs 164" },
      { label: "Sixes", value: "SRH 21 | RCB 14" },
    ],
  },
  {
    sport: "NFL",
    stage: "AFC Divisional",
    status: "Q3 | 03:52",
    highlight: "Bills defense forcing turnovers",
    home: { name: "Buffalo Bills", score: 45, color: "from-[#00338D] to-[#C60C30]" },
    away: { name: "Kansas City Chiefs", score: 17, color: "from-[#E31837] to-[#FFB81C]" },
    metrics: [
      { label: "TDs", value: "J. Allen 4 total" },
      { label: "Takeaways", value: "BUF +3 margin" },
    ],
  },
]

export default function RootPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [testiHover, setTestiHover] = useState(false)
  const [scoreIndex, setScoreIndex] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)

  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const testimonialsRef = useRef(null)
  const stepsRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, amount: 0.2 })
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.1 })
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 })
  const stepsInView = useInView(stepsRef, { once: true, amount: 0.1 })

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-advance testimonials every 6s, pause on hover
  useEffect(() => {
    if (testiHover) return
    const id = setInterval(nextTestimonial, 6000)
    return () => clearInterval(id)
  }, [testiHover])

  const activeMatch = scoreboardMatches[scoreIndex] ?? scoreboardMatches[0]
  const activeFeature = selectedFeature !== null ? features[selectedFeature] : null

  const placeholderAuthEnabled = useMemo(() => isPlaceholderAuthEnabled(), [])

  const activatePlaceholderAccess = useCallback(() => {
    if (!placeholderAuthEnabled) {
      return
    }

    if (typeof document !== "undefined") {
      const cookieAttributes = [
        `${PLACEHOLDER_AUTH_COOKIE}=${PLACEHOLDER_AUTH_COOKIE_VALUE}`,
        "path=/",
        `max-age=${PLACEHOLDER_AUTH_MAX_AGE_SECONDS}`,
        "SameSite=Lax",
      ]

      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        cookieAttributes.push("Secure")
      }

      document.cookie = cookieAttributes.join("; ")
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PLACEHOLDER_AUTH_STORAGE_KEY, "true")
      } catch {
        // ignore storage write failures
      }

      try {
        window.dispatchEvent(new Event(PLACEHOLDER_AUTH_EVENT))
      } catch {
        // ignore dispatch failures
      }
    }
  }, [placeholderAuthEnabled])

  return (
    <>
      <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-start gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Home"
            >
              <Image
                src="/logo-128.png"
                alt="AthletIQs logo"
                width={28}
                height={28}
                priority
                className="h-7 w-7 rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              <BrandWordmark className="text-[1.7rem] leading-none" />
            </Link>
            <nav className="hidden items-center gap-1 md:flex lg:gap-2">
              <Link href="/about">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 text-sm font-medium hover:bg-white/20"
                >
                  About
                </Button>
              </Link>
              <Link href="/guidelines">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 text-sm font-medium hover:bg-white/20"
                >
                  Guidelines
                </Button>
              </Link>
              <Link href="/privacy">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 text-sm font-medium hover:bg-white/20"
                >
                  Privacy
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/onboarding" onClick={activatePlaceholderAccess}>
              <Button
                variant="ghost"
                className="transition-transform duration-150 hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Log in"
              >
                Log in
              </Button>
            </Link>
            <Link href="/onboarding" onClick={activatePlaceholderAccess}>
              <Button
                className="transition-all duration-150 hover:translate-y-[-1px] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Get Started"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-muted" />
          <div className="absolute -top-40 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 animate-pulse" />
          <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/20 to-transparent blur-[120px] opacity-70" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 opacity-25 blur-3xl" />
        </div>

        <div className="relative container px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <motion.div
              className="mx-auto max-w-3xl text-center md:text-left lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="mt-6 text-4xl md:text-6xl font-bold leading-[1.18] md:leading-[1.12] tracking-tight text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Train smarter across{" "}
                <span className="bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange bg-clip-text text-transparent">
                  every sport
                </span>
                <motion.span
                  className="mt-4 block text-3xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sport-orange via-sport-green to-sport-blue leading-tight md:leading-snug pb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {heroSecondaryText}
                </motion.span>
              </motion.h1>
              <motion.p
                className="mt-6 text-xl text-muted-foreground text-balance md:max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                The all-in-one platform for multi-sport athletes to track progress, compete with friends, and train with
                purpose across all your favorite sports.
              </motion.p>
              <motion.div
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/onboarding" onClick={activatePlaceholderAccess}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="group relative overflow-hidden rounded-full text-lg px-8 transition-all duration-200 hover:shadow-[0_20px_45px_rgba(37,99,235,0.25)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Get Started Free"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started Free
                        <motion.span
                          className="inline-flex h-2 w-2 rounded-full bg-sport-green"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </span>
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sport-blue/0 via-sport-green/30 to-sport-orange/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/onboarding" onClick={activatePlaceholderAccess} className="rounded-full">
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="rounded-full border border-white/40 bg-white/10 px-8 transition-all duration-200 hover:bg-white/20 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Log In"
                    >
                      Log In
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:hidden">
                <Link href="/about">
                  <Button variant="ghost" size="sm" className="rounded-full border border-white/20 bg-white/10 px-4 text-sm">
                    About
                  </Button>
                </Link>
                <Link href="/guidelines">
                  <Button variant="ghost" size="sm" className="rounded-full border border-white/20 bg-white/10 px-4 text-sm">
                    Guidelines
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="ghost" size="sm" className="rounded-full border border-white/20 bg-white/10 px-4 text-sm">
                    Privacy
                  </Button>
                </Link>
              </div>
              <motion.div
                className="mt-12 grid w-full gap-4 sm:grid-cols-3"
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-6 text-left backdrop-blur transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_35px_rgba(2,6,23,0.25)] cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  >
                    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${stat.accent} opacity-60 transition-opacity duration-200 group-hover:opacity-100`} />
                    <motion.p
                      className="text-xs uppercase tracking-[0.35em] text-foreground/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      {stat.label}
                    </motion.p>
                    <motion.p
                      className="mt-3 text-3xl font-semibold text-foreground"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={heroInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 1.3 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="mt-2 text-sm text-foreground/70">{stat.change}</p>
                  </motion.div>
                ))}
              </motion.div>
              <div className="mt-10 w-full lg:hidden">
                <Card className="relative overflow-hidden border-0 bg-white/10 text-foreground shadow-[0_12px_28px_rgba(15,23,42,0.25)] backdrop-blur">
                  <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/20 via-sport-green/10 to-sport-orange/20 opacity-90" />
                  <CardContent className="relative z-10 space-y-5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-foreground/70">Live Scores</p>
                        <p className="mt-1 text-sm font-semibold text-foreground/80">{activeMatch.stage}</p>
                      </div>
                      <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/80">
                        {activeMatch.status}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {[{ ...activeMatch.home, tag: "Home" }, { ...activeMatch.away, tag: "Away" }].map((team) => (
                        <div
                          key={team.name}
                          className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{team.tag}</p>
                            <p className="mt-1 text-base font-semibold">{team.name}</p>
                          </div>
                          <div className={`rounded-2xl bg-gradient-to-br ${team.color} px-4 py-1.5 text-xl font-bold text-white`}>
                            {team.score}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-foreground/80">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Spotlight</p>
                      <p className="mt-2 font-semibold">{activeMatch.highlight}</p>
                      <div className="mt-3 grid gap-2">
                        {activeMatch.metrics.map((metric) => (
                          <div key={metric.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm">
                            <span className="uppercase tracking-[0.25em] text-muted-foreground">{metric.label}</span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            <div className="hidden lg:flex lg:flex-col lg:justify-center">
              <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/10 text-left text-foreground shadow-[0_25px_60px_rgba(15,23,42,0.25)] backdrop-blur">
                <span className="absolute inset-0 bg-gradient-to-br from-sport-blue/25 via-sport-green/15 to-sport-orange/20 opacity-90" />
                <CardContent className="relative z-10 space-y-6 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-foreground/70">Live Scores</p>
                      <p className="mt-1 text-sm font-semibold text-foreground/80">{activeMatch.stage}</p>
                    </div>
                    <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-foreground/80">
                      {activeMatch.status}
                    </span>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-3">
                      {[{ ...activeMatch.home, tag: "Home" }, { ...activeMatch.away, tag: "Away" }].map((team) => (
                        <div
                          key={team.name}
                          className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4"
                        >
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{team.tag}</p>
                            <p className="mt-1 text-lg font-semibold">{team.name}</p>
                          </div>
                          <div
                            className={`rounded-2xl bg-gradient-to-br ${team.color} px-5 py-2 text-2xl font-bold text-white shadow-[0_12px_25px_rgba(15,23,42,0.35)]`}
                          >
                            {team.score}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Spotlight</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{activeMatch.highlight}</p>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-foreground/80">
                        {activeMatch.metrics.map((metric) => (
                          <div key={metric.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{metric.label}</p>
                            <p className="mt-2 font-semibold">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {scoreboardMatches.map((match, index) => (
                        <button
                          key={match.sport}
                          type="button"
                          onClick={() => setScoreIndex(index)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition-all ${
                            index === scoreIndex
                              ? "bg-white/90 text-foreground shadow-sm"
                              : "bg-white/10 text-foreground/70 hover:bg-white/20"
                          }`}
                          aria-label={`Show ${match.sport} scoreboard`}
                        >
                          {match.sport.slice(0, 3).toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setScoreIndex((prev) => (prev + 1) % scoreboardMatches.length)}
                      className="rounded-full border border-white/30 bg-white/10 text-foreground hover:bg-white/20"
                      aria-label="Show next live matchup"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-16">
            <div className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-8 py-4 backdrop-blur">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background via-transparent to-transparent" />
              <div
                className="flex w-max items-center gap-8 text-xs uppercase tracking-[0.6em] text-foreground/70"
                style={{ animation: "hero-marquee 20s linear infinite" }}
              >
                {sportsTicker.concat(sportsTicker).map((sport, index) => (
                  <span key={`${sport}-${index}`} className="flex items-center gap-2">
                    <span>{sport}</span>
                    <span className="h-1 w-1 rounded-full bg-sport-green" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Dialog open={selectedFeature !== null} onOpenChange={(open) => { if (!open) setSelectedFeature(null) }}>
          <DialogContent className="max-w-xl" showCloseButton>
            {activeFeature && (
              <>
                <DialogHeader>
                  <DialogTitle>{activeFeature.title}</DialogTitle>
                  <DialogDescription>{activeFeature.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p className="text-foreground/80">{activeFeature.details}</p>
                  <ul className="space-y-3 text-left">
                    {activeFeature.highlights?.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-foreground/80">
                        <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sport-green" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <DialogFooter className="sm:justify-between">
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Ready to put it into practice? Jump into the app and start building momentum.
                  </p>
                  <Link href="/onboarding" onClick={activatePlaceholderAccess}>
                    <Button
                      size="sm"
                      className="rounded-full px-4"
                      onClick={() => setSelectedFeature(null)}
                    >
                      Launch AthletIQs
                    </Button>
                  </Link>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} id="features" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/50 to-background" />
        <div className="absolute -top-32 left-12 h-72 w-72 rounded-full bg-gradient-to-br from-sport-blue/25 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-12 h-64 w-64 rounded-full bg-gradient-to-br from-sport-orange/20 to-transparent blur-3xl opacity-60" />
        <div className="container relative px-4">
          <motion.div
            className="mx-auto mb-16 max-w-4xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-foreground/70 backdrop-blur"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={featuresInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              Feature deck
            </motion.span>
            <motion.h2
              className="mt-6 text-3xl md:text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Everything you need to excel
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground text-balance"
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Comprehensive tools designed specifically for multi-sport athletes who want to train smarter, not harder.
            </motion.p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-[1px] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.2)] cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-sport-blue/20 via-transparent to-sport-green/20 opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <Card className="relative h-full border-0 bg-background/80 backdrop-blur-xl">
                    <CardContent className="relative z-10 space-y-4 p-6">
                      <div className="flex items-start justify-between">
                        <motion.div
                          className="h-12 w-12 rounded-lg bg-gradient-to-br from-sport-blue/15 to-sport-green/15 flex items-center justify-center"
                          whileHover={{
                            scale: 1.1,
                            rotate: 5,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <Icon className="h-6 w-6 text-sport-blue" />
                        </motion.div>
                        <motion.span
                          className="text-xs uppercase tracking-[0.3em] text-muted-foreground/80"
                          initial={{ opacity: 0, x: -10 }}
                          animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          #{index + 1}
                        </motion.span>
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-balance">{feature.description}</p>
                      <Link href="/onboarding" onClick={activatePlaceholderAccess}>
                        <motion.button
                          type="button"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-sport-green opacity-0 transition-opacity duration-300 hover:text-sport-green/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group-hover:opacity-100"
                          aria-label={`Explore more about ${feature.title}`}
                          whileHover={{ x: 5 }}
                        >
                          Explore more
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} id="testimonials" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-muted/40 to-background" />
        <div className="absolute -top-24 left-16 h-60 w-60 rounded-full bg-gradient-to-tr from-sport-blue/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-24 h-56 w-56 rounded-full bg-gradient-to-tr from-sport-orange/25 to-transparent blur-3xl opacity-60" />
        <div className="container relative px-4">
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              Loved by athletes everywhere
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={testimonialsInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              See what coaches and athletes are saying about AthletIQs
            </motion.p>
          </motion.div>
          <motion.div
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card
              className="relative overflow-hidden border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(15,23,42,0.24)]"
              onMouseEnter={() => setTestiHover(true)}
              onMouseLeave={() => setTestiHover(false)}
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sport-blue via-sport-green to-sport-orange" />
              <CardContent className="relative z-10 space-y-6 p-10 text-center">
                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={currentTestimonial}
                    className="text-xl md:text-2xl font-medium text-balance text-foreground/90"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                  </motion.blockquote>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`author-${currentTestimonial}`}
                    className="flex items-center justify-center gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                      <Avatar className="h-14 w-14 ring-2 ring-transparent transition-all duration-300 hover:ring-sport-blue/40">
                        <AvatarImage
                          src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                          alt={`${testimonials[currentTestimonial].name} avatar`}
                        />
                        <AvatarFallback>
                          {testimonials[currentTestimonial].name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="text-left">
                      <div className="text-sm uppercase tracking-[0.4em] text-muted-foreground/80">Featured voice</div>
                      <div className="mt-1 text-lg font-semibold">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
            <motion.div
              className="mt-10 flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.1, x: -3 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-white/40 bg-white/10 transition-colors duration-150 hover:bg-white/20"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </motion.div>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      index === currentTestimonial
                        ? "bg-sport-blue"
                        : "bg-muted hover:bg-muted-foreground/50"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`Show testimonial ${index + 1}`}
                    animate={{
                      scale: index === currentTestimonial ? 1.25 : 1,
                    }}
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.1, x: 3 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-white/40 bg-white/10 transition-colors duration-150 hover:bg-white/20"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section ref={stepsRef} id="how-it-works" className="relative overflow-hidden py-24 bg-gradient-to-b from-muted/40 via-background to-muted/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.08),transparent_65%)]" />
        </div>
        <div className="container relative px-4">
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={stepsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
            >
              How it works
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={stepsInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Get started in minutes and begin your journey to becoming a better multi-sport athlete.
            </motion.p>
          </motion.div>
          <div className="relative mx-auto max-w-4xl">
            <motion.div
              className="absolute left-7 top-0 bottom-0 hidden md:block"
              initial={{ scaleY: 0, originY: 0 }}
              animate={stepsInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <div className="h-full w-px bg-gradient-to-b from-sport-blue/40 via-sport-green/40 to-sport-orange/40" />
            </motion.div>
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 pl-6 backdrop-blur transition-all duration-300 hover:shadow-[0_18px_32px_rgba(15,23,42,0.2)] md:flex-row md:items-center md:gap-10 md:pl-16 cursor-pointer"
                  initial={{ opacity: 0, x: -50 }}
                  animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className="absolute left-5 top-6 hidden h-3 w-3 rounded-full bg-gradient-to-br from-sport-blue to-sport-green shadow-[0_0_0_6px_rgba(255,255,255,0.12)] md:block"
                    initial={{ scale: 0 }}
                    animate={stepsInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.15, type: "spring" }}
                    whileHover={{
                      scale: 1.5,
                      boxShadow: "0 0 0 10px rgba(255,255,255,0.2)",
                    }}
                  />
                  <div className="md:min-w-[120px]">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sport-blue to-sport-green text-white font-bold text-sm shadow-lg"
                      whileHover={{
                        scale: 1.15,
                        rotate: 360,
                        transition: { duration: 0.6 },
                      }}
                    >
                      {step.number}
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <motion.h3
                      className="text-xl font-semibold"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.title}
                    </motion.h3>
                    <p className="mt-2 text-muted-foreground text-balance">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sport-blue/15 via-sport-green/10 to-sport-orange/15" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.18),transparent_55%)]" />
        <div className="container relative px-4">
          <motion.div
            className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-12 text-center shadow-[0_25px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 30px 70px rgba(15,23,42,0.35)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.span
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-foreground/70"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Ready to go?
            </motion.span>
            <motion.h2
              className="mt-6 text-3xl md:text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Ready to train smarter?
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground text-balance max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join thousands of multi-sport athletes who are already using AthletIQs to reach their potential.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/onboarding" onClick={activatePlaceholderAccess}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="group relative overflow-hidden rounded-full text-lg px-10 py-6 transition-all duration-200 hover:shadow-[0_20px_45px_rgba(37,99,235,0.25)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label="Start Training Today"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Start Training Today
                      <motion.span
                        className="inline-flex h-2 w-2 rounded-full bg-sport-green"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </span>
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sport-blue/0 via-sport-green/30 to-sport-orange/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/onboarding" onClick={activatePlaceholderAccess}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-full border border-white/40 bg-white/10 px-10 py-6 transition-all duration-200 hover:bg-white/20 hover:shadow-lg"
                    aria-label="Log In"
                  >
                    Log In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <Link
              href="/"
              className="group flex items-center space-x-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
              aria-label="Home"
            >
              <Image
                src="/logo-128.png"
                alt="AthletIQs logo"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              <BrandWordmark className="text-[1.7rem] leading-none" />
            </Link>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                About
              </Link>
              <Link href="/guidelines" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                Guidelines
              </Link>
              <Link href="/privacy" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    <style jsx global>{`
      @keyframes hero-marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `}</style>
  </>
  )
}
