import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, X, MapPin, Clock, Star, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.string().optional(),
});

type SearchFilters = z.infer<typeof searchSchema>;

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters & { results: any[] }) => void;
  initialQuery?: string;
}

export default function AdvancedSearch({ onSearch, initialQuery = "" }: AdvancedSearchProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useForm<SearchFilters>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: initialQuery,
      sortBy: "relevance",
    },
  });

  // Get categories for filter
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Get recent searches
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Search suggestions based on input
  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions", form.watch("query")],
    enabled: !!form.watch("query") && form.watch("query")!.length > 2,
  });

  useEffect(() => {
    if (suggestions) {
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    }
  }, [suggestions]);

  // Perform search
  const searchMutation = useMutation({
    mutationFn: async (filters: SearchFilters) => {
      const response = await apiRequest("POST", "/api/search", filters);
      return response;
    },
    onSuccess: (data, variables) => {
      // Save to recent searches
      if (variables.query && variables.query.trim()) {
        const newRecents = [variables.query, ...recentSearches.filter(s => s !== variables.query)].slice(0, 10);
        setRecentSearches(newRecents);
        localStorage.setItem("recentSearches", JSON.stringify(newRecents));
      }
      onSearch({ ...variables, results: data.results });
      setShowSuggestions(false);
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: async (searchData: { name: string; query: string; filters: SearchFilters }) => {
      return await apiRequest("POST", "/api/searches/save", searchData);
    },
    onSuccess: () => {
      toast({
        title: "Search saved",
        description: "You'll be notified of new matching items",
      });
    },
  });

  const handleSearch = (data: SearchFilters) => {
    searchMutation.mutate({
      ...data,
      priceMin: priceRange[0] || undefined,
      priceMax: priceRange[1] || undefined,
    });
  };

  const handleQuickSearch = (query: string) => {
    form.setValue("query", query);
    searchMutation.mutate({ query });
  };

  const saveCurrentSearch = () => {
    const values = form.getValues();
    if (!values.query?.trim()) {
      toast({
        title: "Cannot save search",
        description: "Please enter a search term first",
        variant: "destructive",
      });
      return;
    }

    const searchName = `Search: ${values.query}`;
    saveSearchMutation.mutate({
      name: searchName,
      query: values.query,
      filters: values,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
              <Input
                {...form.register("query")}
                placeholder="Search for vintage skulls, taxidermy, occult art..."
                className="pl-10 pr-20 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 h-12 text-lg"
                onFocus={() => setShowSuggestions(!!form.watch("query"))}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                data-testid="search-input"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-zinc-400 hover:text-white"
                  data-testid="toggle-filters"
                >
                  <Filter size={18} />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={searchMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="search-button"
                >
                  Search
                </Button>
              </div>

              {/* Search Suggestions */}
              {showSuggestions && (searchSuggestions.length > 0 || recentSearches.length > 0) && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 glass-effect border-zinc-700">
                  <CardContent className="p-4">
                    {searchSuggestions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Suggestions</h4>
                        <div className="space-y-2">
                          {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleQuickSearch(suggestion)}
                              className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Search size={14} className="inline mr-2 text-zinc-400" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Recent Searches</h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.slice(0, 5).map((search, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              onClick={() => handleQuickSearch(search)}
                            >
                              <Clock size={12} className="mr-1" />
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Filters</span>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCurrentSearch}
                    disabled={saveSearchMutation.isPending}
                    className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  >
                    <Heart size={16} className="mr-1" />
                    Save Search
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <Select onValueChange={(value) => form.setValue("category", value)} defaultValue="">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Condition</label>
                <Select onValueChange={(value) => form.setValue("condition", value)} defaultValue="">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="handmade">Handmade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                <Select onValueChange={(value) => form.setValue("sortBy", value)} defaultValue="relevance">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
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
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <Input
                  {...form.register("location")}
                  placeholder="City, State, or Country"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Price Range: ${priceRange[0]} - ${priceRange[1] >= 1000 ? "1000+" : priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-2">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-700">
              <Button
                onClick={form.handleSubmit(handleSearch)}
                disabled={searchMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {searchMutation.isPending ? "Searching..." : "Apply Filters"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setPriceRange([0, 1000]);
                }}
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}