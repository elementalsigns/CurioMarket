import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CategoryGrid from "@/components/category-grid";
import ProductCard from "@/components/product-card";
import { ChevronDown, Star, Shield, Scale, CreditCard, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const { data: featuredListings } = useQuery({
    queryKey: ["/api/listings/featured"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
          <div className="absolute inset-0 bg-background/75"></div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight" data-testid="hero-title">
            <span className="text-primary">Curio Market</span><br/>
            Buy and sell unique oddities
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto font-light" data-testid="hero-subtitle">
            Find rare specimens, vintage curiosities, and unique artifacts from collectors who share your passion for the unusual.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12" data-testid="hero-cta">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all hover:shadow-lg"
              data-testid="button-start-selling"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Selling
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground px-8 py-4 rounded-lg font-medium text-lg transition-all"
              data-testid="button-explore"
              onClick={() => window.location.href = '/browse'}
            >
              Browse Items
            </Button>
          </div>

          {/* Callout Box */}
          <Card className="glass-effect max-w-2xl mx-auto border-0 shadow-lg" data-testid="hero-callout">
            <CardContent className="p-6">
              <p className="text-foreground/90 text-lg">
                A marketplace where collectors and artists come together to buy and sell unique oddities and curiosities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-accent animate-bounce-gentle" data-testid="scroll-indicator">
          <ChevronDown className="text-2xl" />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="section-categories">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="categories-title">
              Popular Categories
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto" data-testid="categories-subtitle">
              From anatomical specimens to vintage oddities, find unique items that celebrate the unusual and extraordinary.
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20" data-testid="section-featured">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-2" data-testid="featured-title">
                Featured Items
              </h2>
              <p className="text-foreground/70" data-testid="featured-subtitle">
                Unique specimens and artifacts, carefully selected from our best sellers.
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-accent transition-colors font-medium"
              data-testid="button-view-all"
              onClick={() => window.location.href = '/browse'}
            >
              View All Items <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="featured-grid">
            {featuredListings?.map((listing: any) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* For Sellers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="section-sellers">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight" data-testid="sellers-title">
                Start Your <span className="text-primary">Online</span><br/>
                Curio Shop
              </h2>
              <p className="text-xl text-foreground/80 mb-8 leading-relaxed" data-testid="sellers-subtitle">
                Join thousands of collectors and artists who sell their unique pieces to customers who share your passion for oddities.
              </p>

              {/* Pricing Card */}
              <Card className="glass-effect border border-primary/30 mb-8" data-testid="pricing-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold">Seller Plan</h3>
                    <div className="text-3xl font-bold text-primary">
                      $10<span className="text-base text-foreground/60 font-normal">/month</span>
                    </div>
                  </div>
                  <p className="text-foreground/80 mb-4">
                    Keep more of your earnings with our low 3% fee on sales, plus standard payment processing.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-foreground/80">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Unlimited listings
                    </li>
                    <li className="flex items-center text-foreground/80">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Custom shop design
                    </li>
                    <li className="flex items-center text-foreground/80">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Direct messaging with buyers
                    </li>
                    <li className="flex items-center text-foreground/80">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      Sales analytics dashboard
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors"
                    data-testid="button-start-shop"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Start Your Shop
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border border-primary/30 rounded-lg shadow-md" data-testid="etsy-callout">
                <CardContent className="p-4">
                  <p className="text-foreground/90 text-center">
                    Where other platforms restrict the extraordinary, our marketplace celebrates the curious and unconventional within proper bounds.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              {/* Marketplace Image */}
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=80" 
                  alt="Victorian antique shop interior with curiosities and specimens" 
                  className="w-full h-auto"
                  data-testid="img-marketplace"
                />
              </div>
              
              {/* Floating Stats */}
              <Card className="absolute -top-6 -right-6 glass-effect border border-primary/30 shadow-lg" data-testid="stat-sellers">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">2.3K+</div>
                  <div className="text-sm text-foreground/80">Active Sellers</div>
                </CardContent>
              </Card>
              
              <Card className="absolute bottom-6 -left-6 glass-effect border border-accent/30 shadow-lg" data-testid="stat-revenue">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">$150K+</div>
                  <div className="text-sm text-foreground/80">Monthly Sales</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20" data-testid="section-trust">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-serif font-bold mb-4" data-testid="trust-title">
            Built on Trust & Safety
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-3xl mx-auto" data-testid="trust-subtitle">
            Our marketplace upholds the highest standards while celebrating extraordinary artifacts and specimens within legal boundaries.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12" data-testid="trust-features">
            <Card className="bg-muted/40 rounded-lg">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">
                  <Shield size={48} className="mx-auto text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Verified Sellers</h3>
                <p className="text-foreground/80">
                  All sellers undergo thorough verification and agree to our ethical sourcing guidelines.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/40 rounded-lg">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">
                  <Scale size={48} className="mx-auto text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Legal Compliance</h3>
                <p className="text-foreground/80">
                  We maintain strict adherence to regulations, excluding protected species and hazardous materials as required by law.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/40 rounded-lg">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">
                  <CreditCard size={48} className="mx-auto text-primary" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">Secure Payments</h3>
                <p className="text-foreground/80">
                  All payments are protected through our trusted Stripe partnership with comprehensive buyer protection.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/10 border border-primary/30 rounded-lg max-w-4xl mx-auto" data-testid="compliance-notice">
            <CardContent className="p-6">
              <p className="text-foreground/90">
                <strong>Notice:</strong> Our marketplace maintains rigorous seller verification, requires adherence to local laws, and prohibits illegal items. All sellers are responsible for compliance with applicable regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
