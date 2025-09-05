import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";

interface SearchFiltersProps {
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const priceRanges = [
  { label: "Under $50", min: "", max: "50" },
  { label: "$50 - $100", min: "50", max: "100" },
  { label: "$100 - $250", min: "100", max: "250" },
  { label: "$250 - $500", min: "250", max: "500" },
  { label: "$500 - $1000", min: "500", max: "1000" },
  { label: "Over $1000", min: "1000", max: "" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "alphabetical", label: "A-Z" },
];

export default function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" to empty string for category filter
    const actualValue = key === 'category' && value === 'all' ? '' : value;
    onFiltersChange({
      ...filters,
      [key]: actualValue,
    });
  };

  const handlePriceRangeSelect = (range: { min: string; max: string }) => {
    onFiltersChange({
      ...filters,
      minPrice: range.min,
      maxPrice: range.max,
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== '' && key !== 'sortBy'
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className="w-full" data-testid="search-filters">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" data-testid="active-filters-count">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sort-select">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger id="sort-select" data-testid="select-sort">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Categories */}
        <div className="space-y-3">
          <Label>Category</Label>
          <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === "all" ? "" : value)}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Array.isArray(categories) && categories.map((category: any) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          
          {/* Quick Price Range Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map((range, index) => (
              <Button
                key={index}
                variant={
                  filters.minPrice === range.min && filters.maxPrice === range.max
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => handlePriceRangeSelect(range)}
                data-testid={`button-price-range-${index}`}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Custom Price Range */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between" data-testid="button-custom-price">
                Custom Range
                <ChevronDown className="w-4 h-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="min-price" className="text-xs">Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    data-testid="input-min-price"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price" className="text-xs">Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="No limit"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    data-testid="input-max-price"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-1">
                {filters.category && (
                  <Badge variant="outline" className="text-xs" data-testid="filter-category">
                    Category: {Array.isArray(categories) ? categories.find((cat: any) => cat.slug === filters.category)?.name : filters.category}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-3 h-3 ml-1 hover:bg-transparent"
                      onClick={() => handleFilterChange('category', '')}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </Badge>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Badge variant="outline" className="text-xs" data-testid="filter-price">
                    Price: {filters.minPrice ? `$${filters.minPrice}` : '$0'} - {filters.maxPrice ? `$${filters.maxPrice}` : 'No limit'}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-3 h-3 ml-1 hover:bg-transparent"
                      onClick={() => {
                        handleFilterChange('minPrice', '');
                        handleFilterChange('maxPrice', '');
                      }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}