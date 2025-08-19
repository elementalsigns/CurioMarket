import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersProps {
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "wet-specimens", label: "Wet Specimens" },
  { value: "bones-skulls", label: "Bones & Skulls" },
  { value: "taxidermy", label: "Taxidermy" },
  { value: "occult-art", label: "Occult Art" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
    });
  };

  return (
    <div className="space-y-6" data-testid="search-filters">
      {/* Category Filter */}
      <div>
        <Label htmlFor="category" className="text-sm font-medium mb-3 block">
          Category
        </Label>
        <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger data-testid="select-category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Price Range</Label>
        <div className="space-y-3">
          <div>
            <Label htmlFor="minPrice" className="text-xs text-foreground/70">
              Min Price ($)
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="mt-1"
              data-testid="input-min-price"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice" className="text-xs text-foreground/70">
              Max Price ($)
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="mt-1"
              data-testid="input-max-price"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div>
        <Label htmlFor="sortBy" className="text-sm font-medium mb-3 block">
          Sort By
        </Label>
        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
          <SelectTrigger data-testid="select-sort">
            <SelectValue />
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

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="w-full"
        data-testid="button-clear-filters"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
