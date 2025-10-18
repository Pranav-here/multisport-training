import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowUpRight,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Twitter,
  Users,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Athletes leveling up", value: "32K+" },
  { label: "Sports supported", value: "18 disciplines" },
  { label: "Coach-led sessions logged", value: "210K" },
]

const pillars = [
  {
    title: "Purpose-led technology",
    description:
      "We blend AI, coaching expertise, and community energy so every athlete can train like the pros without losing their humanity.",
    icon: Target,
    gradient: "from-sky-500/90 to-cyan-400/70",
  },
  {
    title: "Culture of belonging",
    description:
      "We build safe spaces where every athlete--youth, collegiate, elite, or returning--feels seen, supported, and celebrated.",
    icon: Users,
    gradient: "from-emerald-400/80 to-lime-400/60",
  },
  {
    title: "Safety as a superpower",
    description:
      "Data privacy, wellbeing, and ethical coaching standards are non-negotiable foundations baked into every feature we ship.",
    icon: Shield,
    gradient: "from-orange-400/80 to-pink-500/70",
  },
]

const timeline = [
  {
    year: "2021",
    title: "The spark",
    description:
      "A frustrated multi-sport roster realized training tools weren't built for real-world athletes juggling seasons, positions, and wellness.",
  },
  {
    year: "2022",
    title: "Product in motion",
    description:
      "Coach-first features, mobility libraries, and guided skill plans launched with backing from respected trainers and safety advocates.",
  },
  {
    year: "2024",
    title: "Movement > moment",
    description:
      "Global teams now track progress, celebrate milestones, and protect athlete wellbeing on AthletIQs every single day.",
  },
]

const team = [
  {
    name: "Pranav",
    role: "Founder & Lead Developer",
    bio: "Built the core app design, interface, and logic from scratch. Focused on blending analytics with real-time athlete feedback to make multi-sport training feel personal and data-driven.",
    sports: ["Basketball", "Cricket", "Tennis"],
  },
  {
    name: "James",
    role: "First User & Product Tester",
    bio: "Early adopter who pushed real-world testing from day one. Gave practical feedback on drills, interface flow, and challenge design from an athlete's perspective.",
    sports: ["Soccer", "Basketball"],
  },
  {
    name: "Izzy",
    role: "Marketing & Community Research Lead",
    bio: "Studied how players use social apps for sports, helping shape the app's engagement ideas, challenges, and sharing features.",
    sports: ["Volleyball", "Track"],
  },
  {
    name: "Adam",
    role: "Strategy & Data Research Analyst",
    bio: "Looked into training app trends, competitor models, and how analytics improve athlete performance and retention.",
    sports: ["Baseball", "Running"],
  },
  {
    name: "Karim",
    role: "Design & Ethics Advisor",
    bio: "Supported branding, accessibility, and data-privacy ideas to keep athlete well-being at the center of the platform.",
    sports: ["Boxing", "Swimming"],
  },
]

const contact = [
  { label: "hello@athletiqs.app", icon: Mail },
  { label: "+1 (555) 123-4567", icon: Phone },
  { label: "San Francisco - Remote-first", icon: MapPin },
]

export default function AboutPage() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] rounded-b-[4rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),rgba(14,116,144,0.08)_40%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(52,211,153,0.35),transparent_55%)] blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-16 text-center md:pt-28">
        <Badge className="mx-auto w-fit border border-white/20 bg-white/10 text-xs font-medium uppercase tracking-[0.3em] text-slate-100/80">
          AthletIQs ethos
        </Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-tight">
          One platform, infinite ways to become the athlete you imagine.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-200/90 md:text-lg">
          AthletIQs is where world-class coaching, data clarity, and community care intersect. We build tools that feel
          personal, responsive, and grounded in trust--so every rep reflects your reality.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/15 bg-white/8 py-6 px-6 shadow-[0_20px_60px_-30px_rgba(15,118,110,0.55)] backdrop-blur"
            >
              <p className="text-sm uppercase tracking-[0.28em] text-slate-200/70">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white md:text-4xl">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="border-white/10 bg-white/5 shadow-[0_25px_50px_-25px_rgba(59,130,246,0.45)] backdrop-blur-xl"
            >
              <CardHeader className="space-y-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${pillar.gradient}`}
                >
                  <pillar.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-white">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-200/85">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-8 shadow-[0_45px_80px_-45px_rgba(14,165,233,0.6)] md:p-12">
          <div className="absolute -right-20 top-10 hidden h-64 w-64 rounded-full bg-sky-400/20 blur-3xl md:block" />
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 text-left md:max-w-lg">
              <Badge className="w-fit border border-white/30 bg-white/10 text-xs uppercase tracking-[0.25em] text-slate-100/80">
                How we got here
              </Badge>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Built for athletes living hybrid lives</h2>
              <p className="text-sm text-slate-200/85 md:text-base">
                The AthletIQs story is written by athletes balancing training blocks, recovery, academics, and travel--even when
                the cameras aren&apos;t rolling. Every release is shaped alongside coaches, trainers, and safety leads who live
                in the field.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {timeline.map((entry) => (
                <div
                  key={entry.year}
                  className="relative rounded-3xl border border-white/15 bg-white/7 p-6 shadow-[0_25px_45px_-30px_rgba(99,102,241,0.5)] backdrop-blur"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-100/80">
                    <Sparkles className="h-4 w-4" />
                    {entry.year}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200/80">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-between gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/12 via-white/5 to-transparent p-8 shadow-[0_35px_65px_-40px_rgba(56,189,248,0.55)]">
            <div>
              <Badge className="w-fit border border-white/25 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
                Human-led, always
              </Badge>
              <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">Meet the crew keeping the bar high</h2>
              <p className="mt-4 text-sm text-slate-200/85 md:text-base">
                We&apos;re trainers, designers, data guardians, and former athletes who obsess over balancing performance insight
                with athlete wellbeing. Expect frequent check-ins, honest conversations, and feedback loops you can feel.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/8 px-5 py-4">
              <Trophy className="h-8 w-8 text-sky-300" />
              <div>
                <p className="text-sm font-semibold text-white">Certified coaching partners</p>
                <p className="text-xs text-slate-200/70">
                  40+ league and national-level coaches feed our training blueprints.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {team.map((member) => (
              <div
                key={member.name}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_60px_-40px_rgba(45,212,191,0.6)] backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 text-base font-semibold text-white">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100/70">{member.role}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{member.name}</h3>
                  <p className="mt-3 text-sm text-slate-200/80">{member.bio}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.sports.map((sport) => (
                    <Badge key={sport} variant="outline" className="border-white/20 bg-white/5 text-xs text-slate-100/90">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/6 shadow-[0_30px_60px_-35px_rgba(129,140,248,0.7)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <Badge className="w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.25em] text-slate-100/75">
                Reach out
              </Badge>
              <CardTitle className="text-2xl text-white">We answer like teammates, not tickets</CardTitle>
              <p className="text-sm text-slate-200/75">
                Partnerships, safety questions, or just sharing a breakthrough--we read everything that hits our inbox.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              {contact.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/90"
                >
                  <item.icon className="h-5 w-5 text-sky-300" />
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <Button variant="outline" className="group border-white/20 bg-white/5 text-slate-100 hover:bg-white/15">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
                <Button variant="outline" className="group border-white/20 bg-white/5 text-slate-100 hover:bg-white/15">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/6 shadow-[0_30px_60px_-35px_rgba(14,165,233,0.65)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <Badge className="w-fit border border-white/15 bg-white/10 text-xs uppercase tracking-[0.25em] text-slate-100/75">
                Transparency
              </Badge>
              <CardTitle className="text-2xl text-white">Legal, privacy, and safety in plain language</CardTitle>
              <p className="text-sm text-slate-200/75">
                We design with athlete data stewardship at the core. Dive deeper into how we care for your community.
              </p>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/guidelines", label: "Community Guidelines" },
                { href: "/safety", label: "Safety Protocols" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100/80 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.75rem] border border-white/15 bg-gradient-to-r from-sky-500/20 via-cyan-500/25 to-emerald-400/25 p-10 text-center shadow-[0_35px_75px_-35px_rgba(20,184,166,0.6)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_65%)] opacity-60" />
          <Heart className="relative mx-auto h-12 w-12 text-emerald-200" />
          <h2 className="relative mt-6 text-3xl font-semibold text-white md:text-4xl">
            Build momentum with the athletes shaping tomorrow.
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-sm text-slate-100/80 md:text-base">
            Join a collective of athletes, coaches, and caregivers who believe safe innovation and human connection make
            performance sustainable.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/onboarding">
              <Button size="lg" className="h-12 rounded-full bg-white text-slate-900 hover:bg-slate-100">
                Get started
              </Button>
            </Link>
            <Link
              href="/challenge-arena"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-slate-100/85 transition hover:border-white hover:text-white"
            >
              Explore the challenge arena
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
