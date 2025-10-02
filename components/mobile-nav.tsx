"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Trophy, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    label: "Top posts today",
    icon: Home,
  },
  {
    href: "/drills",
    label: "Drills",
    icon: Dumbbell,
  },
  {
    href: "/leaderboards",
    label: "Leaderboards",
    icon: Trophy,
  },
  {
    href: "/teams",
    label: "Teams",
    icon: Users,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-50 w-[min(90%,420px)] -translate-x-1/2 rounded-2xl border border-border/60 bg-background/90 px-3 py-2 shadow-xl backdrop-blur-md md:hidden"
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary bg-primary/10 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              <Icon className="mb-1 h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
              <span>{item.label}</span>
              <span
                className={cn(
                  'absolute inset-x-5 bottom-1 h-1 rounded-full bg-primary/40 transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                )}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
