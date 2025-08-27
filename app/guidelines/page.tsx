import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Camera, AlertTriangle, Heart, CheckCircle, XCircle, Info } from "lucide-react"

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Community Guidelines</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Creating a safe, supportive, and inspiring environment for all athletes
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-red-500 mb-2" />
            <CardTitle>Respect & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Treat every athlete with kindness and respect, regardless of skill level, background, or sport.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>Safety First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prioritize physical and emotional safety in all interactions and content sharing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>Inclusive Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Welcome athletes of all ages, abilities, and backgrounds to learn and grow together.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Content & Recording Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5" />
                <span>Encouraged Content</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Training drills and technique demonstrations</li>
                <li>• Progress videos showing improvement over time</li>
                <li>• Positive coaching tips and encouragement</li>
                <li>• Safe training environments and proper form</li>
                <li>• Celebrating achievements and milestones</li>
                <li>• Educational content about sports science</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 flex items-center space-x-2 mb-3">
                <XCircle className="h-5 w-5" />
                <span>Prohibited Content</span>
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Dangerous or reckless training methods</li>
                <li>• Content featuring minors without consent</li>
                <li>• Harassment, bullying, or negative comments</li>
                <li>• Inappropriate or revealing clothing/content</li>
                <li>• Promotion of unsafe supplements or practices</li>
                <li>• Spam, advertising, or unrelated content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Safety Protocols</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Recording Safety</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Always warm up before recording drills</li>
                <li>• Use proper equipment and protective gear</li>
                <li>• Record in safe, appropriate environments</li>
                <li>• Have supervision for complex or risky drills</li>
                <li>• Stop immediately if you feel pain or discomfort</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Privacy & Consent</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Get permission before recording others</li>
                <li>• Respect privacy in locker rooms and private spaces</li>
                <li>• Parents/guardians must consent for minors</li>
                <li>• You can request removal of content featuring you</li>
                <li>• Report any privacy violations immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting & Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle>Reporting & Community Standards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">How to Report Issues</h4>
              <p className="text-sm text-blue-700">
                Use the flag button on any content or contact us directly at safety@multisport.app. All reports are
                reviewed within 24 hours.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">
                First Violation
              </Badge>
              <p className="text-sm text-muted-foreground">Warning and content removal</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">
                Repeated Violations
              </Badge>
              <p className="text-sm text-muted-foreground">Temporary account suspension</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="destructive" className="mb-2">
                Serious Violations
              </Badge>
              <p className="text-sm text-muted-foreground">Permanent account termination</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age-Specific Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Age-Specific Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Youth Athletes (Under 18)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Parent/guardian account supervision required</li>
                <li>• Limited direct messaging capabilities</li>
                <li>• Enhanced privacy protections</li>
                <li>• Age-appropriate training content only</li>
                <li>• Mandatory safety equipment in videos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Adult Athletes (18+)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Full platform access and features</li>
                <li>• Can mentor and coach younger athletes</li>
                <li>• Responsible for content they share</li>
                <li>• Must follow all community guidelines</li>
                <li>• Can report safety concerns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Questions or Concerns?</h2>
          <p className="text-muted-foreground mb-4">
            Our community team is here to help ensure MultiSport remains a safe and positive space for everyone.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline">safety@multisport.app</Badge>
            <Badge variant="outline">support@multisport.app</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
