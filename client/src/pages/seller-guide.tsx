import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  BookOpen,
  Camera, 
  DollarSign,
  Package,
  Shield,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Clock,
  Award
} from "lucide-react";

export default function SellerGuide() {
  // Nuclear-level CSS override for white background issue
  useEffect(() => {
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
    
    // Apply comprehensive background fixes
    document.body.style.cssText = `
      background: hsl(212, 5%, 5%) !important;
      background-color: hsl(212, 5%, 5%) !important;
      margin: 0 !important;
      padding: 0 !important;
    `;
    document.documentElement.style.cssText = `
      background: hsl(212, 5%, 5%) !important;
      background-color: hsl(212, 5%, 5%) !important;
    `;

    // Force all potential white elements to use dark background
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .seller-guide-page,
      .seller-guide-page *,
      .seller-guide-page section,
      .seller-guide-page div,
      .seller-guide-page main,
      .seller-guide-page article,
      .seller-guide-page aside,
      .seller-guide-page nav,
      .seller-guide-page header,
      .seller-guide-page footer {
        background: hsl(212, 5%, 5%) !important;
        background-color: hsl(212, 5%, 5%) !important;
      }
      
      * {
        background: hsl(212, 5%, 5%) !important;
        background-color: hsl(212, 5%, 5%) !important;
      }
      
      body, html, #root {
        background: hsl(212, 5%, 5%) !important;
        background-color: hsl(212, 5%, 5%) !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div className="seller-guide-page min-h-screen bg-background flex flex-col" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)', minHeight: '100vh', height: '100%'}}>
      <div style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)', width: '100%', minHeight: '100vh'}}>
        <Header />
        
        <main className="flex-1" data-testid="seller-guide-main" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)', width: '100%'}}>
          {/* Hero Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-border" data-testid="hero-section" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)', width: '100%'}}>
            <div className="container mx-auto max-w-4xl" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
              <div className="text-center mb-12" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
                <div className="flex items-center justify-center gap-3 mb-6" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
                  <BookOpen className="h-12 w-12 text-gothic-red" data-testid="hero-icon" />
                  <h1 className="text-5xl font-serif font-bold" data-testid="hero-title">
                    Seller's <span className="text-gothic-red">Guide</span>
                  </h1>
                </div>
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed" data-testid="hero-subtitle">
                  Transform your passion for the macabre into a thriving business. Learn everything you need to know about selling on Curio Market, from creating compelling listings to building a loyal customer base.
                </p>
                <div className="mt-8" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
                  <Link to="/seller/terms">
                    <Button size="lg" className="bg-gothic-red hover:bg-gothic-red/80 text-white px-8 py-4 text-lg font-medium" data-testid="start-selling-button">
                      Start Selling Today
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

        {/* Quick Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background" data-testid="stats-section" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)', width: '100%'}}>
          <div className="container mx-auto max-w-6xl" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
              <Card className="text-center" data-testid="stat-sellers">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-gothic-red mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">1,200+</div>
                  <div className="text-foreground/70">Active Sellers</div>
                </CardContent>
              </Card>
              <Card className="text-center" data-testid="stat-revenue">
                <CardContent className="pt-6">
                  <DollarSign className="h-8 w-8 text-gothic-red mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">$850</div>
                  <div className="text-foreground/70">Average Monthly Revenue</div>
                </CardContent>
              </Card>
              <Card className="text-center" data-testid="stat-success">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-gothic-red mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">94%</div>
                  <div className="text-foreground/70">Seller Satisfaction Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="getting-started-section" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4" data-testid="getting-started-title">
                Getting Started
              </h2>
              <p className="text-xl text-foreground/70" data-testid="getting-started-subtitle">
                Your journey to becoming a successful seller begins here
              </p>
            </div>

            <div className="space-y-8">
              {/* Step 1 */}
              <Card className="border-l-4 border-l-gothic-red" data-testid="step-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gothic-red text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <span>Create Your Seller Account</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Sign up and complete our seller verification process. We'll need some basic information about you and your business.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Business Information</div>
                        <div className="text-sm text-foreground/70">Shop name, location, and business type</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Subscription Setup</div>
                        <div className="text-sm text-foreground/70">$10/month + 3% transaction fee</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-l-4 border-l-gothic-red" data-testid="step-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gothic-red text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <span>Set Up Your Shop</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Create a compelling shop profile that tells your story and builds trust with potential customers.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Camera className="h-5 w-5 text-gothic-red mt-0.5" />
                      <div>
                        <div className="font-medium">Shop Banner & Avatar</div>
                        <div className="text-sm text-foreground/70">High-quality images that reflect your brand</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-gothic-red mt-0.5" />
                      <div>
                        <div className="font-medium">Shop Story & Policies</div>
                        <div className="text-sm text-foreground/70">Tell customers about your passion and expertise</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-l-4 border-l-gothic-red" data-testid="step-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gothic-red text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <span>List Your First Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/70">
                    Create detailed, compelling listings that showcase the unique history and provenance of your items.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gothic-red mt-0.5" />
                      <div>
                        <div className="font-medium">Item Details</div>
                        <div className="text-sm text-foreground/70">Title, description, provenance, and pricing</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-gothic-red mt-0.5" />
                      <div>
                        <div className="font-medium">Legal Compliance</div>
                        <div className="text-sm text-foreground/70">Ensure all items meet our guidelines</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/20" data-testid="best-practices-section">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4" data-testid="best-practices-title">
                Best Practices for Success
              </h2>
              <p className="text-xl text-foreground/70" data-testid="best-practices-subtitle">
                Learn from our most successful sellers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Photography */}
              <Card data-testid="practice-photography">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Camera className="h-6 w-6 text-gothic-red" />
                    <span>Professional Photography</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    High-quality photos are essential for selling curiosities and specimens.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use natural lighting or professional setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Show multiple angles and close-up details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include scale references when helpful</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Descriptions */}
              <Card data-testid="practice-descriptions">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-gothic-red" />
                    <span>Detailed Descriptions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Tell the story behind each piece to captivate collectors.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include historical context and provenance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Mention condition, age, and materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Be transparent about any flaws or repairs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card data-testid="practice-pricing">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-gothic-red" />
                    <span>Strategic Pricing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Price competitively while valuing your unique pieces appropriately.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Research similar items and market rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Factor in rarity, condition, and provenance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Consider shipping costs in your pricing</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Customer Service */}
              <Card data-testid="practice-service">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-gothic-red" />
                    <span>Excellent Service</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Build loyalty through outstanding customer experience.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Respond to messages within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Package items securely and beautifully</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Provide tracking information promptly</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Legal Compliance */}
              <Card data-testid="practice-legal">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-gothic-red" />
                    <span>Legal Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Stay compliant with all relevant laws and regulations.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>No human remains or endangered species</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Document provenance and legality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Follow international shipping regulations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Community */}
              <Card data-testid="practice-community">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-gothic-red" />
                    <span>Build Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/70">
                    Engage with the community to grow your reputation and sales.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Share knowledge about your specialties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Participate in discussions and forums</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Build relationships with repeat customers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Fees and Pricing */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="fees-section" style={{backgroundColor: 'hsl(212, 5%, 5%)', background: 'hsl(212, 5%, 5%)'}}>
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4" data-testid="fees-title">
                Transparent Pricing
              </h2>
              <p className="text-xl text-foreground/70" data-testid="fees-subtitle">
                Simple, straightforward fees with no hidden charges
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-gothic-red" data-testid="subscription-card">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Award className="h-6 w-6 text-gothic-red" />
                    Monthly Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-4xl font-bold text-gothic-red">$10</div>
                  <div className="text-foreground/70">per month</div>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Unlimited listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Professional shop tools</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Analytics and reporting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Priority customer support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card data-testid="transaction-card">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <DollarSign className="h-6 w-6 text-gothic-red" />
                    Transaction Fee
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-4xl font-bold">3%</div>
                  <div className="text-foreground/70">per completed sale</div>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Only charged on successful sales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure payment processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Automatic payouts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Fraud protection included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-foreground/60">
                <strong>Example:</strong> If you sell an item for $100, you keep $87 after the 3% transaction fee and monthly subscription prorated daily.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30" data-testid="cta-section">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-serif font-bold mb-6" data-testid="cta-title">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-foreground/70 mb-8" data-testid="cta-subtitle">
              Join our community of passionate collectors and turn your expertise into profit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/seller/terms">
                <Button size="lg" className="bg-gothic-red hover:bg-gothic-red/80 text-white px-8 py-4" data-testid="cta-start-button">
                  Start Selling Now
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg" className="border-border hover:bg-background/50 px-8 py-4" data-testid="cta-help-button">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

        <Footer />
      </div>
    </div>
  );
}