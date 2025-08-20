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
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: featuredListings, error: featuredError } = useQuery({
    queryKey: ["/api/listings/featured"],
  });

  const { data: favorites, error: favoritesError } = useQuery({
    queryKey: ["/api/user/favorites"],
    enabled: !!user,
  });

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

  useEffect(() => {
    if (favoritesError && isUnauthorizedError(favoritesError as Error)) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [favoritesError, toast]);

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
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4" data-testid="welcome-title">
              Welcome back, {(user as any)?.firstName || 'Collector'}
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto" data-testid="welcome-subtitle">
              Discover new oddities and manage your collection
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-16" data-testid="quick-actions">
            <Card className="glass-effect hover-lift cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="mx-auto mb-4 text-gothic-purple" size={48} />
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

            <Card className="glass-effect hover-lift cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-4 text-gothic-red" size={48} />
                <h3 className="text-xl font-serif font-bold mb-2">Your Favorites</h3>
                <p className="text-foreground/70 mb-4">
                  {(favorites as any)?.length || 0} items saved for later
                </p>
                <Button variant="outline" data-testid="button-view-favorites">
                  View Favorites
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-lift cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="mx-auto mb-4 text-yellow-500" size={48} />
                <h3 className="text-xl font-serif font-bold mb-2">Become a Seller</h3>
                <p className="text-foreground/70 mb-4">
                  Share your oddities with collectors worldwide
                </p>
                <Link to="/seller/onboard">
                  <Button className="bg-gothic-red hover:bg-gothic-red/80" data-testid="button-become-seller">
                    Start Selling
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="section-categories">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="featured-grid">
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
