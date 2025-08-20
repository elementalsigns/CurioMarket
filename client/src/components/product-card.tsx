import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProductCardProps {
  listing: any;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ listing, viewMode = "grid" }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      // This would need the favorite status from context/query
      const isFavorite = false; // TODO: Get from favorites query
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${listing.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { listingId: listing.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: "Favorites Updated",
        description: "Your favorites have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };

  const primaryImage = listing.images?.[0]?.url;
  const averageRating = listing.reviews?.length > 0 
    ? listing.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / listing.reviews.length 
    : 0;

  if (viewMode === "list") {
    return (
      <Link to={`/product/${listing.slug}`}>
        <Card className="glass-effect hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer" data-testid={`product-card-${listing.id}`}>
          <CardContent className="p-0">
            <div className="flex">
              <div className="w-48 h-32 relative bg-card rounded-l-2xl overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    data-testid={`img-product-${listing.id}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-50" data-testid={`placeholder-${listing.id}`}>
                    📦
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="absolute top-2 right-2 bg-background/60 text-white p-2 rounded-full hover:bg-primary transition-colors"
                  data-testid={`button-favorite-${listing.id}`}
                >
                  <Heart size={16} />
                </Button>
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1" data-testid={`title-${listing.id}`}>
                      {listing.title}
                    </h3>
                    <p className="text-foreground/70 text-sm mb-2 line-clamp-2" data-testid={`description-${listing.id}`}>
                      {listing.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-primary font-bold text-xl" data-testid={`price-${listing.id}`}>
                      ${listing.price}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {listing.reviews?.length > 0 && (
                      <div className="flex items-center text-foreground/60" data-testid={`rating-${listing.id}`}>
                        <Star className="text-yellow-500 fill-current mr-1" size={14} />
                        <span>{averageRating.toFixed(1)}</span>
                        <span>({listing.reviews.length})</span>
                      </div>
                    )}
                    
                    {listing.seller?.location && (
                      <div className="flex items-center text-foreground/60" data-testid={`location-${listing.id}`}>
                        <MapPin size={14} className="mr-1" />
                        <span>{listing.seller.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {listing.categoryId && (
                    <Badge variant="secondary" className="text-xs" data-testid={`category-${listing.id}`}>
                      {listing.category?.name || 'Oddity'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/product/${listing.slug}`}>
      <Card className="glass-effect rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer" data-testid={`product-card-${listing.id}`}>
        <div className="aspect-square bg-card relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-testid={`img-product-${listing.id}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-50" data-testid={`placeholder-${listing.id}`}>
              📦
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 bg-background/60 text-white p-2 rounded-full hover:bg-primary transition-colors"
            data-testid={`button-favorite-${listing.id}`}
          >
            <Heart size={16} />
          </Button>
          
          {listing.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-white" data-testid={`badge-featured-${listing.id}`}>
              Featured
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4 flex flex-col h-32">
          <h3 className="font-serif font-bold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2 flex-shrink-0" data-testid={`title-${listing.id}`}>
            {listing.title}
          </h3>
          <p className="text-foreground/70 text-xs mb-2 line-clamp-2 flex-grow" data-testid={`description-${listing.id}`}>
            {listing.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className="text-primary font-bold text-lg" data-testid={`price-${listing.id}`}>
              ${listing.price}
            </span>
            
            {listing.reviews?.length > 0 && (
              <div className="flex items-center text-xs text-foreground/60" data-testid={`rating-${listing.id}`}>
                <Star className="text-yellow-500 fill-current mr-1" size={12} />
                <span>{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
