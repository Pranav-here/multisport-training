'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Bell,
  Shield,
  Trash2,
  Download,
  LogOut,
  Palette,
  Globe,
  Lock,
  Smartphone,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  CreditCard,
  HelpCircle,
  Zap,
  Trophy,
  Moon,
  TrendingUp,
  Settings as SettingsIcon,
} from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getSupabaseBrowserClient, type SupabaseBrowserClient } from '@/lib/supabase-browser'
import { DiscoverySettingsCard } from '@/components/discovery-settings-card'
import type { Database } from '@/types/database'

type ProfilesInsert = Database['public']['Tables']['profiles']['Insert']

type ProfilesClient = {
  from(table: 'profiles'): {
    upsert(values: ProfilesInsert): Promise<{ error: unknown }>
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = useMemo<SupabaseBrowserClient>(() => getSupabaseBrowserClient(), [])
  const { user, profile, session, refreshProfile } = useAuth()

  // Get initial tab from URL params
  const initialTab = searchParams?.get('tab') ?? 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')

  const [initialFirstName, setInitialFirstName] = useState('')
  const [initialLastName, setInitialLastName] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
  const [initialBio, setInitialBio] = useState('')
  const [initialLocation, setInitialLocation] = useState('')
  const [initialWebsite, setInitialWebsite] = useState('')

  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification preferences
  const [trainingReminders, setTrainingReminders] = useState(true)
  const [achievementNotifs, setAchievementNotifs] = useState(true)
  const [teamUpdates, setTeamUpdates] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('friends')
  const [activitySharing, setActivitySharing] = useState(true)
  const [locationSharing, setLocationSharing] = useState(false)
  const [dataAnalytics, setDataAnalytics] = useState(true)
  const [showEmail, setShowEmail] = useState(false)

  // Appearance settings
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('America/New_York')

  useEffect(() => {
    const displayName = (user?.displayName ?? '').trim()
    const [first, ...rest] = displayName ? displayName.split(/\s+/) : ['']
    const last = rest.join(' ')
    const bioValue = profile?.bio ?? ''
    const locationValue = profile?.location ?? ''
    const usernameValue = profile?.username ?? ''
    const websiteValue = profile?.website ?? ''

    setFirstName(first ?? '')
    setLastName(last ?? '')
    setUsername(usernameValue ?? '')
    setBio(bioValue ?? '')
    setLocation(locationValue ?? '')
    setWebsite(websiteValue ?? '')

    setInitialFirstName(first ?? '')
    setInitialLastName(last ?? '')
    setInitialUsername(usernameValue ?? '')
    setInitialBio(bioValue ?? '')
    setInitialLocation(locationValue ?? '')
    setInitialWebsite(websiteValue ?? '')
  }, [user?.id, user?.displayName, profile?.id, profile?.location, profile?.bio, profile?.username, profile?.website])

  const email = session?.user?.email ?? ''

  const isProfileDirty =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    username !== initialUsername ||
    bio !== initialBio ||
    location !== initialLocation ||
    website !== initialWebsite

  const passwordsMatch = newPassword === confirmPassword
  const passwordValid = newPassword.length >= 8
  const canUpdatePassword = currentPassword && newPassword && confirmPassword && passwordsMatch && passwordValid

  const handleProfileSave = async () => {
    if (!session?.user) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to update your profile.',
        variant: 'destructive',
      })
      return
    }

    const safeFirst = firstName.trim()
    const safeLast = lastName.trim()
    const safeUsername = username.trim()
    const safeBio = bio.trim()
    const safeLocation = location.trim()
    const safeWebsite = website.trim()
    const displayName = [safeFirst, safeLast].filter(Boolean).join(' ') || email || 'Athlete'

    setIsSavingProfile(true)
    try {
      const profilesClient = supabase as unknown as ProfilesClient
      const { error } = await profilesClient.from('profiles').upsert({
        id: session.user.id,
        display_name: displayName,
        username: safeUsername || null,
        bio: safeBio || null,
        location: safeLocation || null,
        website: safeWebsite || null,
      })

      if (error) {
        throw error
      }

      setInitialFirstName(safeFirst)
      setInitialLastName(safeLast)
      setInitialUsername(safeUsername)
      setInitialBio(safeBio)
      setInitialLocation(safeLocation)
      setInitialWebsite(safeWebsite)

      await refreshProfile()

      toast({
        title: 'Profile updated',
        description: 'Your changes were saved successfully.',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Try again.'
      toast({
        title: 'Unable to save profile',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!canUpdatePassword) return

    toast({
      title: 'Coming soon',
      description: 'Password updates will be available soon. Contact support if you need to change your password now.',
      variant: 'default',
    })

    // Clear fields after attempt
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleExportData = () => {
    toast({
      title: 'Data export requested',
      description: 'Your data export will be ready within 24 hours. We\'ll send you an email.',
    })
  }

  const handleSignOutEverywhere = () => {
    toast({
      title: 'Coming soon',
      description: 'Remote sign-out will be available soon. Contact support for immediate assistance.',
      variant: 'default',
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: 'Account deletion',
      description: 'This is a permanent action. Please contact support to proceed.',
      variant: 'destructive',
    })
  }

  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-background dark:bg-black">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-sport-blue/40 via-sport-green/20 to-transparent blur-3xl opacity-70 dark:opacity-20 dark:from-sport-blue/20 dark:via-sport-green/10" />
          <div className="absolute -bottom-36 -right-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-sport-orange/40 via-sport-blue/25 to-transparent blur-[120px] opacity-70 dark:opacity-20 dark:from-sport-orange/15 dark:via-sport-blue/10" />
        </div>

        <div className="container relative mx-auto px-4 py-6 pb-24 space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-1 bg-white/5 backdrop-blur-xl dark:bg-white/[0.06] border border-white/10 dark:border-white/12">
              <TabsTrigger value="profile" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="discovery" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Discovery</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Palette className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Bell className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Shield className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <Lock className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-sport-blue data-[state=active]:text-white">
                <SettingsIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and public profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jordan"
                        className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Taylor"
                        className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="athleteiquser"
                        className="pl-8 bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your unique username for your public profile</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                    />
                    <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself and your athletic journey..."
                      rows={4}
                      maxLength={500}
                      className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12 resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Austin, TX"
                        className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      {isProfileDirty ? 'You have unsaved changes' : 'All changes saved'}
                    </p>
                    <Button
                      onClick={handleProfileSave}
                      disabled={!isProfileDirty || isSavingProfile}
                      className="rounded-full transition-all duration-300 hover:scale-105"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discovery Tab */}
            <TabsContent value="discovery" className="space-y-6">
              <DiscoverySettingsCard />
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>Customize how AthletIQs looks and feels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme" className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Select your preferred language</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger id="timezone" className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">All times will be displayed in this timezone</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how and when you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Channels */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold">Notification Channels</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Choose how you receive notifications</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/12">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sport-blue/20 to-sport-blue/10">
                            <Mail className="h-5 w-5 text-sport-blue" />
                          </div>
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive updates via email</p>
                          </div>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/12">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sport-green/20 to-sport-green/10">
                            <Smartphone className="h-5 w-5 text-sport-green" />
                          </div>
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-xs text-muted-foreground">Get notified on your device</p>
                          </div>
                        </div>
                        <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Training & Sessions */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sport-blue/20 to-sport-blue/10">
                        <Zap className="h-4 w-4 text-sport-blue" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Training & Sessions</h4>
                        <p className="text-xs text-muted-foreground">Stay on top of your training schedule</p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Training Reminders</p>
                          <p className="text-xs text-muted-foreground">Get notified about upcoming sessions</p>
                        </div>
                        <Switch checked={trainingReminders} onCheckedChange={setTrainingReminders} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Weekly Summary</p>
                          <p className="text-xs text-muted-foreground">Receive weekly progress reports</p>
                        </div>
                        <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Social & Community */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10">
                        <User className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Social & Community</h4>
                        <p className="text-xs text-muted-foreground">Interactions and team activities</p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Team Updates</p>
                          <p className="text-xs text-muted-foreground">Stay updated on team activities</p>
                        </div>
                        <Switch checked={teamUpdates} onCheckedChange={setTeamUpdates} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Likes & Comments</p>
                          <p className="text-xs text-muted-foreground">When someone interacts with your posts</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">New Followers</p>
                          <p className="text-xs text-muted-foreground">When someone follows your profile</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Session Invites</p>
                          <p className="text-xs text-muted-foreground">When someone invites you to join</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Achievements & Progress */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/10">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Achievements & Progress</h4>
                        <p className="text-xs text-muted-foreground">Celebrate your milestones</p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Achievement Unlocked</p>
                          <p className="text-xs text-muted-foreground">When you earn new achievements</p>
                        </div>
                        <Switch checked={achievementNotifs} onCheckedChange={setAchievementNotifs} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Milestone Reached</p>
                          <p className="text-xs text-muted-foreground">When you hit major progress milestones</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Streak Reminders</p>
                          <p className="text-xs text-muted-foreground">Reminders to maintain your streak</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Challenge Results</p>
                          <p className="text-xs text-muted-foreground">Updates on your active challenges</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Quiet Hours */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-500/10">
                        <Moon className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Quiet Hours</h4>
                        <p className="text-xs text-muted-foreground">Pause notifications during certain times</p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-medium text-sm">Enable Quiet Hours</p>
                          <p className="text-xs text-muted-foreground">Mute notifications during specific hours</p>
                        </div>
                        <Switch checked={false} onCheckedChange={() => {}} />
                      </div>
                      <Alert className="border-muted-foreground/20 bg-muted/30">
                        <AlertDescription className="text-xs">
                          Quiet hours feature coming soon. You'll be able to set custom time windows when you don't want to be disturbed.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control who can see your information and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger id="profileVisibility" className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Public - Anyone can view</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Friends - Only your connections</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Private - Only you</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Who can see your profile and activity</p>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06]">
                      <div>
                        <p className="font-medium">Activity Sharing</p>
                        <p className="text-xs text-muted-foreground">Share your training sessions automatically</p>
                      </div>
                      <Switch checked={activitySharing} onCheckedChange={setActivitySharing} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06]">
                      <div>
                        <p className="font-medium">Location Sharing</p>
                        <p className="text-xs text-muted-foreground">Include location in your posts</p>
                      </div>
                      <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06]">
                      <div>
                        <p className="font-medium">Show Email</p>
                        <p className="text-xs text-muted-foreground">Display email on your profile</p>
                      </div>
                      <Switch checked={showEmail} onCheckedChange={setShowEmail} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 dark:bg-white/[0.06]">
                      <div>
                        <p className="font-medium">Data Analytics</p>
                        <p className="text-xs text-muted-foreground">Help improve the app with usage data</p>
                      </div>
                      <Switch checked={dataAnalytics} onCheckedChange={setDataAnalytics} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security & Password
                  </CardTitle>
                  <CardDescription>Keep your account secure and update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPassword && !passwordValid && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Password must be at least 8 characters
                        </p>
                      )}
                      {newPassword && passwordValid && (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Password is strong enough
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="bg-white/5 dark:bg-white/[0.06] border-white/10 dark:border-white/12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Passwords do not match
                        </p>
                      )}
                      {confirmPassword && passwordsMatch && (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Passwords match
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={!canUpdatePassword}
                    className="rounded-full transition-all duration-300 hover:scale-105"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Active Sessions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/12">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-sport-blue" />
                          <div>
                            <p className="text-sm font-medium">Current Device</p>
                            <p className="text-xs text-muted-foreground">Last active: Now</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06] animate-fade-in-up">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export your data or manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your training data, activity history, and profile information
                    </p>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="rounded-full transition-all duration-300 hover:scale-105"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Request Data Export
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Account Type</h4>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-sport-blue/10 to-sport-green/10 border border-sport-blue/20">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-sport-blue" />
                        <div>
                          <p className="font-semibold">Free Account</p>
                          <p className="text-xs text-muted-foreground">Upgrade to unlock premium features</p>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sign Out Everywhere</h4>
                        <p className="text-sm text-muted-foreground">Sign out of all devices except this one</p>
                      </div>
                      <Button
                        onClick={handleSignOutEverywhere}
                        variant="outline"
                        className="border-red-500/20 hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="destructive"
                        className="rounded-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                  <Alert className="border-yellow-500/20 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-xs">
                      Account deletion is permanent and cannot be undone. All your data will be lost.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.06]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Have questions or need assistance? We're here to help!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Visit Help Center</Button>
                    <Button variant="outline" size="sm">Contact Support</Button>
                    <Button variant="outline" size="sm">Report a Bug</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
