import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import SearchFilters from "@/components/search-filters";
import { Search, Filter, Grid, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search", searchQuery, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      
      return fetch(`/api/search?${params.toString()}`).then(res => res.json());
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to dependency on searchQuery
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4" data-testid="browse-title">
            Browse Oddities
          </h1>
          <p className="text-xl text-foreground/70" data-testid="browse-subtitle">
            Discover unique specimens, artifacts, and curiosities from verified sellers
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4" data-testid="search-form">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
              <Input
                type="text"
                placeholder="Search for oddities, specimens, occult art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-input border-border rounded-2xl"
                data-testid="input-search"
              />
            </div>
            <Button type="submit" size="lg" className="px-8 rounded-2xl" data-testid="button-search">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="glass-effect sticky top-4" data-testid="filters-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-serif font-bold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                    data-testid="button-close-filters"
                  >
                    ✕
                  </Button>
                </div>
                
                <SearchFilters 
                  filters={filters} 
                  onFiltersChange={setFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6" data-testid="results-header">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden"
                  data-testid="button-show-filters"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                
                <span className="text-foreground/70" data-testid="results-count">
                  {searchResults?.total || 0} results found
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List size={16} />
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : searchResults?.listings?.length > 0 ? (
              <div 
                className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
                data-testid="results-grid"
              >
                {searchResults.listings.map((listing: any) => (
                  <ProductCard 
                    key={listing.id} 
                    listing={listing} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-effect" data-testid="no-results">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4 opacity-50">🔍</div>
                  <h3 className="text-xl font-serif font-bold mb-2">No oddities found</h3>
                  <p className="text-foreground/70 mb-6">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setFilters({
                        category: "",
                        minPrice: "",
                        maxPrice: "",
                        sortBy: "newest",
                      });
                    }}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {searchResults?.total > 20 && (
              <div className="flex justify-center mt-12" data-testid="pagination">
                <div className="flex gap-2">
                  <Button variant="outline" disabled data-testid="button-prev-page">
                    Previous
                  </Button>
                  <Button variant="outline" className="bg-primary text-primary-foreground" data-testid="button-current-page">
                    1
                  </Button>
                  <Button variant="outline" data-testid="button-next-page">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
