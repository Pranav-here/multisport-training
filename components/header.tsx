"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Search, Bell, Moon, Sun, User, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { logout as logoutAction } from '@/app/(routes)/actions'
import { NotificationsList } from '@/components/notifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { famousPeople } from '@/lib/search-suggestions'
import { useTheme } from 'next-themes'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [isSigningOut, startTransition] = useTransition()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()

  const trimmedQuery = searchQuery.trim()
  const normalizedQuery = trimmedQuery.toLowerCase()

  const filteredSuggestions = useMemo(
    () =>
      famousPeople
        .filter((p) => !normalizedQuery || p.name.toLowerCase().includes(normalizedQuery) || p.id.includes(normalizedQuery))
        .slice(0, 5),
    [normalizedQuery]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingTarget = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget) {
        event.preventDefault()
        searchInputRef.current?.focus()
        setShowSuggestions(true)
      }

      if (event.key === 'Escape') {
        setShowSuggestions(false)
        if (document.activeElement === searchInputRef.current) {
          (document.activeElement as HTMLElement)?.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = () => {
    startTransition(() => {
      logoutAction().catch(() => {
        toast({
          title: 'Sign out failed',
          description: 'Please try again.',
          variant: 'destructive',
        })
      })
    })
  }

  const navigateToProfile = (person: (typeof famousPeople)[number]) => {
    setSearchQuery(person.name)
    setShowSuggestions(false)
    router.push(`/athletes/${person.id}`)
  }

  const handleSearchSubmit = () => {
    if (!normalizedQuery) return

    const exactMatch = famousPeople.find(
      (p) => p.name.toLowerCase() === normalizedQuery || p.id.toLowerCase() === normalizedQuery
    )
    const fallbackMatch = exactMatch ?? filteredSuggestions[0]

    if (fallbackMatch) {
      navigateToProfile(fallbackMatch)
    } else {
      toast({
        title: 'No match found',
        description: 'Try searching for a featured athlete like LeBron James.',
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <span className="font-bold text-xl">MultiSport</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search drills, athletes, teams..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(e.target.value.trim().length > 0)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSearchSubmit()
                }
              }}
              onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)}
              autoComplete="off"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              className="pl-10 pr-16"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:flex">
              Press <kbd className="font-semibold">/</kbd>
            </span>
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-1 overflow-hidden rounded-xl border bg-popover shadow-xl z-40">
                <div className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Suggestions</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Esc</span>
                </div>
                <ul className="divide-y" role="listbox" aria-label="Search suggestions">
                  {filteredSuggestions.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent/30 focus:bg-accent/30 focus:outline-none"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => navigateToProfile(p)}
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.sport}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <NotificationsList />
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings#notifications">Notification settings</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl ?? '/placeholder.svg'} alt={user.displayName} />
                    <AvatarFallback>
                      {user.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isSigningOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
