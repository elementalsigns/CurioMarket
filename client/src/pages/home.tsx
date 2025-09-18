import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CategoryGrid from "@/components/category-grid";
import ProductCard from "@/components/product-card";
import { ArrowRight, Heart, ShoppingCart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function Home() {
  const { user, isLoading, isSeller } = useAuth();
  const { toast } = useToast();
  
  // Debug production user detection
  useEffect(() => {
    if (user) {
      // SURGICAL FIX: Use isSeller from useAuth hook (don't override it)
      const hasStripeId = !!(user as any)?.stripeCustomerId;
      console.log('[PRODUCTION REDIRECT] User loaded:', {
        userId: (user as any)?.id,
        role: (user as any)?.role,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        isProduction: process.env.NODE_ENV === 'production',
        isSeller,
        hasStripeId,
        shouldShowDashboard: isSeller || hasStripeId
      });
    }
  }, [user, isSeller]);

  const { data: featuredListings, error: featuredError } = useQuery({
    queryKey: ["/api/listings/featured"],
  });

  const { data: wishlists } = useQuery({
    queryKey: ["/api/wishlists"],
    enabled: !!user,
  });


  const { data: sellerProfile } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user && ((user as any)?.role === 'seller' || (user as any)?.role === 'admin'),
    retry: false, // Don't retry if user is not a seller
  });

  // Determine if user should see seller dashboard
  // SURGICAL FIX: Use isSeller from useAuth (reads capabilities)
  const showSellerDashboard = isSeller;

  useEffect(() => {
    if (featuredError && isUnauthorizedError(featuredError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [featuredError, toast]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'hsl(212, 5%, 5%)'}}>
      <Header />
      
      <div style={{flex: 1, backgroundColor: 'hsl(212, 5%, 5%)'}}>
      {/* Welcome Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="section-welcome">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-6xl font-serif font-bold mb-4 transition-colors cursor-pointer" 
              style={{
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('color', '#6A1B1B', 'important');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('color', '', 'important');
              }}
              data-testid="welcome-title"
            >
              {console.log(`[LIVE TEST] Welcome text rendering: isSeller=${isSeller} → Showing "${isSeller ? 'Curator' : 'Collector'}"`)}
              Welcome back, {isSeller ? 'Curator' : 'Collector'}
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto" data-testid="welcome-subtitle">
              {isSeller ? 'Manage your shop and discover new treasures to offer' : 'Discover new oddities and manage your collection'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16" data-testid="quick-actions">
            <Card className="glass-effect hover-lift cursor-pointer border border-border hover:border-red-700 transition-colors">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="mx-auto mb-4" style={{color: '#6A1B1B'}} size={48} />
                <h3 className="text-xl font-serif font-bold mb-2">Browse Market</h3>
                <p className="text-foreground/70 mb-4">
                  Explore thousands of unique oddities and curios
                </p>
                <Link to="/browse">
                  <Button variant="outline" data-testid="button-browse-market">
                    Start Browsing
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-lift cursor-pointer border border-border hover:border-red-700 transition-colors">
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-4" style={{color: '#6A1B1B'}} size={48} />
                <h3 className="text-xl font-serif font-bold mb-2">Your Favorites</h3>
                <p className="text-foreground/70 mb-4">
                  Items saved for later
                </p>
                <Link to="/wishlists">
                  <Button variant="outline" data-testid="button-view-favorites">
                    View Favorites
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-lift cursor-pointer border border-border hover:border-red-700 transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="mx-auto mb-4" style={{color: '#6A1B1B'}} size={48} />
                {user && showSellerDashboard ? (
                  <>
                    <h3 className="text-xl font-serif font-bold mb-2">Seller Dashboard</h3>
                    <p className="text-foreground/70 mb-4">
                      Manage your listings and view analytics
                    </p>
                    <Link to="/seller/dashboard">
                      <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-seller-dashboard">
                        View Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-serif font-bold mb-2">Become a Seller</h3>
                    <p className="text-foreground/70 mb-4">
                      Share your oddities with collectors worldwide
                    </p>
                    <Link to="/subscribe">
                      <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-become-seller">
                        Start Selling
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="section-categories">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4" data-testid="categories-title">
              Explore Categories
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto" data-testid="categories-subtitle">
              Find exactly what speaks to your dark curiosity
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-800" data-testid="section-recently-viewed">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2" data-testid="recently-viewed-title">
                Recently viewed & more like this
              </h2>
              <p className="text-foreground/70" data-testid="recently-viewed-subtitle">
                Items you've browsed and similar oddities
              </p>
            </div>
            <Link to="/browse">
              <Button 
                variant="ghost"
                className="text-primary hover:text-primary/80 hover:bg-transparent p-0"
                data-testid="button-view-more"
              >
                See more <ArrowRight className="ml-1" size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" data-testid="recently-viewed-grid">
            {Array.isArray(featuredListings) && (featuredListings as any)?.map((listing: any) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="section-featured">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold mb-2" data-testid="featured-title">
                Recently Added
              </h2>
              <p className="text-foreground/70" data-testid="featured-subtitle">
                Fresh oddities from our community of collectors
              </p>
            </div>
            <Link to="/browse">
              <Button 
                variant="ghost" 
                className="text-gothic-purple hover:text-gothic-red transition-colors font-medium"
                data-testid="button-view-all"
              >
                View All <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch" data-testid="featured-grid">
            {(featuredListings as any)?.map((listing: any) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
}
