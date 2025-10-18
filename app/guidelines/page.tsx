import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CheckCircle2, Eye, Heart, Lock, ShieldCheck, Sparkles, Users, XCircle } from "lucide-react"

const principles = [
  {
    title: "Respect fuels growth",
    description:
      "Celebrate wins, share feedback with care, and recognize the work it takes for every athlete to press record.",
    icon: Heart,
    gradient: "from-rose-500/80 to-fuchsia-500/70",
  },
  {
    title: "Safety is non-negotiable",
    description: "Physical, emotional, and digital safety sit at the center of every interaction on AthletIQs.",
    icon: ShieldCheck,
    gradient: "from-sky-500/80 to-cyan-500/70",
  },
  {
    title: "Belonging over clout",
    description:
      "We amplify encouragement, transparency, and accountability—no athlete should feel isolated or exploited.",
    icon: Users,
    gradient: "from-emerald-400/80 to-lime-400/70",
  },
]

const encouragedContent = [
  "Technique breakdowns and drill walkthroughs that teach and inspire.",
  "Progress updates showing honest reps, not just highlight reels.",
  "Positive coaching cues, recovery tips, and mentorship moments.",
  "Training setups that model safe environments and proper equipment.",
  "Celebrations that uplift teammates, rivals, and the sport itself.",
  "Educational pieces on wellness, nutrition, and sports science.",
]

const prohibitedContent = [
  "Dangerous, reckless, or unsupervised stunts presented as training.",
  "Footage of minors without verified consent from guardians.",
  "Harassment, hate speech, bullying, or shaming of any kind.",
  "Body exposure, voyeurism, or content intended to sexualize athletes.",
  "Promotion of unsafe substances, gambling, or unrelated spam.",
  "Misleading claims or fabricated performances for clout.",
]

const safetyFocus = [
  {
    title: "Recording safety",
    icon: Camera,
    items: [
      "Warm up, hydrate, and use proper gear before you hit record.",
      "Film in clutter-free spaces with spotters for complex movements.",
      "Keep emergency protocols visible and accessible off-camera.",
      "Pause immediately if something feels painful or off.",
    ],
  },
  {
    title: "Privacy & consent",
    icon: Eye,
    items: [
      "Secure clear consent from anyone in frame—especially youth athletes.",
      "Never record in locker rooms, treatment rooms, or private spaces.",
      "Blur or crop identifiable details when sharing team playbooks.",
      "Use in-app tools to flag or remove footage that compromises privacy.",
    ],
  },
  {
    title: "Data stewardship",
    icon: Lock,
    items: [
      "Respect athlete data—only share analytics with explicit permission.",
      "Report suspicious account behavior or access attempts immediately.",
      "Keep your own login secure with MFA and updated passwords.",
      "Follow local regulations around athlete data retention and requests.",
    ],
  },
]

const reportingSteps = [
  {
    title: "Flag in-platform",
    description: "Tap the shield icon on any post, message, or profile to submit a detailed report in seconds.",
  },
  {
    title: "Document & escalate",
    description:
      "Add context, screenshots, or timestamps. Safety moderators prioritize cases that include supporting details.",
  },
  {
    title: "Hear back fast",
    description:
      "We acknowledge within 12 hours and share next steps within 24 hours, looping in guardians or organizations when required.",
  },
]

const responseTiers = [
  {
    label: "First misstep",
    description: "Content removal, coaching outreach, and a documented warning focused on education.",
    color: "from-emerald-400/50 to-sky-500/40",
  },
  {
    label: "Repeated harm",
    description: "Feature restrictions or temporary suspensions while restorative actions are reviewed.",
    color: "from-amber-400/50 to-orange-500/40",
  },
  {
    label: "Severe violations",
    description: "Immediate removal, evidence preserved, and collaboration with leagues or legal partners.",
    color: "from-rose-500/60 to-red-500/50",
  },
]

const ageBands = [
  {
    title: "Youth athletes (under 18)",
    tone: "from-sky-500/20 to-teal-500/20",
    items: [
      "Guardian-managed accounts with granular privacy defaults.",
      "Restricted DMs—only approved coaches and verified mentors.",
      "Curated content library tailored to age, level, and confidence.",
      "Mandatory safety equipment callouts in visible descriptions.",
      "Immediate escalation to caregivers if safety flags trigger.",
    ],
  },
  {
    title: "Adult athletes (18+)",
    tone: "from-emerald-500/15 to-lime-500/15",
    items: [
      "Full feature access with personal responsibility for shared media.",
      "Mentorship privileges to support younger athletes respectfully.",
      "Obligation to model and reinforce all community standards.",
      "Swift reporting of concerning or predatory behavior.",
      "Consent-based sharing of footage featuring other individuals.",
    ],
  },
]

export default function GuidelinesPage() {
  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] rounded-b-[4rem] bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.18),rgba(56,189,248,0.08)_45%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,0.32),transparent_60%),radial-gradient(circle_at_85%_20%,rgba(6,182,212,0.28),transparent_55%)] blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-14 text-center md:pt-28">
        <Badge className="mx-auto w-fit border border-white/20 bg-white/10 text-xs font-medium uppercase tracking-[0.32em] text-slate-100/80">
          Community care code
        </Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-tight">
          Keep the training ground brave, inclusive, and safe.
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base text-slate-200/90 md:text-lg">
          These guidelines protect every athlete who shows up with courage. We expect teammates, coaches, and fans to
          uphold them so AthletIQs stays a trusted home for growth.
        </p>
        <div className="mx-auto mt-10 flex w-full flex-wrap items-center justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-slate-200/80">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Every post is an opportunity to uplift</span>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-slate-200/80">
            <ShieldCheck className="h-4 w-4 text-sky-300" />
            <span>Safety moderation runs 24/7</span>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <Card
              key={principle.title}
              className="border-white/10 bg-white/6 shadow-[0_30px_60px_-35px_rgba(244,114,182,0.55)] backdrop-blur-xl"
            >
              <CardHeader className="space-y-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${principle.gradient}`}
                >
                  <principle.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-white">{principle.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-200/85">{principle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Card className="border-white/10 bg-white/6 shadow-[0_34px_70px_-40px_rgba(56,189,248,0.55)] backdrop-blur-xl">
          <CardHeader className="space-y-3">
            <Badge className="w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
              Content & recording
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <Camera className="h-6 w-6" />
              Share with intention
            </CardTitle>
            <p className="text-sm text-slate-200/75">
              Post content that keeps athletes safe, informed, and excited to show up for the work ahead.
            </p>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-emerald-500/10 p-6 text-left">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                Encouraged
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
                {encouragedContent.map((item) => (
                  <li key={item} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/12 bg-rose-500/10 p-6 text-left">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <XCircle className="h-5 w-5 text-rose-300" />
                Off limits
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
                {prohibitedContent.map((item) => (
                  <li key={item} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-rose-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Badge className="mb-6 border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
          Safety pillars
        </Badge>
        <div className="grid gap-6 md:grid-cols-3">
          {safetyFocus.map((focus) => (
            <div
              key={focus.title}
              className="rounded-3xl border border-white/12 bg-white/6 p-6 shadow-[0_32px_72px_-42px_rgba(94,234,212,0.55)] backdrop-blur"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <focus.icon className="h-6 w-6 text-sky-200" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{focus.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
                {focus.items.map((item) => (
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
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-white/10 bg-white/6 shadow-[0_34px_70px_-42px_rgba(14,165,233,0.55)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <Badge className="w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
                Reporting flow
              </Badge>
              <CardTitle className="text-2xl text-white">See something risky? Flag it fast.</CardTitle>
              <p className="text-sm text-slate-200/75">
                Community moderators and safety advocates respond around the clock. We treat every report like it&apos;s ours.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              {reportingSteps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-white/12 bg-white/5 p-5 text-left">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100/70">{step.title}</h3>
                  <p className="mt-3 text-sm text-slate-100/85">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/6 shadow-[0_34px_70px_-40px_rgba(239,68,68,0.55)] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <Badge className="w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
                Accountability
              </Badge>
              <CardTitle className="text-2xl text-white">How we respond</CardTitle>
              <p className="text-sm text-slate-200/75">
                Our enforcement ladder centers education and restoration while protecting those at risk.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              {responseTiers.map((tier) => (
                <div
                  key={tier.label}
                  className={`rounded-3xl border border-white/12 bg-gradient-to-r ${tier.color} px-5 py-4 shadow-[0_20px_45px_-35px_rgba(248,113,113,0.6)]`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">{tier.label}</p>
                  <p className="mt-2 text-sm text-white/90">{tier.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <Badge className="mb-6 border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
          Age-specific support
        </Badge>
        <div className="grid gap-6 md:grid-cols-2">
          {ageBands.map((band) => (
            <div
              key={band.title}
              className={`rounded-3xl border border-white/12 bg-gradient-to-br ${band.tone} p-6 shadow-[0_32px_72px_-45px_rgba(129,140,248,0.55)] backdrop-blur`}
            >
              <h3 className="text-lg font-semibold text-white">{band.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100/85">
                {band.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 leading-relaxed">
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-white/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <Card className="border-white/10 bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-emerald-500/20 p-10 text-center shadow-[0_36px_76px_-40px_rgba(16,185,129,0.6)] backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            <Badge className="mx-auto w-fit border border-white/20 bg-white/10 text-xs uppercase tracking-[0.28em] text-slate-100/80">
              We&apos;re listening
            </Badge>
            <CardTitle className="text-3xl text-white md:text-4xl">
              Need backup, clarity, or a human on the line?
            </CardTitle>
            <p className="text-sm text-slate-100/80 md:text-base">
              The AthletIQs safety squad includes trauma-informed responders, legal advisors, and veteran coaches ready to
              help.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-100/85">
            <Badge variant="outline" className="border-white/40 bg-white/10 px-4 py-2">
              safety@athletiqs.app
            </Badge>
            <Badge variant="outline" className="border-white/40 bg-white/10 px-4 py-2">
              support@athletiqs.app
            </Badge>
            <Badge variant="outline" className="border-white/40 bg-white/10 px-4 py-2">
              24/7 hotline: +1 (555) 987-6543
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
