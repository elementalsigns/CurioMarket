import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WishlistSelector from "./wishlist-selector";

// Convert Google Cloud Storage URL to local object URL
function convertImageUrl(url: string): string {
  if (!url || !url.startsWith('https://storage.googleapis.com/')) {
    return url;
  }
  
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex(part => part.includes('replit-objstore'));
  if (bucketIndex === -1) return url;
  
  const pathAfterBucket = urlParts.slice(bucketIndex + 1).join('/');
  const objectPath = pathAfterBucket.startsWith('.private/') 
    ? pathAfterBucket.replace('.private/', '') 
    : pathAfterBucket;
  
  return `/objects/${objectPath}`;
}

interface ProductCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    price: string;
    stockQuantity?: number;
    images?: { url: string; alt?: string }[];
    seller?: { shopName: string };
    category?: { name: string };
  };
  isFavorited?: boolean;
  onToggleFavorite?: (listingId: string, isFavorited: boolean) => void;
  onRemoveFavorite?: () => void;
}

export default function ProductCard({ listing, isFavorited = false, onToggleFavorite, onRemoveFavorite }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showWishlistSelector, setShowWishlistSelector] = useState(false);

  // Fetch user's wishlists to determine behavior
  const { data: wishlists = [] } = useQuery({
    queryKey: ["/api/wishlists"],
    retry: false, // Don't retry if auth fails
    refetchOnWindowFocus: false,
  }) as { data: any[] };

  // Check if user is favorited in general favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    retry: false, // Don't retry if auth fails  
    refetchOnWindowFocus: false,
  }) as { data: string[] };

  const isInGeneralFavorites = userFavorites.includes(listing.id);

  const addToCartMutation = useMutation({
    mutationFn: ({ listingId, quantity }: { listingId: string; quantity: number }) => 
      apiRequest("POST", "/api/cart/add", { listingId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      setIsAddingToCart(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      setIsAddingToCart(false);
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        return apiRequest("DELETE", `/api/favorites/${listingId}`);
      } else {
        return apiRequest("POST", "/api/favorites", { listingId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited 
          ? "Item has been removed from your favorites." 
          : "Item has been added to your favorites.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Authentication required')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to favorites.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update favorites. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    addToCartMutation.mutate({ listingId: listing.id, quantity: 1 });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If this is being used with custom toggle handler (like in account manager), use that
    if (onToggleFavorite) {
      onToggleFavorite(listing.id, isFavorited);
      return;
    }

    // If the item is already favorited, remove it from favorites directly
    if (isFavorited || isInGeneralFavorites) {
      toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorited: true });
      return;
    }

    // If user has wishlists, show selector dialog
    if (wishlists.length > 0) {
      setShowWishlistSelector(true);
    } else {
      // No wishlists exist, add to general favorites directly
      toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorited: false });
    }
  };

  const handleWishlistSuccess = () => {
    // Refresh favorites and wishlists data
    queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
  };

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFavorite?.();
  };

  return (
    <Link href={`/product/${listing.slug}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border-border h-full flex flex-col" data-testid={`product-card-${listing.id}`}>
        <CardContent className="p-0 flex flex-col h-full">
          {/* Product Image */}
          <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-muted relative">
            {listing.images?.[0] ? (
              <img
                src={convertImageUrl(listing.images[0].url)}
                alt={listing.images[0].alt || listing.title}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                data-testid={`product-image-${listing.id}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200">
              <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onRemoveFavorite ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 rounded-full"
                    onClick={handleRemoveFavorite}
                    data-testid={`button-remove-favorite-${listing.id}`}
                  >
                    <Heart className="w-4 h-4 fill-current text-red-600" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 rounded-full"
                    onClick={handleToggleFavorite}
                    disabled={toggleFavoriteMutation.isPending}
                    data-testid={`button-toggle-favorite-${listing.id}`}
                  >
                    <Heart className={`w-4 h-4 ${
                      isFavorited || isInGeneralFavorites
                        ? "fill-current text-red-600" 
                        : "text-muted-foreground hover:text-red-600"
                    }`} />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 rounded-full"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addToCartMutation.isPending || (listing.stockQuantity || 0) < 1}
                  data-testid={`button-add-to-cart-${listing.id}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1" data-testid={`product-title-${listing.id}`}>
                  {listing.title}
                </h3>
                <div className="text-right shrink-0">
                  <span className="font-bold text-primary" data-testid={`product-price-${listing.id}`}>
                    ${listing.price}
                  </span>
                  {(listing.stockQuantity || 0) < 1 && (
                    <div className="text-xs text-red-600 font-medium mt-1" data-testid={`product-sold-out-${listing.id}`}>
                      Sold Out
                    </div>
                  )}
                </div>
              </div>
              
              {listing.seller && (
                <p className="text-sm font-medium text-gothic-red truncate" data-testid={`product-seller-${listing.id}`}>
                  {listing.seller.shopName || 'Shop Name Not Set'}
                </p>
              )}
            </div>
            
            <div className="mt-auto">
              {listing.category && (
                <Badge variant="outline" className="text-xs" data-testid={`product-category-${listing.id}`}>
                  {listing.category.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Wishlist Selector Dialog */}
      <WishlistSelector
        open={showWishlistSelector}
        onOpenChange={setShowWishlistSelector}
        listingId={listing.id}
        onSuccess={handleWishlistSuccess}
      />
    </Link>
  );
}