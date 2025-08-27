import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { FileText, Shield, AlertTriangle, DollarSign, Scale, Clock, Users, BookOpen } from "lucide-react";

function TermsOfServiceStandalone() {
  useEffect(() => {
    document.title = "Terms of Service - Curiosities Market";
  }, []);

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: BookOpen,
      content: "By accessing and using Curio Market, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform."
    },
    {
      id: "platform",
      title: "Platform Overview", 
      icon: Users,
      content: "Curio Market is a specialized marketplace for oddities, curios, specimens, and related collectibles. We provide a platform connecting sellers and buyers, but we are not a party to individual transactions."
    },
    {
      id: "accounts",
      title: "Account Responsibilities",
      icon: Shield,
      content: "Users are responsible for maintaining account confidentiality, all account activities, providing accurate information, and notifying us of unauthorized use."
    },
    {
      id: "transactions",
      title: "Transaction Terms",
      icon: DollarSign,
      content: "Clear guidelines for both buyers and sellers, including obligations, dispute resolution, and platform mediation services."
    },
    {
      id: "liability", 
      title: "Limitation of Liability",
      icon: Scale,
      content: "Curio Market acts as a marketplace platform and is not liable for item quality, seller representations, user conduct, or shipping issues."
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
              <FileText className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-5xl font-serif font-bold text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              The legal framework governing your use of Curio Market and the responsibilities 
              of all participants in our marketplace for oddities and curiosities.
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
                      These Terms of Service were last updated on August 20, 2025. Continued use constitutes acceptance of these terms.
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
                    <BookOpen className="w-5 h-5 text-red-600" />
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
              
              {/* Acceptance of Terms */}
              <section id="acceptance">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-red-600" />
                      Acceptance of Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 leading-relaxed">
                      By accessing and using Curio Market, you agree to be bound by these Terms of Service 
                      and all applicable laws and regulations. If you do not agree with any of these terms, 
                      you are prohibited from using or accessing this platform.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Platform Overview */}
              <section id="platform">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" />
                      Platform Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-zinc-300 leading-relaxed">
                      Curio Market is a specialized marketplace for oddities, curios, specimens, and related 
                      collectibles. We provide a platform connecting sellers and buyers, but we are not a 
                      party to individual transactions.
                    </p>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-red-600" />
                        Seller Requirements
                      </h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Monthly subscription fee of $10 per seller account</li>
                        <li>2.6% platform fee on completed sales (5.5% total with Stripe processing)</li>
                        <li>Compliance with all applicable laws and regulations</li>
                        <li>Accurate representation of all listed items</li>
                        <li>Proper documentation for regulated items</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Account Responsibilities */}
              <section id="accounts">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Account Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 leading-relaxed mb-4">Users are responsible for:</p>
                    <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                      <li>Maintaining the confidentiality of account credentials</li>
                      <li>All activities that occur under their account</li>
                      <li>Providing accurate and current information</li>
                      <li>Promptly updating account information when necessary</li>
                      <li>Notifying us immediately of any unauthorized use</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Marketplace Conduct */}
              <section id="conduct">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Marketplace Conduct
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Prohibited Activities</h3>
                      <p className="text-zinc-300 mb-3">Users may not:</p>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>List items that violate our Prohibited Items policy</li>
                        <li>Engage in fraudulent or deceptive practices</li>
                        <li>Manipulate reviews, ratings, or search results</li>
                        <li>Circumvent platform fees or payment systems</li>
                        <li>Harass, abuse, or threaten other users</li>
                        <li>Violate intellectual property rights</li>
                        <li>Use automated systems to access the platform</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Content Standards</h3>
                      <p className="text-zinc-300 mb-3">All content must be:</p>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Accurate and not misleading</li>
                        <li>Appropriate for the gothic/curiosity marketplace</li>
                        <li>Compliant with applicable laws</li>
                        <li>Free from harmful or illegal material</li>
                        <li>Respectful of other users and the community</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Transaction Terms */}
              <section id="transactions">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-red-600" />
                      Transaction Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Seller Obligations</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Accurate item descriptions and photographs</li>
                        <li>Proper packaging and timely shipping</li>
                        <li>Compliance with all applicable regulations</li>
                        <li>Responsive customer service</li>
                        <li>Honoring return policies as stated</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Buyer Obligations</h3>
                      <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                        <li>Payment in full upon purchase confirmation</li>
                        <li>Compliance with applicable import/export laws</li>
                        <li>Reasonable inspection period for returns</li>
                        <li>Following seller-specific policies</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Dispute Resolution</h3>
                      <p className="text-zinc-300">
                        Curio Market provides mediation services for transaction disputes. We reserve the 
                        right to make final determinations on disputed transactions and may withhold 
                        payments or impose penalties as necessary.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Payment and Fees */}
              <section id="fees">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-red-600" />
                      Payment and Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Seller Subscription</h3>
                      <p className="text-zinc-300">
                        All sellers must maintain an active monthly subscription ($10/month) to list items 
                        and receive payments. Subscriptions automatically renew unless cancelled.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Transaction Fees</h3>
                      <p className="text-zinc-300 mb-3">
                        A 2.6% platform fee is deducted from the final sale price of each completed transaction. 
                        Combined with Stripe's 2.9% processing fee, total fees are 5.5%. This covers payment 
                        processing, fraud protection, and platform maintenance.
                      </p>
                      
                      <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                        <h4 className="text-amber-400 font-medium mb-2">Fee Example:</h4>
                        <p className="text-zinc-300 text-sm">
                          On a $100 sale, total fees are $5.50 ($2.60 platform + $2.90 Stripe), leaving you with $94.50.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Refunds and Chargebacks</h3>
                      <p className="text-zinc-300">
                        Subscription fees are non-refundable. Transaction fees may be refunded in cases of 
                        seller violations or platform errors. Chargebacks may result in account suspension.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Limitation of Liability */}
              <section id="liability">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Scale className="w-5 h-5 text-red-600" />
                      Limitation of Liability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-zinc-300">
                      Curio Market acts as a marketplace platform and is not liable for:
                    </p>
                    <ul className="text-zinc-300 space-y-2 list-disc list-inside">
                      <li>Quality, safety, or legality of items listed</li>
                      <li>Truth or accuracy of seller representations</li>
                      <li>Actions or conduct of marketplace participants</li>
                      <li>Shipping delays or damage during transit</li>
                      <li>Loss of data or business interruption</li>
                    </ul>
                    <p className="text-zinc-300 font-medium">
                      Our total liability shall not exceed the fees paid by the user in the preceding 12 months.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Additional Terms */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Privacy & Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Your privacy is important to us. Please review our Privacy Policy to understand how we 
                      collect, use, and protect your information.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      Termination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      We may terminate accounts for violations of these terms, illegal activity, or conduct 
                      harmful to our platform or community.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card className="border-zinc-700 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Questions About These Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 mb-4">
                    If you have questions about these Terms of Service, please contact our legal team:
                  </p>
                  <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Email:</span> Info@curiosities.market
                      </p>
                      <p className="text-zinc-300">
                        <span className="text-red-400 font-medium">Subject:</span> Legal Inquiry - Terms of Service
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

export default TermsOfServiceStandalone;