'use client'

import { useEffect, useMemo, useState } from "react"

import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Trash2, Download, LogOut } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export default function SettingsPage() {
  const { toast } = useToast()
  const supabase = useMemo(() => getSupabaseBrowserClient(), [])
  const { user, profile, session, refreshProfile } = useAuth()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [location, setLocation] = useState("")

  const [initialFirstName, setInitialFirstName] = useState("")
  const [initialLastName, setInitialLastName] = useState("")
  const [initialLocation, setInitialLocation] = useState("")

  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    const displayName = (user?.displayName ?? "").trim()
    const [first, ...rest] = displayName ? displayName.split(/\s+/) : [""]
    const last = rest.join(" ")
    const locationValue = profile?.location ?? ""

    setFirstName(first ?? "")
    setLastName(last ?? "")
    setLocation(locationValue ?? "")

    setInitialFirstName(first ?? "")
    setInitialLastName(last ?? "")
    setInitialLocation(locationValue ?? "")
  }, [user?.id, user?.displayName, profile?.id, profile?.location])

  const email = session?.user?.email ?? ""

  const isProfileDirty =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    location !== initialLocation

  const handleProfileSave = async () => {
    if (!session?.user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to update your profile.",
        variant: "destructive",
      })
      return
    }

    const safeFirst = firstName.trim()
    const safeLast = lastName.trim()
    const safeLocation = location.trim()
    const displayName = [safeFirst, safeLast].filter(Boolean).join(" ") || email || "Athlete"

    setIsSavingProfile(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        display_name: displayName,
        location: safeLocation || null,
      })

      if (error) {
        throw error
      }

      setFirstName(safeFirst)
      setLastName(safeLast)
      setLocation(safeLocation)
      setInitialFirstName(safeFirst)
      setInitialLastName(safeLast)
      setInitialLocation(safeLocation)

      await refreshProfile()

      toast({
        title: "Profile updated",
        description: "Your changes were saved.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Try again."
      toast({
        title: "Unable to save profile",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Jordan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Taylor"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} readOnly disabled />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Austin, TX"
                  />
                </div>
                <div>
                  <Button onClick={handleProfileSave} disabled={!isProfileDirty || isSavingProfile}>
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Training Reminders</h4>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming sessions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Achievement Notifications</h4>
                    <p className="text-sm text-muted-foreground">Celebrate your progress and milestones</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Team Updates</h4>
                    <p className="text-sm text-muted-foreground">Stay updated on team activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Summary</h4>
                    <p className="text-sm text-muted-foreground">Receive weekly progress reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">Who can see your profile and activity</p>
                  </div>
                  <Select defaultValue="friends">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Activity Sharing</h4>
                    <p className="text-sm text-muted-foreground">Share your training sessions automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Location Sharing</h4>
                    <p className="text-sm text-muted-foreground">Include location in your posts</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Analytics</h4>
                    <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="space-y-2">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button variant="outline">Update Password</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download a copy of your training data and activity</p>
                  <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    <span>Request Data Export</span>
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Sign out of all devices</p>
                      <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out Everywhere</span>
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Permanently delete your account and all data</p>
                      <Button variant="destructive" className="flex items-center space-x-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
