"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target, Trophy, Users, Video, BarChart3, Shield, ChevronLeft, ChevronRight, Play } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Daily Challenges",
    description: "New skill challenges every day to keep you motivated and improving across all your sports.",
  },
  {
    icon: Trophy,
    title: "One App, Many Sports",
    description: "Track progress in soccer, basketball, volleyball, cricket, rugby, baseball, tennis, and more.",
  },
  {
    icon: BarChart3,
    title: "Local Leaderboards",
    description: "Compete with athletes from your school, club, or city in friendly competitions.",
  },
  {
    icon: Users,
    title: "Coach Mode",
    description: "Tools for coaches to create sessions, track team progress, and provide feedback.",
  },
  {
    icon: Video,
    title: "Video-first Progress",
    description: "Record your attempts, track improvements, and share your best moments.",
  },
  {
    icon: Shield,
    title: "Injury-aware Workloads",
    description: "Smart tracking that helps prevent overtraining and reduces injury risk.",
  },
]

const testimonials = [
  {
    name: "Alex Chen",
    role: "Multi-sport Athlete",
    avatar: "/asian-athlete.png",
    quote:
      "MultiSport helped me improve my ball control in soccer while maintaining my basketball shooting form. The cross-training insights are incredible.",
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
    description: "Join local leaderboards and connect with athletes from your school or club.",
  },
  {
    number: "05",
    title: "Analyze & Improve",
    description: "Review detailed analytics to understand your progress and optimize your training.",
  },
]

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [testiHover, setTestiHover] = useState(false)

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="group flex items-center space-x-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
            aria-label="Home"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="font-bold text-xl transition-colors duration-200 group-hover:text-primary">MultiSport</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="transition-transform duration-150 hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Log in"
              >
                Log in
              </Button>
            </Link>
            <Link href="/login">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
        {/* Background Videos/Images */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 opacity-10 pointer-events-none">
          <div className="space-y-2">
            <div className="aspect-video bg-gradient-to-br from-sport-blue/20 to-sport-green/20 rounded-lg flex items-center justify-center motion-safe:transition-transform motion-safe:duration-300 hover:rotate-1 hover:scale-[1.02]">
              <Play className="h-8 w-8 text-sport-blue" />
            </div>
            <div className="aspect-square bg-gradient-to-br from-sport-orange/20 to-sport-blue/20 rounded-lg motion-safe:transition-transform motion-safe:duration-300 hover:-rotate-1 hover:scale-[1.03]" />
          </div>
          <div className="space-y-2 mt-8">
            <div className="aspect-square bg-gradient-to-br from-sport-green/20 to-sport-orange/20 rounded-lg motion-safe:transition-transform motion-safe:duration-300 hover:rotate-1 hover:scale-[1.03]" />
            <div className="aspect-video bg-gradient-to-br from-sport-blue/20 to-sport-orange/20 rounded-lg flex items-center justify-center motion-safe:transition-transform motion-safe:duration-300 hover:-rotate-1 hover:scale-[1.02]">
              <Play className="h-8 w-8 text-sport-green" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="aspect-video bg-gradient-to-br from-sport-orange/20 to-sport-green/20 rounded-lg motion-safe:transition-transform motion-safe:duration-300 hover:rotate-1 hover:scale-[1.02]" />
            <div className="aspect-square bg-gradient-to-br from-sport-blue/20 to-sport-green/20 rounded-lg flex items-center justify-center motion-safe:transition-transform motion-safe:duration-300 hover:-rotate-1 hover:scale-[1.03]">
              <Play className="h-6 w-6 text-sport-orange" />
            </div>
          </div>
        </div>

        <div className="relative container px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Train smarter across{" "}
            <span className="bg-gradient-to-r from-sport-blue to-sport-green bg-clip-text text-transparent motion-safe:transition-opacity motion-safe:duration-300 hover:opacity-90">
              every sport
            </span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            The all-in-one platform for multi-sport athletes to track progress, compete with friends, and train with
            purpose across all your favorite sports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="group relative overflow-hidden text-lg px-8 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Get Started Free"
              >
                <span className="relative z-10">Get Started Free</span>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Log In"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to excel</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Comprehensive tools designed specifically for multi-sport athletes who want to train smarter, not harder.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative rounded-xl p-[1px] bg-gradient-to-br from-sport-blue/20 via-transparent to-sport-green/20 transition-transform duration-200 hover:-translate-y-1"
                >
                  <Card className="relative border-0 shadow-sm hover:shadow-md transition-shadow rounded-[11px] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-sport-blue/10 to-sport-green/10 flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-6 w-6 text-sport-blue" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-balance">{feature.description}</p>
                    </CardContent>
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-primary/5 to-transparent" />
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by athletes everywhere</h2>
            <p className="text-xl text-muted-foreground">See what coaches and athletes are saying about MultiSport</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card
              className="border-0 shadow-lg transition-shadow duration-200 hover:shadow-xl"
              onMouseEnter={() => setTestiHover(true)}
              onMouseLeave={() => setTestiHover(false)}
            >
              <CardContent className="p-8 text-center">
                <blockquote
                  className="text-xl md:text-2xl font-medium text-balance mb-6 transition-opacity duration-300"
                  aria-live="polite"
                >
                  “{testimonials[currentTestimonial].quote}”
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-transparent transition-all duration-300 hover:ring-primary/30">
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
                  <div className="text-left">
                    <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                    <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="transition-transform duration-150 hover:-translate-x-0.5"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      index === currentTestimonial ? "bg-primary scale-110" : "bg-muted hover:bg-muted-foreground/40"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`Show testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="transition-transform duration-150 hover:translate-x-0.5"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Get started in minutes and begin your journey to becoming a better multi-sport athlete.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group flex items-start space-x-6 rounded-lg p-2 transition-colors duration-150 hover:bg-muted"
                >
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center text-white font-bold text-sm transition-transform duration-150 group-hover:scale-105">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 transition-transform duration-150 group-hover:translate-x-0.5">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-balance">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to train smarter?</h2>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Join thousands of multi-sport athletes who are already using MultiSport to reach their potential.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="group relative overflow-hidden text-lg px-8 transition-all duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Start Training Today"
            >
              <span className="relative z-10">Start Training Today</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
            </Button>
          </Link>
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
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sport-blue to-sport-green flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-bold text-xl transition-colors duration-200 group-hover:text-primary">MultiSport</span>
            </Link>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                About
              </Link>
              <Link href="/guidelines" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                Guidelines
              </Link>
              <Link href="/settings" className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
