"use client"

import { useState } from 'react';
import { TrendingUp, Shield, Users, Mail, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function DiscoverySettingsCard() {
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [isUnder18, setIsUnder18] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentConsentGiven, setParentConsentGiven] = useState(false);
  const [allowMessages, setAllowMessages] = useState<'verified_scouts' | 'all' | 'none'>('verified_scouts');
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const { toast } = useToast();

  const handleToggleDiscoverable = (enabled: boolean) => {
    if (enabled && isUnder18 && !parentConsentGiven) {
      toast({
        title: 'Parent consent required',
        description: 'Please enter your parent\'s email to request consent',
        variant: 'destructive',
      });
      return;
    }

    setIsDiscoverable(enabled);
    toast({
      title: enabled ? 'Discovery enabled' : 'Discovery disabled',
      description: enabled
        ? 'Your profile is now discoverable by scouts'
        : 'Your profile has been hidden from Discovery feed',
    });
  };

  const handleSendParentConsent = () => {
    if (!parentEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter your parent or guardian\'s email',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Consent request sent',
      description: `We've sent a consent form to ${parentEmail}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Discovery Opt-In */}
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Discovery Mode
              </CardTitle>
              <CardDescription>
                Allow college scouts and coaches to discover your profile
              </CardDescription>
            </div>
            {isDiscoverable && (
              <Badge className="bg-green-600">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              When enabled, your training clips tagged for Discovery will appear in the public feed
              where verified college scouts can find and contact you.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Make my profile discoverable</Label>
              <p className="text-sm text-muted-foreground">
                Appear in scout searches and Discovery feed
              </p>
            </div>
            <Switch
              checked={isDiscoverable}
              onCheckedChange={handleToggleDiscoverable}
            />
          </div>

          {isDiscoverable && (
            <div className="space-y-4 pl-4 border-l-2 border-green-600">
              <p className="text-sm font-medium text-green-600">
                Your profile is now visible to scouts!
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Your Discovery clips will appear in the public feed</p>
                <p>✓ Scouts can bookmark your profile</p>
                <p>✓ Verified college coaches can send you messages</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Age Verification & Parent Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Age Verification
          </CardTitle>
          <CardDescription>
            Safety requirements for athletes under 18
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">I am under 18 years old</Label>
              <p className="text-sm text-muted-foreground">
                Requires parent/guardian consent for Discovery
              </p>
            </div>
            <Switch
              checked={isUnder18}
              onCheckedChange={setIsUnder18}
            />
          </div>

          {isUnder18 && (
            <div className="space-y-4 pl-4 border-l-2">
              <Alert>
                <AlertDescription>
                  For athletes under 18, we require parent or guardian consent before enabling Discovery mode.
                </AlertDescription>
              </Alert>

              {!parentConsentGiven ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendParentConsent} className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Consent Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-700 dark:text-green-300">
                  ✓ Parent consent received
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Control who can contact you and what they can see
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allowMessages">Who can send you messages?</Label>
            <Select value={allowMessages} onValueChange={(v: any) => setAllowMessages(v)}>
              <SelectTrigger id="allowMessages">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified_scouts">Verified scouts only</SelectItem>
                <SelectItem value="all">Anyone</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              We recommend "Verified scouts only" for safety
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Contact Information Visibility</Label>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Show email to scouts</p>
                <p className="text-xs text-muted-foreground">
                  Let scouts see your email address
                </p>
              </div>
              <Switch
                checked={showEmail}
                onCheckedChange={setShowEmail}
                icon={showEmail ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Show phone to scouts</p>
                <p className="text-xs text-muted-foreground">
                  Let scouts see your phone number
                </p>
              </div>
              <Switch
                checked={showPhone}
                onCheckedChange={setShowPhone}
                icon={showPhone ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Discovery Activity
          </CardTitle>
          <CardDescription>
            See who's viewing and bookmarking your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profile views (last 30 days):</span>
              <span className="font-semibold">142</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bookmarks:</span>
              <span className="font-semibold">8 scouts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Message requests:</span>
              <span className="font-semibold">3 pending</span>
            </div>

            <Separator className="my-4" />

            <Button variant="outline" className="w-full">
              View Full Activity Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
