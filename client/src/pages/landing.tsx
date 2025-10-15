import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CategoryGrid from "@/components/category-grid";
import ProductCard from "@/components/product-card";
import { ChevronDown, Star, Shield, Scale, CreditCard, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import skullDomeImage from "@assets/IMG_6766_1760568343546.jpg";
import skullCandleImage from "@assets/IMG_6757_1760567194789.jpg";

function ActiveSellersDisplay() {
  const { data: activeSellerCount, isLoading } = useQuery({
    queryKey: ["/api/stats/active-sellers"],
    queryFn: () => fetch("/api/stats/active-sellers").then(res => res.json()),
    refetchInterval: 30000, // Update every 30 seconds
  });

  if (isLoading) {
    return <div className="text-2xl font-bold text-primary">...</div>;
  }

  const count = activeSellerCount?.count || 0;
  const formattedCount = count > 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}`;

  return <div className="text-2xl font-bold text-primary">{formattedCount}</div>;
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: featuredListings = [] } = useQuery({
    queryKey: ["/api/listings/random"],
  });

  // Fetch user favorites (silently fail if not authenticated)
  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    retry: false, // Don't retry if auth fails
    refetchOnWindowFocus: false, // Prevent constant refetching
  });

  // Toggle favorites mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        return apiRequest("DELETE", `/api/favorites/${listingId}`);
      } else {
        return apiRequest("POST", "/api/favorites", { listingId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    },
    onError: (error: any) => {
      if (error.message?.includes('Authentication required')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to favorites.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update favorites. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleToggleFavorite = (listingId: string, isFavorited: boolean) => {
    toggleFavoriteMutation.mutate({ listingId, isFavorited });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="page-layout bg-gradient-to-br from-black via-black to-zinc-900">
      <Header />
      <div className="page-content">
      {/* Announcement Bar - Black & Red Theme */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4">
        <p className="text-sm font-medium">
          Free shipping on many items • Support independent collectors and artists
        </p>
      </div>
      {/* Hero Section - Foxblood Noir Style */}
      <section className="relative bg-gradient-to-b from-black via-zinc-900 to-black py-12 sm:py-16 lg:py-20" data-testid="hero-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Content */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl curio-logo font-bold mb-8 leading-[0.9]" data-testid="hero-title">
                <span>
                  <span className="script-initial">C</span><span className="slow-letter">u</span>r<span className="slow-letter">i</span>o
                </span>{" "}
                <span className="font-black">
                  <span className="script-initial">M</span>arket
                </span>
              </h1>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-light mb-8 text-muted-foreground leading-relaxed">
                Extraordinary oddities, curios & specimens.<br />
                <span className="text-foreground/70">For collectors with discerning taste.</span>
              </h2>

              <p className="text-foreground/80 mb-8 text-[17px]">Find rare specimens, curiosities, and artifacts from collectors who share your passion </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <Input 
                    type="text" 
                    placeholder="Search for oddities and curiosities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 text-base bg-input border-border rounded-full px-6"
                    data-testid="hero-search"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg" 
                  className="bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow"
                  data-testid="button-search"
                >
                  Search
                </Button>
              </form>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-sm text-foreground/60">Popular:</span>
                {[
                  { name: 'Taxidermy', slug: 'taxidermy' },
                  { name: 'Vintage', slug: 'vintage' },
                  { name: 'Wet Specimens', slug: 'wet-specimens' },
                  { name: 'Bones & Skulls', slug: 'bones-skulls' },
                  { name: 'Antique', slug: 'antique' },
                  { name: 'Occult', slug: 'occult' },
                  { name: 'Funeral', slug: 'funeral' },
                  { name: 'Oddities', slug: 'oddities' }
                ].map((tag) => (
                  <Link key={tag.slug} to={`/browse?category=${tag.slug}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs px-3 py-1 border-border transition-colors cursor-pointer"
                      style={{ 
                        color: 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'hsl(0, 77%, 26%)';
                        e.currentTarget.style.borderColor = 'hsl(0, 77%, 26%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'inherit';
                        e.currentTarget.style.borderColor = '';
                      }}
                      data-testid={`tag-${tag.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {tag.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Promotional Boxes */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-zinc-900">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Box - Holidays Keep it Creepy */}
            <Link to="/browse">
              <div className="relative overflow-hidden rounded-lg cursor-pointer group h-80 border border-primary/20 hover:border-primary transition-all">
                <div className="grid grid-cols-2 h-full">
                  {/* Left Half - Text */}
                  <div className="flex flex-col justify-center px-8">
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
                      Holidays<br />Keep it Creepy
                    </h3>
                    <Button 
                      className="w-fit bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-3 rounded-full font-medium"
                      data-testid="button-holiday-shop"
                    >
                      Shop
                    </Button>
                  </div>
                  {/* Right Half - Skull Dome Image */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={skullDomeImage} 
                      alt="Holiday Collection"
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity brightness-125"
                    />
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Right Box - Featured Seller Shop */}
            <div 
              onClick={async () => {
                try {
                  const response = await fetch('/api/sellers/random');
                  const data = await response.json();
                  if (data.shopSlug) {
                    setLocation(`/shop/${data.shopSlug}`);
                  }
                } catch (error) {
                  console.error('Error fetching random seller:', error);
                }
              }}
              className="relative overflow-hidden rounded-lg cursor-pointer group h-80 bg-black border border-primary/20 hover:border-primary transition-all"
              data-testid="featured-seller-box"
            >
              <div className="absolute inset-0">
                <img 
                  src={skullCandleImage} 
                  alt="Featured Seller"
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity brightness-125"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-transparent"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-end px-8 sm:px-12 text-right">
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
                  Featured Seller<br />Shop
                </h3>
                <p className="text-white/80 text-sm">Discover unique collections</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Shop by Category - Etsy Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30" data-testid="section-categories">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold mb-2" data-testid="categories-title">
              Shop our popular <span className="text-primary">categories</span>
            </h2>
            <p className="text-foreground/70" data-testid="categories-subtitle">
              Browse thousands of unique items in every category imaginable
            </p>
          </div>

          <CategoryGrid />
          
          {/* Quick Categories Bar */}
          <div className="mt-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { name: 'Taxidermy', slug: 'taxidermy' }, 
                { name: 'Bones & Skulls', slug: 'bones-skulls' }, 
                { name: 'Medical Art', slug: 'medical-art' }, 
                { name: 'Wet Specimens', slug: 'wet-specimens' },
                { name: 'Antique', slug: 'antique' },
                { name: 'Divination', slug: 'divination' },
                { name: 'Jewelry', slug: 'jewelry' },
                { name: 'Occult', slug: 'occult' },
                { name: 'Wall Art', slug: 'wall-art' },
                { name: 'Crystals', slug: 'crystals' },
                { name: 'Murderabilia', slug: 'murderabilia' }
              ].map((category) => (
                <Link key={category.slug} to={`/browse?category=${category.slug}`}>
                  <Button 
                    variant="outline" 
                    className="rounded-full px-4 py-2 border-border hover:border-[hsl(0,77%,26%)] transition-colors cursor-pointer"
                    style={{ 
                      color: 'inherit',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'hsl(0, 77%, 26%)';
                      e.currentTarget.style.borderColor = 'hsl(0, 77%, 26%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'inherit';
                      e.currentTarget.style.borderColor = '';
                    }}
                    data-testid={`category-${category.slug}`}
                  >
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Featured Products - Etsy Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-800" data-testid="section-featured">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2" data-testid="featured-title">
                Oddities and Curiosities
              </h2>
              <p className="text-foreground/70" data-testid="featured-subtitle">
                Brought to you by our community of collectors
              </p>
            </div>
            <Button 
              variant="ghost"
              className="text-primary hover:text-primary/80 hover:bg-transparent p-0"
              data-testid="button-view-all"
              onClick={() => window.location.href = '/browse'}
            >
              See more <ArrowRight className="ml-1" size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" data-testid="featured-grid">
            {Array.isArray(featuredListings) && featuredListings.slice(0, 12).map((listing: any) => {
              const isFavorited = Array.isArray(userFavorites) && userFavorites.includes(listing.id);
              return (
                <ProductCard 
                  key={listing.id} 
                  listing={listing}
                  isFavorited={isFavorited}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        </div>
      </section>
      {/* What makes Curio Market special - Etsy Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30" data-testid="section-special">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">What makes <span className="text-primary">Curio Market</span> special</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              A global marketplace for unique and creative goods, connecting collectors with passionate sellers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Secure payments</h3>
              <p className="text-foreground/70">
                Shop with confidence knowing your payment information is always protected
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Quality guarantee</h3>
              <p className="text-foreground/70">
                Every item is carefully vetted to ensure authenticity and quality
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Scale className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Fair marketplace</h3>
              <p className="text-foreground/70">
                Supporting independent collectors with transparent, fair selling terms
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* For Sellers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-bl from-black via-zinc-900 to-black" data-testid="section-sellers">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6 leading-tight" data-testid="sellers-title">
                Turn your passion into a business
              </h2>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed" data-testid="sellers-subtitle">
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
                    Keep more of your earnings with our 2.6% platform fee. Total fees are just 5.5% including Stripe processing.
                  </p>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-foreground/90"><strong>Fee Example:</strong> On a $100 sale, you keep $94.20 after all fees ($2.60 platform + $2.90 Stripe + $0.30 fixed).</p>
                  </div>
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
              {/* Artem Mortis YouTube Video */}
              <div className="rounded-lg overflow-hidden shadow-2xl aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/gpYvMDizBsU" 
                  title="Cabinet of Curiosities - Vintage Oddities & Specimens"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  data-testid="video-artem-mortis"
                />
              </div>
              
              {/* Floating Stats */}
              <Card className="absolute -top-6 -right-6 glass-effect border border-primary/30 shadow-lg" data-testid="stat-sellers">
                <CardContent className="p-4 text-center">
                  <ActiveSellersDisplay />
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

          <Card className="bg-red-600/10 border border-red-600/30 rounded-lg max-w-4xl mx-auto" data-testid="compliance-notice">
            <CardContent className="p-6">
              <p className="text-foreground/90">
                <strong className="text-red-600">Notice:</strong> Our marketplace maintains rigorous seller verification, requires adherence to local laws, and prohibits illegal items. All sellers are responsible for compliance with applicable regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
