import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Search, HelpCircle, Shield, MessageCircle, Book, AlertTriangle } from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is Curio Market?",
          a: "Curio Market is a specialized marketplace for oddities, curiosities, and unique specimens. We connect collectors and enthusiasts with sellers offering taxidermy, vintage medical items, gothic art, and other fascinating oddities."
        },
        {
          q: "How do I create an account?",
          a: "Click the 'Sign In' button in the header and you'll be taken through our secure authentication process. You can browse as a guest, but you'll need an account to make purchases or become a seller."
        },
        {
          q: "Is it safe to buy from Curio Market?",
          a: "Yes, we use secure payment processing through Stripe and have seller verification processes. All transactions are protected, and we have policies in place to ensure legal compliance."
        }
      ]
    },
    {
      category: "Buying",
      questions: [
        {
          q: "How do I search for specific items?",
          a: "Use the search bar on the homepage or browse by categories. You can filter by price, location, and item type to find exactly what you're looking for."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, debit cards, and digital wallets through our secure Stripe payment system."
        },
        {
          q: "How does shipping work?",
          a: "Shipping is handled directly between buyers and sellers. Each seller sets their own shipping policies and rates, which you'll see before completing your purchase."
        },
        {
          q: "What if I have issues with my order?",
          a: "Contact the seller first through our messaging system. If you can't resolve the issue, contact our support team for assistance."
        }
      ]
    },
    {
      category: "Selling",
      questions: [
        {
          q: "How much does it cost to sell on Curio Market?",
          a: "There's a $10/month subscription fee plus a 3% platform fee on completed sales. No listing fees or hidden costs."
        },
        {
          q: "What items are prohibited?",
          a: "We prohibit human remains, endangered species, threatened wildlife, illegal items, firearms, explosives, and hazardous materials. See our seller terms for the complete list."
        },
        {
          q: "Do I need permits to sell specimens?",
          a: "You are responsible for ensuring you have all required permits and documentation for items you sell. This may include CITES permits, hunting licenses, and import/export documentation."
        },
        {
          q: "How do I get paid?",
          a: "Payments are processed through Stripe and transferred to your account according to your payout schedule, minus platform fees."
        }
      ]
    },
    {
      category: "Legal & Safety",
      questions: [
        {
          q: "Are all items on Curio Market legal?",
          a: "Sellers are responsible for ensuring their items comply with all applicable laws. We have policies against prohibited items, but buyers should verify legality in their jurisdiction."
        },
        {
          q: "What about CITES regulations?",
          a: "Items from CITES-listed species require proper documentation. Sellers must provide permits when requested, and buyers should verify import requirements."
        },
        {
          q: "How do you handle age restrictions?",
          a: "Some items may have age restrictions. Sellers are responsible for age verification where required by law."
        }
      ]
    }
  ];

  const safetyGuidelines = [
    {
      title: "Verify Seller Credentials",
      content: "Check seller ratings, reviews, and shop policies before making purchases. Look for detailed descriptions and clear photos."
    },
    {
      title: "Know Your Local Laws",
      content: "Research local, state, and federal regulations for items you're buying. Some specimens may require permits or have import restrictions."
    },
    {
      title: "Inspect Items Carefully",
      content: "Examine photos closely and ask questions about condition, provenance, and any restoration work done on items."
    },
    {
      title: "Safe Handling Practices",
      content: "Some specimens may require special handling. Follow any safety instructions provided by the seller, especially for preserved specimens."
    },
    {
      title: "Secure Payment Only",
      content: "Always use our platform's secure payment system. Never send money outside the platform or provide payment information via messages."
    },
    {
      title: "Report Suspicious Activity",
      content: "Report any suspicious listings, inappropriate behavior, or potential violations of our terms to our support team immediately."
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        searchQuery === "" ||
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <div style={{flex: 1, backgroundColor: 'hsl(212, 5%, 5%)'}} className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-testid="help-header">
            <h1 className="text-4xl font-serif font-bold mb-4">
              Help <span className="text-red-600">Center</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions and learn how to make the most of Curio Market
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8 bg-zinc-900/50 border-zinc-800" data-testid="help-search">
            <CardContent className="p-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                  data-testid="search-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12" data-testid="quick-help-grid">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <HelpCircle className="mx-auto mb-4 text-red-600" size={48} />
                <h3 className="font-serif font-bold mb-2">Frequently Asked Questions</h3>
                <p className="text-sm text-muted-foreground">Common questions about buying, selling, and using Curio Market</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <Shield className="mx-auto mb-4 text-purple-600" size={48} />
                <h3 className="font-serif font-bold mb-2">Safety Guidelines</h3>
                <p className="text-sm text-muted-foreground">Best practices for safe and legal transactions</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <MessageCircle className="mx-auto mb-4 text-blue-600" size={48} />
                <h3 className="font-serif font-bold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Get personalized help from our support team</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="faq" className="space-y-8" data-testid="help-tabs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <Book size={16} />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="safety" className="flex items-center gap-2">
                <Shield size={16} />
                Safety
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageCircle size={16} />
                Contact
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6" data-testid="faq-tab">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="text-red-600" size={24} />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFAQ.length > 0 ? (
                    <div className="space-y-6">
                      {filteredFAQ.map((category, categoryIndex) => (
                        <div key={categoryIndex}>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-sm">
                              {category.category}
                            </Badge>
                          </div>
                          <Accordion type="single" collapsible className="space-y-2">
                            {category.questions.map((faq, faqIndex) => (
                              <AccordionItem 
                                key={faqIndex} 
                                value={`${categoryIndex}-${faqIndex}`}
                                className="border border-zinc-700 rounded-lg px-4 bg-zinc-900/30"
                              >
                                <AccordionTrigger className="text-left hover:no-underline">
                                  {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                  {faq.a}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                      <p className="text-sm">Try different search terms or browse all categories</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Safety Tab */}
            <TabsContent value="safety" className="space-y-6" data-testid="safety-tab">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="text-purple-600" size={24} />
                    Safety Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="text-amber-400" size={20} />
                        <h4 className="font-medium text-amber-400">Important Notice</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Curio Market deals with unique and sometimes regulated items. Always verify legal requirements and follow safety protocols when handling specimens and oddities.
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {safetyGuidelines.map((guideline, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-600 bg-zinc-900/30 border-zinc-800">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{guideline.title}</h4>
                            <p className="text-sm text-muted-foreground">{guideline.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6" data-testid="contact-tab">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="text-blue-600" size={24} />
                      Contact Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Email Support</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        For general inquiries, account issues, or seller support:
                      </p>
                      <Button variant="outline" className="w-full">
                        support@curiomarket.com
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Response Time</h4>
                      <p className="text-sm text-muted-foreground">
                        We typically respond within 24-48 hours during business days.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Before Contacting Support</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Check our FAQ section above</li>
                        <li>• Try searching for your specific issue</li>
                        <li>• Have your order number ready (if applicable)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Report Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Safety Concerns</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Report potentially illegal items or safety violations:
                      </p>
                      <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                        Report Safety Issue
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Seller Issues</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Problems with a specific seller or transaction:
                      </p>
                      <Button variant="outline" className="w-full">
                        Report Seller Issue
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Technical Problems</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Website bugs or technical difficulties:
                      </p>
                      <Button variant="outline" className="w-full">
                        Report Technical Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}