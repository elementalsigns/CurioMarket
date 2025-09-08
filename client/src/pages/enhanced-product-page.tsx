import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Star, 
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  MapPin,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import ProductRecommendations from "@/components/product-recommendations";
import SocialFeatures from "@/components/social-features";
import MessagingSystem from "@/components/messaging-system";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function EnhancedProductPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVariation, setSelectedVariation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showMessaging, setShowMessaging] = useState(false);

  // Get product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/listings", id],
  });

  // Get product reviews
  const { data: reviews } = useQuery({
    queryKey: ["/api/products", id, "reviews"],
  });

  // Get product variations
  const { data: variations } = useQuery({
    queryKey: ["/api/listings", id, "variations"],
  });

  // Get seller info
  const { data: seller } = useQuery({
    queryKey: ["/api/seller/profile"],
    enabled: !!user && !!product?.sellerId,
  });

  // Check if product is favorited
  const { data: isFavorited } = useQuery({
    queryKey: ["/api/products", id, "favorited"],
    enabled: !!user,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (cartData: any) => {
      return await apiRequest("POST", "/api/cart/add", cartData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const method = isFavorited ? "DELETE" : "POST";
      return await apiRequest(method, `/api/products/${id}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", id, "favorited"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Item removed from your favorites" : "Item added to your favorites",
      });
    },
  });

  // Track product view
  useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/listings/${id}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", id] });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCartMutation.mutate({
      listingId: id,
      quantity,
      variationId: selectedVariation || undefined,
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };

  const getDeliveryEstimate = () => {
    const processingDays = product?.processingTime || 3;
    const shippingDays = 5; // Standard shipping
    const totalDays = processingDays + shippingDays;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
    
    return deliveryDate.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric" 
    });
  };

  const getPriceDisplay = () => {
    if (!product) return { price: "$0.00", originalPrice: null, isOnSale: false };
    
    const selectedVar = variations?.find((v: any) => v.id === selectedVariation);
    const basePrice = parseFloat(product.price);
    const modifier = selectedVar ? parseFloat(selectedVar.priceAdjustment || 0) : 0;
    const finalPrice = basePrice + modifier;
    
    const isOnSale = product.salePrice && parseFloat(product.salePrice) < basePrice;
    const displayPrice = isOnSale ? parseFloat(product.salePrice) : finalPrice;
    
    return {
      price: `$${displayPrice.toFixed(2)}`,
      originalPrice: isOnSale ? `$${finalPrice.toFixed(2)}` : null,
      isOnSale,
    };
  };

  const getStockStatus = () => {
    if (!product) return { inStock: false, quantity: 0, status: "out_of_stock" };
    
    const selectedVar = variations?.find((v: any) => v.id === selectedVariation);
    const availableQuantity = selectedVar?.quantity || product.quantity || 0;
    
    if (availableQuantity === 0) {
      return { inStock: false, quantity: 0, status: "out_of_stock" };
    } else if (availableQuantity <= (product.lowStockThreshold || 5)) {
      return { inStock: true, quantity: availableQuantity, status: "low_stock" };
    } else {
      return { inStock: true, quantity: availableQuantity, status: "in_stock" };
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="aspect-square bg-zinc-800 rounded-lg mb-4"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-zinc-800 rounded"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-12 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-32 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="glass-effect">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
            <p className="text-zinc-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link to="/browse">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priceInfo = getPriceDisplay();
  const stockInfo = getStockStatus();

  const images = product.images?.map((img: string, index: number) => ({
    url: img,
    alt: `${product.title} - Image ${index + 1}`
  })) || [];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
          <ChevronRight size={16} className="text-zinc-600" />
          <Link to="/browse" className="text-zinc-400 hover:text-white transition-colors">Browse</Link>
          <ChevronRight size={16} className="text-zinc-600" />
          {product.category && (
            <>
              <Link to={`/category/${product.category}`} className="text-zinc-400 hover:text-white transition-colors">
                {product.category}
              </Link>
              <ChevronRight size={16} className="text-zinc-600" />
            </>
          )}
          <span className="text-zinc-500 truncate">{product.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              images={images}
              title={product.title}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onShare={() => {/* Share functionality */}}
              viewCount={product.views}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.averageRating || 0) ? "text-yellow-500 fill-current" : "text-zinc-600"}
                    />
                  ))}
                  <span className="text-white ml-2">{product.averageRating?.toFixed(1) || "0.0"}</span>
                  <span className="text-zinc-400">({product.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <Eye size={16} />
                  <span>{product.views || 0} views</span>
                </div>
              </div>
              
              <Link to={`/seller/${product.sellerId}`}>
                <p className="text-red-400 hover:text-red-300 transition-colors">
                  by {seller?.shopName || "Unknown Seller"}
                </p>
              </Link>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-white">{priceInfo.price}</span>
              {priceInfo.originalPrice && (
                <span className="text-xl text-zinc-400 line-through">{priceInfo.originalPrice}</span>
              )}
              {priceInfo.isOnSale && (
                <Badge className="bg-red-600 text-white">On Sale</Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {stockInfo.status === "in_stock" && (
                <div className="flex items-center text-green-400">
                  <CheckCircle size={16} className="mr-1" />
                  In Stock ({stockInfo.quantity} available)
                </div>
              )}
              {stockInfo.status === "low_stock" && (
                <div className="flex items-center text-yellow-400">
                  <AlertTriangle size={16} className="mr-1" />
                  Low Stock ({stockInfo.quantity} left)
                </div>
              )}
              {stockInfo.status === "out_of_stock" && (
                <div className="flex items-center text-red-400">
                  <AlertTriangle size={16} className="mr-1" />
                  Out of Stock
                </div>
              )}
            </div>

            {/* Variations */}
            {variations && variations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Options
                </label>
                <Select value={selectedVariation} onValueChange={setSelectedVariation}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {variations.map((variation: any) => (
                      <SelectItem key={variation.id} value={variation.id}>
                        {variation.name}
                        {variation.priceAdjustment && parseFloat(variation.priceAdjustment) !== 0 && (
                          <span className="ml-2 text-zinc-400">
                            ({parseFloat(variation.priceAdjustment) > 0 ? "+" : ""}${Math.abs(parseFloat(variation.priceAdjustment)).toFixed(2)})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-700 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="text-white hover:bg-zinc-800"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-none bg-transparent text-white"
                    min="1"
                    max={stockInfo.quantity}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(stockInfo.quantity, quantity + 1))}
                    disabled={quantity >= stockInfo.quantity}
                    className="text-white hover:bg-zinc-800"
                  >
                    +
                  </Button>
                </div>
                <span className="text-zinc-400 text-sm">
                  Max: {stockInfo.quantity}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!stockInfo.inStock || addToCartMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-lg"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                  className="h-12 px-4 text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                >
                  <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
                </Button>
                
                <Button
                  variant="outline"
                  className="h-12 px-4 text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                >
                  <Share2 size={20} />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowMessaging(true)}
                className="w-full h-12 text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                <MessageCircle size={20} className="mr-2" />
                Contact Seller
              </Button>
            </div>

            {/* Shipping & Returns */}
            <Card className="glass-effect">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="text-blue-500" size={20} />
                  <div>
                    <p className="text-white font-medium">Free Shipping</p>
                    <p className="text-zinc-400 text-sm">
                      Estimated delivery by {getDeliveryEstimate()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <RotateCcw className="text-green-500" size={20} />
                  <div>
                    <p className="text-white font-medium">30-Day Returns</p>
                    <p className="text-zinc-400 text-sm">
                      Easy returns and exchanges
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="text-purple-500" size={20} />
                  <div>
                    <p className="text-white font-medium">Curio Market Protection</p>
                    <p className="text-zinc-400 text-sm">
                      Your purchase is protected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Summary */}
            <Card className="glass-effect">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-zinc-400">Condition:</span>
                    <span className="text-white ml-2">{product.condition || "New"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Category:</span>
                    <span className="text-white ml-2">{product.category || "Uncategorized"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Processing Time:</span>
                    <span className="text-white ml-2">{product.processingTime || 3} business days</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">SKU:</span>
                    <span className="text-white ml-2">{product.sku || "N/A"}</span>
                  </div>
                  {product.weight && (
                    <div>
                      <span className="text-zinc-400">Weight:</span>
                      <span className="text-white ml-2">{product.weight} lbs</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <span className="text-zinc-400">Dimensions:</span>
                      <span className="text-white ml-2">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
            <TabsTrigger value="description" className="text-zinc-300 data-[state=active]:text-white">
              Description
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-zinc-300 data-[state=active]:text-white">
              Reviews ({product.reviewCount || 0})
            </TabsTrigger>
            <TabsTrigger value="shipping" className="text-zinc-300 data-[state=active]:text-white">
              Shipping & Returns
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-zinc-300 data-[state=active]:text-white">
              Seller Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {product.description || "No description available."}
                  </div>
                  
                  {product.provenance && (
                    <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Provenance</h4>
                      <p className="text-zinc-300">{product.provenance}</p>
                    </div>
                  )}
                  
                  {product.materials && product.materials.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-2">Materials</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((material: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-zinc-800 text-zinc-300">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-zinc-600 text-zinc-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="glass-effect">
              <CardContent className="p-6">
                {/* Reviews will be rendered here */}
                <div className="text-center py-8">
                  <Star size={48} className="text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">Reviews section would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card className="glass-effect">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Shipping Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="text-blue-500" size={20} />
                      <div>
                        <p className="text-white font-medium">Processing Time</p>
                        <p className="text-zinc-400 text-sm">
                          Orders typically ship within {product.processingTime || 3} business days
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Truck className="text-green-500" size={20} />
                      <div>
                        <p className="text-white font-medium">Shipping Methods</p>
                        <p className="text-zinc-400 text-sm">
                          Standard: 5-7 business days (Free)<br />
                          Express: 2-3 business days (+$15)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Return Policy</h3>
                  <div className="text-zinc-300 space-y-2">
                    <p>• 30-day return window from delivery date</p>
                    <p>• Items must be in original condition</p>
                    <p>• Return shipping costs covered by buyer</p>
                    <p>• Refunds processed within 5-7 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seller">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <SocialFeatures sellerId={product.sellerId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <div>
          <ProductRecommendations 
            productId={id} 
            sellerId={product.sellerId} 
            category={product.category}
          />
        </div>

        {/* Messaging Modal */}
        {showMessaging && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-4xl h-[600px]">
              <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Contact Seller</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessaging(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="h-[calc(600px-80px)]">
                <MessagingSystem 
                  sellerId={product.sellerId} 
                  listingId={id}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}