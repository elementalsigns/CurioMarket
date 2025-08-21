import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Grid, 
  List, 
  Star, 
  Heart, 
  Eye, 
  TrendingUp,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { Link, useLocation } from "wouter";
import AdvancedSearch from "@/components/advanced-search";
import ProductRecommendations from "@/components/product-recommendations";

interface SearchResult {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerId: string;
  isOnSale: boolean;
  views: number;
  favoriteCount: number;
  isFavorited: boolean;
  createdAt: string;
}

export default function ComprehensiveSearch() {
  const [, setLocation] = useLocation();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentQuery, setCurrentQuery] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || "";

  useEffect(() => {
    if (initialQuery && !currentQuery) {
      setCurrentQuery(initialQuery);
    }
  }, [initialQuery]);

  // Handle search results from AdvancedSearch component
  const handleSearch = (searchData: any) => {
    setSearchResults(searchData.results);
    setTotalResults(searchData.total || searchData.results.length);
    setCurrentQuery(searchData.query || "");
    setCurrentPage(1);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchData.query) params.set('q', searchData.query);
    if (searchData.category) params.set('category', searchData.category);
    if (searchData.priceMin) params.set('priceMin', searchData.priceMin.toString());
    if (searchData.priceMax) params.set('priceMax', searchData.priceMax.toString());
    if (searchData.condition) params.set('condition', searchData.condition);
    if (searchData.sortBy) params.set('sort', searchData.sortBy);
    
    setLocation(`/search${params.toString() ? '?' + params.toString() : ''}`);
  };

  const ProductCard = ({ product }: { product: SearchResult }) => (
    <Card className="glass-effect group hover:ring-1 hover:ring-red-600 transition-all">
      <CardContent className={`p-4 ${viewMode === "list" ? "flex gap-4" : ""}`}>
        <div className={`relative ${viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square mb-4"} overflow-hidden rounded-lg`}>
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
            />
          </Link>
          
          {product.isOnSale && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white">
              Sale
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart 
              size={16} 
              className={product.isFavorited ? "fill-red-500 text-red-500" : "text-white"} 
            />
          </Button>

          <div className="absolute bottom-2 left-2 flex gap-1">
            <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
              <Eye size={12} className="mr-1" />
              {product.views}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-black/70 text-white border-none">
              <Heart size={12} className="mr-1" />
              {product.favoriteCount}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-medium text-white hover:text-red-400 transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
            <Link to={`/seller/${product.sellerId}`}>
              <p className="text-zinc-400 text-sm hover:text-zinc-300 transition-colors">
                by {product.sellerName}
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-zinc-400 text-sm">{product.rating}</span>
              <span className="text-zinc-500 text-sm">({product.reviewCount})</span>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Add to Cart
              </Button>
              <Button variant="outline" size="sm" className="text-zinc-300 border-zinc-600">
                Quick View
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Search Curio Market
          </h1>
          <p className="text-zinc-400 text-lg">
            Discover unique oddities, curios, and specimens from our gothic marketplace
          </p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch 
          onSearch={handleSearch} 
          initialQuery={initialQuery}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Search Results
                  {currentQuery && (
                    <span className="text-zinc-400 font-normal"> for "{currentQuery}"</span>
                  )}
                </h2>
                <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                  {totalResults.toLocaleString()} results
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex bg-zinc-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-red-600 hover:bg-red-700" : "text-zinc-400 hover:text-white"}
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-red-600 hover:bg-red-700" : "text-zinc-400 hover:text-white"}
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="glass-effect animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-zinc-700 rounded mb-4"></div>
                      <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                      <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Results Grid/List */}
            {!isLoading && (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More / Pagination */}
            {searchResults.length < totalResults && (
              <div className="text-center">
                <Button
                  variant="outline"
                  className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  onClick={() => {
                    // Load more results logic
                    setCurrentPage(prev => prev + 1);
                  }}
                >
                  Load More Results ({searchResults.length} of {totalResults})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && currentQuery && !isLoading && (
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-zinc-800 rounded-full flex items-center justify-center">
                <Filter size={48} className="text-zinc-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No results found for "{currentQuery}"
              </h3>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters. You can also browse our categories or check out trending items.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild variant="outline" className="text-zinc-300 border-zinc-600">
                  <Link to="/browse">Browse All Products</Link>
                </Button>
                <Button asChild variant="outline" className="text-zinc-300 border-zinc-600">
                  <Link to="/categories">Shop by Category</Link>
                </Button>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link to="/trending">See Trending</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {!currentQuery && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Discover Amazing Finds
              </h2>
              <p className="text-zinc-400 text-lg">
                Explore curated collections and trending items
              </p>
            </div>

            <ProductRecommendations />
          </div>
        )}

        {/* Search Suggestions */}
        {searchResults.length === 0 && !currentQuery && (
          <Card className="glass-effect">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "vintage taxidermy",
                  "gothic art",
                  "occult curiosities",
                  "antique bones",
                  "preserved specimens",
                  "dark academia",
                  "Victorian oddities",
                  "macabre collectibles"
                ].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSearch({ query: term, results: [] });
                    }}
                    className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}