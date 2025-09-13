import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Heart, Share2, ShoppingCart, Star, MapPin, Shield, MessageCircle, Plus, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SocialSharing } from "@/components/social-sharing";
import { MetaTags } from "@/components/meta-tags";
import { apiRequest } from "@/lib/queryClient";

export default function Product() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["/api/listings/by-slug", slug],
    enabled: !!slug,
    queryFn: () => fetch(`/api/listings/by-slug/${slug}`).then(res => res.json()),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: wishlists = [] } = useQuery({
    queryKey: ["/api/wishlists"],
    enabled: !!user,
  });

  const isFavorite = Array.isArray(favorites) && favorites.includes(listing?.id);

  const addToCartMutation = useMutation({
    mutationFn: async (data: { listingId: string; quantity: number }) => {
      return apiRequest("POST", "/api/cart/add", data);
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${listing.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { listingId: listing.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: isFavorite 
          ? "Item removed from your favorites" 
          : "Item added to your favorites",
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

  const addToWishlistMutation = useMutation({
    mutationFn: async ({ wishlistId, notes }: { wishlistId: string; notes?: string }) => {
      return apiRequest("POST", `/api/wishlists/${wishlistId}/items`, { 
        listingId: listing.id, 
        notes 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlists"] });
      toast({
        title: "Added to Wishlist",
        description: "Item added to your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!listing) return;
    addToCartMutation.mutate({ listingId: listing.id, quantity });
  };

  const handleToggleFavorite = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Listing Not Found</h1>
          <p className="text-foreground/70">The item you're looking for doesn't exist or has been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const images = listing.images || [];
  const reviews = listing.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={`${listing.title} - ${listing.seller?.shopName || 'Curio Market'}`}
        description={listing.description}
        image={listing.images?.[0]?.url}
        type="product"
        price={listing.price}
        currency="USD"
      />
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4" data-testid="image-gallery">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url || '/placeholder-image.jpg'}
                  alt={images[selectedImage]?.alt || listing.title}
                  className="w-full h-full object-cover"
                  data-testid="img-main"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-50" data-testid="placeholder-main">
                  📦
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2" data-testid="thumbnail-grid">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6" data-testid="product-details">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-serif font-bold mb-2" data-testid="product-title">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-foreground/70">
                    <div className="flex items-center gap-1" data-testid="rating">
                      <Star className="text-yellow-500 fill-current" size={16} />
                      <span>{averageRating.toFixed(1)}</span>
                      <span>({reviews.length})</span>
                    </div>
                    <div className="flex items-center gap-1" data-testid="location">
                      <MapPin size={16} />
                      <span>{listing.seller?.location || 'Unknown Location'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? 'text-gothic-red' : 'text-foreground/60'}
                    data-testid="button-favorite"
                  >
                    <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                  </Button>
                  
                  {user && wishlists.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-foreground/60 hover:text-foreground"
                          data-testid="button-add-to-wishlist"
                        >
                          <List size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        {wishlists.map((wishlist: any) => (
                          <DropdownMenuItem
                            key={wishlist.id}
                            onClick={() => addToWishlistMutation.mutate({ wishlistId: wishlist.id })}
                            className="text-white hover:bg-zinc-800 cursor-pointer"
                            data-testid={`item-wishlist-${wishlist.id}`}
                          >
                            <Plus size={16} className="mr-2" />
                            {wishlist.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <SocialSharing 
                    listing={{
                      id: listing.id,
                      title: listing.title,
                      description: listing.description,
                      price: listing.price,
                      images: listing.images?.map((img: any) => img.url) || [],
                      sellerShopName: listing.seller?.shopName
                    }}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </div>

              <div className="text-4xl font-bold text-gothic-red mb-4" data-testid="product-price">
                ${listing.price}
              </div>

              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" data-testid="product-tags">
                  {listing.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" data-testid={`tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-serif font-bold mb-3">Description</h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap" data-testid="product-description">
                {listing.description}
              </p>
            </div>

            {listing.speciesOrMaterial && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-serif font-bold mb-3">Species/Material</h3>
                  <p className="text-foreground/80" data-testid="product-material">
                    {listing.speciesOrMaterial}
                  </p>
                </div>
              </>
            )}

            {listing.provenance && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-serif font-bold mb-3">Provenance</h3>
                  <p className="text-foreground/80" data-testid="product-provenance">
                    {listing.provenance}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Seller Information Section */}
            {listing.seller && (
              <>
                <div>
                  <h3 className="text-lg font-serif font-bold mb-3">Shop Information</h3>
                  <Card className="glass-effect border border-gothic-purple/20" data-testid="seller-info">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gothic-red mb-1" data-testid="shop-name">
                            {listing.seller.shopName || 'Shop Name Not Set'}
                          </h4>
                          {listing.seller.location && (
                            <div className="flex items-center gap-1 text-sm text-foreground/70 mb-2" data-testid="shop-location">
                              <MapPin size={14} />
                              <span>{listing.seller.location}</span>
                            </div>
                          )}
                          {listing.seller.bio && (
                            <p className="text-sm text-foreground/80 line-clamp-2" data-testid="shop-bio">
                              {listing.seller.bio}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/shop/${listing.seller.id}`)}
                          className="ml-4 whitespace-nowrap"
                          data-testid="button-visit-shop"
                        >
                          Visit Shop
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />
              </>
            )}

            {/* Purchase Section */}
            <Card className="glass-effect border border-gothic-purple/30" data-testid="purchase-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-foreground/70">
                    <Shield className="text-gothic-purple" size={16} />
                    <span>Verified seller • Secure payment • Buyer protection</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <label htmlFor="quantity" className="text-sm font-medium mb-1 block">
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="bg-input border border-border rounded-lg px-3 py-2 w-20"
                        data-testid="select-quantity"
                      >
                        {[...Array(Math.min(listing.stockQuantity || 0, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-sm text-foreground/70">
                      {listing.stockQuantity || 0} available
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending || (listing.stockQuantity || 0) < 1}
                      className="flex-1 bg-gothic-red hover:bg-gothic-red/80 text-white rounded-2xl disabled:bg-muted disabled:text-muted-foreground"
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {(listing.stockQuantity || 0) < 1 ? 'Sold Out' : 'Add to Cart'}
                    </Button>
                    <SocialSharing 
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        description: listing.description,
                        price: listing.price,
                        images: listing.images || [],
                        sellerShopName: listing.seller?.shopName
                      }}
                      variant="outline"
                      className="rounded-2xl"
                    />
                    <Button 
                      variant="outline" 
                      className="rounded-2xl" 
                      data-testid="button-message"
                      onClick={() => {
                        if (user) {
                          setLocation(`/messages/new?sellerId=${listing.sellerId}&sellerName=${listing.seller?.shopName || 'Seller'}&listingId=${listing.id}&listingTitle=${listing.title}`);
                        } else {
                          setLocation('/signin');
                        }
                      }}
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Message
                    </Button>
                  </div>

                  {listing.shippingCost && parseFloat(listing.shippingCost) > 0 && (
                    <div className="text-sm text-foreground/70" data-testid="shipping-cost">
                      + ${listing.shippingCost} shipping
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16" data-testid="reviews-section">
            <h2 className="text-2xl font-serif font-bold mb-6">Reviews ({reviews.length})</h2>
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <Card key={review.id} className="glass-effect" data-testid={`review-${review.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-foreground/30'}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.buyer?.firstName || 'Anonymous'}</span>
                        </div>
                        <div className="text-sm text-foreground/60">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {review.content && (
                      <p className="text-foreground/80">{review.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
