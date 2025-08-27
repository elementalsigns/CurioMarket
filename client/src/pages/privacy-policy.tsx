import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Shield, Eye, Lock, Database, Cookie, Mail, Clock, AlertTriangle, FileText } from "lucide-react";

function PrivacyPolicyStandalone() {
  useEffect(() => {
    document.title = "Privacy Policy - Curiosities Market";
  }, []);

  const sections = [
    {
      id: "collection",
      title: "Information Collection",
      icon: Database,
      content: "We collect information you provide directly and automatically when you use our platform."
    },
    {
      id: "usage", 
      title: "How We Use Information",
      icon: Eye,
      content: "Your information helps us provide, maintain, and improve our marketplace services."
    },
    {
      id: "sharing",
      title: "Information Sharing",
      icon: Shield,
      content: "We share information only as necessary to provide our services and as required by law."
    },
    {
      id: "security",
      title: "Data Security",
      icon: Lock,
      content: "We implement appropriate security measures to protect your personal information."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'hsl(212, 5%, 5%)'}}>
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-5xl font-serif font-bold text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Your privacy matters to us. This policy explains how we collect, use, and protect 
              your personal information when you use Curio Market.
            </p>
          </div>

          {/* Notice Box */}
          <div className="mb-12">
            <Card className="border-red-600/30 bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-red-400 font-medium">Notice: </span>
                    <span className="text-zinc-300">
                      This Privacy Policy was last updated on August 20, 2025. We may update this policy periodically.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="border-zinc-700 bg-zinc-950 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Quick Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-2 p-2 rounded-md text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                      data-testid={`nav-${section.id}`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </a>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Information We Collect */}
              <section id="collection">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-red-600" />
                      Information We Collect
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Information You Provide</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Account registration details (username, email)</li>
                        <li>Profile information and seller details</li>
                        <li>Payment and billing information</li>
                        <li>Product listings and descriptions</li>
                        <li>Messages and communications</li>
                        <li>Reviews and ratings</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Information We Collect Automatically</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Device information and browser data</li>
                        <li>IP addresses and location data</li>
                        <li>Usage patterns and site interactions</li>
                        <li>Cookies and similar technologies</li>
                        <li>Performance metrics and error logs</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How We Use Information */}
              <section id="usage">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-red-600" />
                      How We Use Your Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-zinc-300 leading-relaxed">
                      We use the information we collect to provide and improve our marketplace services:
                    </p>
                    <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                      <li>Create and maintain your account</li>
                      <li>Process transactions and payments</li>
                      <li>Facilitate communication between users</li>
                      <li>Provide customer support and resolve disputes</li>
                      <li>Detect and prevent fraud and abuse</li>
                      <li>Analyze usage patterns to improve our platform</li>
                      <li>Send important service notifications</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Information Sharing */}
              <section id="sharing">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Information Sharing & Disclosure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">We Share Information With:</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li><strong>Other Users:</strong> Public profile information, listings, and reviews</li>
                        <li><strong>Service Providers:</strong> Payment processors (Stripe), hosting services</li>
                        <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
                        <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                      <h4 className="font-medium text-amber-400 mb-2">Important:</h4>
                      <p className="text-zinc-300 text-sm">
                        We never sell your personal information to third parties or use it for advertising 
                        purposes outside of our platform.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Data Security */}
              <section id="security">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-600" />
                      Data Security & Protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-zinc-300 leading-relaxed">
                      We implement industry-standard security measures to protect your information:
                    </p>
                    <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>Secure payment processing through Stripe</li>
                      <li>Regular security audits and monitoring</li>
                      <li>Access controls and authentication</li>
                      <li>Data backup and recovery systems</li>
                    </ul>
                    
                    <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                      <p className="text-zinc-300 text-sm">
                        <strong>Note:</strong> While we strive to protect your information, no method of 
                        transmission over the internet is 100% secure. Please contact us immediately 
                        if you suspect any security breach.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Additional Sections Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Cookie className="w-5 h-5 text-red-600" />
                      Cookies & Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                      We use cookies and similar technologies to enhance your experience:
                    </p>
                    <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                      <li>Session management and authentication</li>
                      <li>User preferences and settings</li>
                      <li>Analytics and performance monitoring</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Your Rights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">
                      You have the right to:
                    </p>
                    <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                      <li>Access and update your information</li>
                      <li>Delete your account and data</li>
                      <li>Opt-out of marketing communications</li>
                      <li>Request data portability</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-red-600" />
                      Data Retention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      We retain your information only as long as necessary to provide our services 
                      and comply with legal obligations. Account data is typically deleted within 
                      30 days of account closure.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      Policy Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      We may update this policy periodically. Significant changes will be communicated 
                      via email or platform notifications. Continued use constitutes acceptance of updates.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-red-600" />
                    Privacy Questions & Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">
                    If you have questions about this Privacy Policy or how we handle your information:
                  </p>
                  <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Email:</span> Info@curiosities.market
                      </p>
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Subject:</span> Privacy Policy Inquiry
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-3 border-zinc-600 text-zinc-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Response within 48 hours
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPolicyStandalone;