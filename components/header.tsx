"use client"

import { useEffect, useRef, useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Bell, Moon, Sun, User, Settings, LogOut, MessageCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { logout as logoutAction } from '@/app/(routes)/actions'
import { NotificationsList } from '@/components/notifications'
import { BrandWordmark } from '@/components/brand-wordmark'
import { ModeToggle } from '@/components/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from 'next-themes'
import {
  PLACEHOLDER_AUTH_COOKIE,
  PLACEHOLDER_AUTH_EVENT,
  PLACEHOLDER_AUTH_STORAGE_KEY,
} from '@/lib/auth-placeholder'

interface SearchResult {
  id: string
  name: string
  sport: string
  team?: string
  position?: string
  thumb?: string
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchCacheRef = useRef<Map<string, { results: SearchResult[], timestamp: number }>>(new Map())
  const pendingRequestsRef = useRef<Map<string, Promise<Response>>>(new Map())
  const [isSigningOut, startTransition] = useTransition()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()

  const trimmedQuery = searchQuery.trim()

  // Optimized search function with instant caching
  const searchAthletes = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    const cacheKey = query.toLowerCase()
    const cached = searchCacheRef.current.get(cacheKey)
    const now = Date.now()

    // Show cached results instantly if available (even if stale)
    if (cached) {
      setSearchResults(cached.results)
      setIsSearching(false)

      // If cache is fresh (< 5 minutes), don't refetch
      if (now - cached.timestamp < 300000) {
        return
      }
    }

    // Fetch fresh results (in background if cache exists)
    if (!cached) {
      setIsSearching(true)
    }

    // Check if there's already a pending request for this query
    let pendingRequest = pendingRequestsRef.current.get(cacheKey)

    if (!pendingRequest) {
      // Create new request and store it
      pendingRequest = fetch(`/api/athletes/search?q=${encodeURIComponent(query)}`)
        .finally(() => {
          // Remove from pending requests when done
          pendingRequestsRef.current.delete(cacheKey)
        })

      pendingRequestsRef.current.set(cacheKey, pendingRequest)
    }

    try {
      const response = await pendingRequest
      const data = await response.json()
      const results = data.results || []

      // Update cache
      searchCacheRef.current.set(cacheKey, { results, timestamp: now })

      // Only update UI if this is still the current query
      if (query.toLowerCase() === searchQuery.trim().toLowerCase()) {
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Search error:', error)
      if (!cached) {
        setSearchResults([])
      }
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  // Debounce search requests - reduced to 100ms for faster response
  useEffect(() => {
    const timer = setTimeout(() => {
      if (trimmedQuery) {
        searchAthletes(trimmedQuery)
      } else {
        setSearchResults([])
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [trimmedQuery, searchAthletes])

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
    if (typeof document !== 'undefined') {
      const cookieAttributes = [
        `${PLACEHOLDER_AUTH_COOKIE}=`,
        'path=/',
        'max-age=0',
        'SameSite=Lax',
      ]

      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        cookieAttributes.push('Secure')
      }

      document.cookie = cookieAttributes.join('; ')
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(PLACEHOLDER_AUTH_STORAGE_KEY)
      } catch {
        // ignore storage cleanup failures
      }

      try {
        window.dispatchEvent(new Event(PLACEHOLDER_AUTH_EVENT))
      } catch {
        // ignore dispatch errors
      }
    }

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

  const navigateToProfile = (athlete: SearchResult) => {
    setSearchQuery(athlete.name)
    setShowSuggestions(false)
    router.push(`/athletes/${athlete.id}`)
  }

  const handleSearchSubmit = () => {
    if (!trimmedQuery) return

    const firstResult = searchResults[0]

    if (firstResult) {
      navigateToProfile(firstResult)
    } else if (!isSearching) {
      toast({
        title: 'No match found',
        description: 'Try searching for another athlete name.',
      })
    }
  }

  const handleDirectMessage = () => {
    router.push('/messages')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1320px] items-center gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex flex-shrink-0 items-start gap-1 sm:gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Image
            src="/logo-128.png"
            alt="AthletIQs logo"
            width={28}
            height={28}
            priority
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg transition-transform duration-200 hover:scale-[1.03]"
          />
          <BrandWordmark className="text-[1.4rem] sm:text-[1.65rem] leading-none" />
        </Link>

        <ModeToggle />

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-lg">
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
              className="h-11 rounded-full border border-white/10 bg-background/70 pl-10 pr-16 text-sm shadow-[0_18px_32px_rgba(15,23,42,0.2)] transition-all focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/70 md:flex">
              Press <kbd className="font-semibold">/</kbd>
            </span>
            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-1 overflow-hidden rounded-xl border bg-popover shadow-xl z-40">
                <div className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Athletes</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Esc</span>
                </div>
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y max-h-80 overflow-y-auto" role="listbox" aria-label="Search results">
                    {searchResults.slice(0, 8).map((athlete) => (
                      <li key={athlete.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/30 focus:bg-accent/30 focus:outline-none"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => navigateToProfile(athlete)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{athlete.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {athlete.team && `${athlete.team} • `}{athlete.sport}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : trimmedQuery.length >= 2 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No athletes found. Try a different search.
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDirectMessage}
            aria-label="Open personal messages"
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-white/15 bg-white/5 text-sport-blue shadow-[0_16px_32px_rgba(37,99,235,0.28)] transition-transform duration-150 hover:-translate-y-0.5 hover:border-sport-blue/40 hover:bg-sport-blue/20 hover:text-white focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-150 hover:scale-[1.03]">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sport-orange text-xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[420px] p-0">
              <NotificationsList />
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-150 hover:scale-[1.03]"
          >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-transform duration-150 hover:scale-[1.03]">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
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
