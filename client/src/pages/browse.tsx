import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchFilters } from "@/components/search-filters";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Filter, Save, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";

export default function Browse() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearchDialog, setShowSaveSearchDialog] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const { toast } = useToast();

  // Extract URL parameters whenever the location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || "";
    const q = urlParams.get('q') || "";
    
    setFilters(prev => ({ ...prev, category }));
    setSearchQuery(q);
  }, [location]);

  // Function to update URL when filters change
  const updateURL = (newFilters: typeof filters, newSearchQuery: string = searchQuery) => {
    const params = new URLSearchParams();
    if (newSearchQuery) params.set('q', newSearchQuery);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    
    const newURL = params.toString() ? `/browse?${params.toString()}` : '/browse';
    navigate(newURL, { replace: true });
  };

  // Enhanced filter change handler that updates URL
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Simple fetch function without React Query complications
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (filters.category) params.append("category", filters.category);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        
        const response = await fetch(`/api/search?${params.toString()}`);
        const result = await response.json();
        setSearchResults(result);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [filters.category, searchQuery, filters.minPrice, filters.maxPrice, filters.sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(filters, searchQuery);
  };

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => fetch("/api/categories").then(res => res.json()),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories || []}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <Input
                    placeholder="Search for oddities, specimens, occult art..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                    data-testid="input-search"
                  />
                  <Button type="submit" data-testid="button-search">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                  data-testid="button-toggle-filters"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                
                <div className="text-zinc-400" data-testid="text-results-count">
                  {isLoading ? "Loading..." : `${searchResults?.total || 0} results found`}
                </div>

                {searchResults?.total > 0 && (
                  <Dialog open={showSaveSearchDialog} onOpenChange={setShowSaveSearchDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-save-search">
                        <Save size={16} className="mr-2" />
                        Save Search
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Save Search</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          Save this search to get notified of new matching items
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <Input
                          data-testid="input-search-name"
                          placeholder="Enter search name..."
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={() => {
                            // Save search logic would go here
                            toast({ title: "Search Saved", description: "You'll be notified of new matching items" });
                            setShowSaveSearchDialog(false);
                            setSearchName("");
                          }}
                          disabled={!searchName}
                          className="bg-red-600 hover:bg-red-700"
                          data-testid="button-confirm-save-search"
                        >
                          Save Search
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

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
                    onAddToWishlist={() => {
                      setSelectedListing(listing.id);
                      setShowWishlistDialog(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-results">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-700" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No oddities found</h3>
                <p className="text-zinc-400 mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({ category: "", minPrice: "", maxPrice: "", sortBy: "newest" });
                    navigate('/browse');
                  }}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}