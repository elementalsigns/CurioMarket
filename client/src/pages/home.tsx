import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CategoryGrid from "@/components/category-grid";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Taxidermy", slug: "taxidermy" },
    { name: "Vintage Medical", slug: "vintage-medical" },
    { name: "Oddities", slug: "oddities" },
    { name: "Specimens", slug: "specimens" },
    { name: "Gothic Art", slug: "gothic-art" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'hsl(212, 5%, 5%)'}}>
      {/* Red Shipping Banner */}
      <div className="bg-[#6A1B1B] text-white text-center py-2 text-sm" data-testid="shipping-banner">
        Free shipping on orders over $75 • Support independent collectors and artists
      </div>
      
      <Header />
      
      <div style={{flex: 1, backgroundColor: 'hsl(212, 5%, 5%)'}}>
        {/* Hero Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 text-center" data-testid="hero-section">
          <div className="container mx-auto max-w-4xl">
            {/* Large Logo */}
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8" data-testid="hero-logo">
              <span className="script-initial">C</span>urio <span className="script-initial">M</span>arket
            </h1>
            
            {/* Hero Text */}
            <div className="mb-8">
              <p className="text-2xl md:text-3xl font-serif mb-4" data-testid="hero-tagline">
                Extraordinary oddities, curios & specimens.
              </p>
              <p className="text-xl md:text-2xl font-serif text-foreground/80" data-testid="hero-subtitle">
                For collectors with discerning taste.
              </p>
            </div>
            
            <p className="text-lg text-foreground/70 mb-12 max-w-2xl mx-auto" data-testid="hero-description">
              Find rare specimens, curiosities, and artifacts from collectors who share your passion
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto mb-8" data-testid="search-form">
              <Input
                type="text"
                placeholder="Search for oddities and curiosities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 mr-4 bg-background/50 border-border text-white placeholder:text-foreground/50"
                data-testid="search-input"
              />
              <Button 
                type="submit" 
                className="bg-[#6A1B1B] hover:bg-[#6A1B1B]/80 px-8"
                data-testid="search-button"
              >
                <Search className="mr-2" size={16} />
                Search
              </Button>
            </form>

            {/* Category Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-16" data-testid="category-tags">
              <Badge variant="outline" className="text-foreground border-border hover:bg-background/50">
                Popular
              </Badge>
              {categories.map((category) => (
                <Badge 
                  key={category.slug}
                  variant="outline" 
                  className="text-foreground border-border hover:bg-background/50 cursor-pointer"
                  onClick={() => navigate(`/browse?category=${category.slug}`)}
                  data-testid={`category-tag-${category.slug}`}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="categories-section">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="text-4xl font-serif font-bold mb-4" data-testid="categories-title">
                Shop our popular <span className="text-[#6A1B1B]">categories</span>
              </h2>
              <p className="text-lg text-foreground/70" data-testid="categories-subtitle">
                Browse thousands of unique items in every category imaginable
              </p>
            </div>

            <CategoryGrid />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
