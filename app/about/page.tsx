import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Shield, Heart, Mail, MapPin, Phone, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">About MultiSport</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Empowering athletes to train smarter across every sport through technology, community, and data-driven
          insights.
        </p>
      </div>

      {/* Mission & Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Target className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To democratize elite-level training by making professional coaching techniques and performance analytics
              accessible to athletes at every level.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>Our Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Building a supportive global network where athletes share knowledge, celebrate progress, and inspire each
              other to reach new heights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-orange-500 mb-2" />
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Safety first, inclusive growth, data privacy, and authentic connections drive everything we do in the
              MultiSport community.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      <Card>
        <CardHeader>
          <CardTitle>Meet Our Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Alex Chen",
                role: "Founder & CEO",
                bio: "Former D1 athlete turned tech entrepreneur, passionate about democratizing sports training.",
                sports: ["Soccer", "Basketball"],
              },
              {
                name: "Maria Rodriguez",
                role: "Head of Product",
                bio: "Sports scientist and UX designer focused on creating intuitive training experiences.",
                sports: ["Volleyball", "Tennis"],
              },
              {
                name: "Jordan Kim",
                role: "Lead Coach Ambassador",
                bio: "Certified trainer with 15+ years experience coaching multi-sport athletes.",
                sports: ["Track", "Swimming"],
              },
            ].map((member, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-blue-600">{member.role}</p>
                </div>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
                <div className="flex justify-center space-x-1">
                  {member.sports.map((sport, sportIndex) => (
                    <Badge key={sportIndex} variant="outline" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>hello@multisport.app</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button variant="outline" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/privacy" className="block text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="block text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/guidelines" className="block text-blue-600 hover:underline">
              Community Guidelines
            </Link>
            <Link href="/safety" className="block text-blue-600 hover:underline">
              Safety Protocols
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <p className="text-muted-foreground mb-4">
            Ready to take your training to the next level? Join thousands of athletes already improving with MultiSport.
          </p>
          <Link href="/onboarding">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
