import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Database, Eye, FileText, History, Lock, ShieldCheck, ShieldLock, Timer } from "lucide-react"
import Link from "next/link"

const heroStats = [
  { label: "Encrypted athlete records", value: "100%", accent: "from-sky-500/80 to-blue-500/70" },
  { label: "Privacy requests fulfilled", value: "< 48 hours", accent: "from-violet-500/80 to-fuchsia-500/70" },
  { label: "Moderators on duty", value: "24 / 7", accent: "from-emerald-500/80 to-teal-500/70" },
]

const foundations = [
  {
    title: "Consent-first architecture",
    description:
      "Every feature is pressure-tested with youth athletes, guardians, and coaches to ensure consent is explicit and revocable.",
    icon: ShieldCheck,
    gradient: "from-emerald-400/80 to-lime-400/70",
  },
  {
    title: "Minimal data, maximum impact",
    description:
      "We collect only what powers safe training insights. Profiles surface context you choose—not hidden data trails.",
    icon: Database,
    gradient: "from-sky-500/80 to-cyan-500/70",
  },
  {
    title: "Transparency on repeat",
    description:
      "Plain-language policies, real-time dashboards, and proactive alerts keep you looped in without digging through legalese.",
    icon: FileText,
    gradient: "from-purple-500/80 to-pink-500/70",
  },
]

const controls = [
  {
    title: "Dynamic privacy modes",
    icon: Eye,
    items: [
      "Toggle between public, followers-only, or private sharing for each post.",
      "Limit analytics visibility to trusted coaches while keeping fans updated.",
      "Lock down location trails and session metadata with a single switch.",
    ],
  },
  {
    title: "Guardian oversight tools",
    icon: ShieldLock,
    items: [
      "Approve connections, content, and notifications for youth athletes.",
      "Enable mandatory review before uploads appear on athlete profiles.",
      "Set blackout hours that pause messages and live challenges overnight.",
    ],
  },
  {
    title: "Wellness signal controls",
    icon: Bell,
    items: [
      "Customize who can see readiness scores or recovery notes.",
      "Mute biometric captures entirely or share anonymized trends only.",
      "Opt into alerts when coaches flag fatigue, stress, or wellness risks.",
    ],
  },
]

const commitments = [
  {
    title: "Security in layers",
    description:
      "We employ AES-256 encryption, rotating keys, and hardware security modules across production environments.",
  },
  {
    title: "Verified moderation",
    description:
      "Background-checked moderators and mandatory double-blind reviews keep sensitive reports protected and unbiased.",
  },
  {
    title: "Regional compliance",
    description:
      "SOC 2 Type II, GDPR, COPPA, FERPA, and SafeSport guardrails inform how we design, store, and delete athlete data.",
  },
  {
    title: "Zero dark privacy",
    description:
      "We never sell athlete data or surface it to advertisers. Third-party integrations require explicit opt-ins.",
  },
]

const requestTracks = [
  {
    title: "Access or export my data",
    icon: FileText,
    steps: [
      "Visit Settings → Privacy and select “Download your data.”",
      "Authenticate with 2FA to start the export.",
      "Receive a secure link to your structured archive within 48 hours.",
    ],
  },
  {
    title: "Delete or transfer my account",
    icon: History,
    steps: [
      "Submit a request through the privacy dashboard or email privacy@athletiqs.app.",
      "Our team verifies identity and dependent accounts to prevent misuse.",
      "Deletion or transfer completes within 7 days, with status updates along the way.",
    ],
  },
  {
    title: "Appeal a moderation action",
    icon: Timer,
    steps: [
      "Respond directly to the original moderation email with context.",
      "Provide supporting media or statements from coaches/guardians.",
      "A senior reviewer responds within 24 hours with next steps.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] rounded-b-[4rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),rgba(139,92,246,0.15)_45%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.35),transparent_60%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,0.25),transparent_55%)] blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-14 text-center md:pt-28">
        <Badge className="mx-auto w-fit border border-white/20 bg-white/10 text-xs font-medium uppercase tracking-[0.32em] text-slate-100/80">
          Privacy promise
        </Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-tight">
          Athlete data stays sacred. Period.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base text-slate-200/90 md:text-lg">
          Training stories, biometric signals, and behind-the-scenes footage are deeply personal. We treat them like
          vault-level assets—with transparency written in the same breath as security.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-white/15 bg-white/8 p-6 text-left shadow-[0_25px_60px_-35px_rgba(59,130,246,0.6)] backdrop-blur`}
            >
              <div className={`inline-flex rounded-full bg-gradient-to-r ${stat.accent} px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/90`}>
                {stat.label}
              </div>
              <p className="mt-4 text-3xl font-semibold text-white md:text-4xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {foundations.map((foundation) => (
            <Card
              key={foundation.title}
              className="border-white/10 bg-white/6 shadow-[0_34px_70px_-40px_rgba(96,165,250,0.55)] backdrop-blur-xl"
            >
              <CardHeader className="space-y-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${foundation.gradient}`}
                >
                  <foundation.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-white">{foundation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-200/85">{foundation.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Badge className="mb-6 border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
          Control the narrative
        </Badge>
        <div className="grid gap-6 md:grid-cols-3">
          {controls.map((control) => (
            <div
              key={control.title}
              className="rounded-3xl border border-white/12 bg-white/6 p-6 shadow-[0_32px_72px_-45px_rgba(129,140,248,0.55)] backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <control.icon className="h-6 w-6 text-sky-200" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{control.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
                {control.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-sky-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Card className="border-white/10 bg-white/6 shadow-[0_34px_70px_-40px_rgba(59,130,246,0.6)] backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <Badge className="w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
              Security stack
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Lock className="h-6 w-6" />
              Built on layered protection
            </CardTitle>
            <p className="text-sm text-slate-200/75">
              Privacy is only as strong as the safeguards around it. We invest in people, process, and tech to keep your data
              sealed.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {commitments.map((commitment) => (
              <div
                key={commitment.title}
                className="rounded-3xl border border-white/12 bg-gradient-to-br from-white/10 to-transparent p-5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100/70">{commitment.title}</h3>
                <p className="mt-3 text-sm text-slate-100/85">{commitment.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Badge className="mb-6 border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
          Your rights, honored
        </Badge>
        <div className="grid gap-6 md:grid-cols-3">
          {requestTracks.map((track) => (
            <div
              key={track.title}
              className="rounded-3xl border border-white/12 bg-white/6 p-6 shadow-[0_32px_72px_-45px_rgba(147,197,253,0.55)] backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <track.icon className="h-6 w-6 text-violet-200" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{track.title}</h3>
              <ol className="mt-4 space-y-3 text-sm text-slate-100/85">
                {track.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs font-semibold text-white/80">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <Card className="border-white/10 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-emerald-500/20 p-10 text-center shadow-[0_36px_78px_-40px_rgba(79,70,229,0.6)] backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            <Badge className="mx-auto w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
              Reach our privacy desk
            </Badge>
            <CardTitle className="text-3xl text-white md:text-4xl">
              Need clarity or a custom privacy arrangement?
            </CardTitle>
            <p className="text-sm text-slate-100/80 md:text-base">
              We partner with schools, leagues, and elite clubs to tailor data retention and consent flows. Tell us what your
              athletes need.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 text-sm text-slate-100/85 md:flex-row">
            <Badge variant="outline" className="border-white/40 bg-white/10 px-4 py-2">
              privacy@athletiqs.app
            </Badge>
            <Badge variant="outline" className="border-white/40 bg-white/10 px-4 py-2">
              security@athletiqs.app
            </Badge>
            <Link href="/guidelines" className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-slate-100/85 transition hover:border-white hover:text-white">
              Review community safeguards
            </Link>
          </CardContent>
          <div className="mt-6 flex justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
                Start building safely
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  )
}
