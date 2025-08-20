import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    price: string;
    images?: { url: string; alt?: string }[];
    seller?: { shopName: string };
    category?: { name: string };
  };
  onRemoveFavorite?: () => void;
}

export default function ProductCard({ listing, onRemoveFavorite }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    addToCartMutation.mutate({ listingId: listing.id, quantity: 1 });
  };

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFavorite?.();
  };

  return (
    <Link href={`/product/${listing.slug}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border-border" data-testid={`product-card-${listing.id}`}>
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0].url}
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
                {onRemoveFavorite && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 rounded-full"
                    onClick={handleRemoveFavorite}
                    data-testid={`button-remove-favorite-${listing.id}`}
                  >
                    <Heart className="w-4 h-4 fill-current text-red-600" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 rounded-full"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || addToCartMutation.isPending}
                  data-testid={`button-add-to-cart-${listing.id}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2" data-testid={`product-title-${listing.id}`}>
                {listing.title}
              </h3>
              <span className="font-bold text-primary shrink-0" data-testid={`product-price-${listing.id}`}>
                ${listing.price}
              </span>
            </div>
            
            {listing.seller && (
              <p className="text-xs text-muted-foreground" data-testid={`product-seller-${listing.id}`}>
                by {listing.seller.shopName}
              </p>
            )}
            
            {listing.category && (
              <Badge variant="outline" className="text-xs" data-testid={`product-category-${listing.id}`}>
                {listing.category.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}