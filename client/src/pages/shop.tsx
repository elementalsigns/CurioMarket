import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Users, 
  Heart, 
  Share2,
  Package,
  Calendar,
  ExternalLink,
  MessageCircle,
  Eye,
  Search
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Link, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ShopPageProps {
  // For preview mode
  previewData?: {
    shopName: string;
    bio?: string;
    location?: string;
    policies?: string;
    shippingInfo?: string;
    returnPolicy?: string;
    bannerImageUrl?: string;
    avatarImageUrl?: string;
  };
  isPreview?: boolean;
}

export default function ShopPage({ previewData, isPreview = false }: ShopPageProps) {
  const { sellerId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'reviews' | 'about' | 'policies'>('items');
  const [, setLocation] = useLocation();
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // In preview mode, use previewData; otherwise fetch from API
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ["/api/seller/public", sellerId],
    queryFn: () => fetch(`/api/seller/public/${sellerId}`).then(res => res.json()),
    enabled: !isPreview && !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const seller = fetchedData?.seller;
  const listings = fetchedData?.listings || [];
  
  // Fetch seller reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["/api/seller/public", sellerId, "reviews"],
    queryFn: () => fetch(`/api/seller/public/${sellerId}/reviews`).then(res => res.json()),
    enabled: !isPreview && !!sellerId,
  });

  const reviews = reviewsData || [];
  
  // Check if user is following this seller
  const { data: followingData } = useQuery({
    queryKey: ["/api/user/following"],
    enabled: isAuthenticated && !isPreview,
  });
  
  const isFollowing = followingData && Array.isArray(followingData) 
    ? followingData.some((follow: any) => follow.sellerId === sellerId)
    : false;
  
  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return apiRequest("DELETE", "/api/shop-follows", { sellerId });
      } else {
        return apiRequest("POST", "/api/shop-follows", { sellerId });
      }
    },
    onSuccess: () => {
      // Invalidate following data to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user/following"] });
      toast({
        title: isFollowing ? "Unfollowed" : "Now Following",
        description: isFollowing 
          ? `You're no longer following ${seller?.shopName}` 
          : `You're now following ${seller?.shopName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive"
      });
    }
  });
  
  // Message mutation
  const messageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages/conversations", {
        recipientId: seller?.userId,
        content: content
      });
    },
    onSuccess: (data) => {
      // Navigate to the conversation
      setLocation(`/messages?conversation=${data.id}`);
      toast({
        title: "Message Sent",
        description: `Started conversation with ${seller?.shopName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });
  
  // Button click handlers
  const handleFollowClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "You need to be signed in to follow sellers",
        variant: "destructive"
      });
      return;
    }
    followMutation.mutate();
  };
  
  const handleMessageClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required", 
        description: "You need to be signed in to message sellers",
        variant: "destructive"
      });
      return;
    }
    
    // Start conversation with a default greeting message
    const defaultMessage = `Hi! I'm interested in your shop. Could you tell me more about your products?`;
    messageMutation.mutate(defaultMessage);
  };

  // Get categories used by this seller
  const { data: categoriesData } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !isPreview,
  });

  // Create category counts for this seller's items
  const categoryCounts = useMemo(() => {
    if (isPreview || !listings || !categoriesData) return [];
    
    const counts = new Map();
    
    // Count items in each category
    (listings as any[]).forEach((listing: any) => {
      if (listing.categoryIds && Array.isArray(listing.categoryIds)) {
        listing.categoryIds.forEach((categoryId: string) => {
          const category = (categoriesData as any[]).find(c => c.id === categoryId);
          if (category) {
            const key = category.slug;
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });
      }
    });
    
    // Convert to array with category info
    return (categoriesData as any[]).map(category => ({
      ...category,
      count: counts.get(category.slug) || 0
    })).filter(cat => cat.count > 0);
  }, [listings, categoriesData, isPreview]);

  // Filter listings based on selected category and search
  const filteredListings = useMemo(() => {
    if (isPreview) return [];
    if (!listings) return [];
    
    let filtered = listings as any[];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      const category = categoryCounts.find(c => c.slug === selectedCategory);
      if (category) {
        filtered = filtered.filter((listing: any) => 
          listing.categoryIds && listing.categoryIds.includes(category.id)
        );
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((listing: any) => 
        listing.title?.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [listings, selectedCategory, searchQuery, categoryCounts, isPreview]);

  const totalItems = isPreview ? 12 : (listings as any)?.length || 0;

  const displayData = isPreview ? previewData : (seller as any);

  if (isLoading && !isPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!displayData && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-garamond text-white mb-4">Shop Not Found</h1>
          <p className="text-zinc-400 mb-8">The shop you're looking for doesn't exist or has been removed.</p>
          <Link to="/browse">
            <Button className="bg-red-600 hover:bg-red-700">
              Browse Other Shops
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {!isPreview && <Header />}
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isPreview && (
          <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Preview Mode</span>
            </div>
            <p className="text-blue-300 text-sm mt-1">
              This is how your shop page will appear to customers
            </p>
          </div>
        )}

        {/* Shop Banner */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          {displayData?.bannerImageUrl ? (
            <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${displayData.bannerImageUrl})` }}>
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-zinc-800 to-zinc-700" />
          )}
          
          {/* Shop Avatar and Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={displayData?.avatarImageUrl} />
                <AvatarFallback className="bg-zinc-800 text-white text-xl">
                  {displayData?.shopName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-garamond text-white mb-2" data-testid="shop-name">
                  {displayData?.shopName || "Shop Name"}
                </h1>
                <div className="flex items-center gap-4 text-white/80">
                  {displayData?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{displayData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {reviews.length > 0 
                        ? `${(reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length).toFixed(1)} (${reviews.length} review${reviews.length === 1 ? '' : 's'})`
                        : 'No reviews yet'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {displayData?.followerCount ?? 0} follower{(displayData?.followerCount ?? 0) === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
              {!isPreview && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white hover:bg-white/10"
                    onClick={handleFollowClick}
                    disabled={followMutation.isPending}
                    data-testid="button-follow"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    {followMutation.isPending 
                      ? (isFollowing ? 'Unfollowing...' : 'Following...') 
                      : (isFollowing ? 'Following' : 'Follow')
                    }
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white hover:bg-white/10"
                    onClick={handleMessageClick}
                    disabled={messageMutation.isPending}
                    data-testid="button-message"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {messageMutation.isPending ? 'Sending...' : 'Message'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800/50 mb-6">
            <TabsTrigger value="items" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400" data-testid="tab-items">
              Items
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400" data-testid="tab-reviews">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400" data-testid="tab-about">
              About
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400" data-testid="tab-policies">
              Shop Policies
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6" data-testid="tab-panel-items">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Search & Category Filters */}
              {!isPreview && (
                <div className="space-y-6">
                  {/* Search */}
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <Input
                          placeholder={`Search all ${totalItems} items`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                          data-testid="shop-search"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Filters */}
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* All Items */}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`w-full text-left p-2 rounded transition-colors flex items-center justify-between ${
                            selectedCategory === 'all'
                              ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                              : 'hover:bg-zinc-800/50 text-zinc-300'
                          }`}
                          data-testid="category-filter-all"
                        >
                          <span className="font-medium">All</span>
                          <span className="text-sm">{totalItems}</span>
                        </button>

                        {/* Category Filters */}
                        {categoryCounts.map((category) => (
                          <button
                            key={category.slug}
                            onClick={() => setSelectedCategory(category.slug)}
                            className={`w-full text-left p-2 rounded transition-colors flex items-center justify-between ${
                              selectedCategory === category.slug
                                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                : 'hover:bg-zinc-800/50 text-zinc-300'
                            }`}
                            data-testid={`category-filter-${category.slug}`}
                          >
                            <span>{category.name}</span>
                            <span className="text-sm">{category.count}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main Content - Listings */}
              <div className={`space-y-6 ${!isPreview ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-garamond text-white">
                    {selectedCategory === 'all' ? 'All Items' : categoryCounts.find(c => c.slug === selectedCategory)?.name || 'Items'}
                    {isPreview && <span className="text-lg text-zinc-400"> (Sample)</span>}
                    {searchQuery && <span className="text-lg text-zinc-400"> - "{searchQuery}"</span>}
                  </h2>
                  <Badge variant="outline" className="text-zinc-300">
                    <Package className="w-3 h-3 mr-1" />
                    {isPreview ? "12" : filteredListings.length} items
                  </Badge>
                </div>

                {isPreview ? (
                  // Show sample listings for preview
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="glass-effect">
                        <div className="aspect-square bg-zinc-800 rounded-t-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-zinc-600" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-serif font-semibold text-white mb-2">
                            Sample Product {i}
                          </h3>
                          <p className="text-zinc-400 text-sm mb-3">
                            This is a sample product that will be replaced with your actual listings.
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-red-400 font-bold">$29.99</span>
                            <Badge variant="secondary">Available</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="shop-listings">
                    {filteredListings.map((listing: any) => (
                      <ProductCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : searchQuery || selectedCategory !== 'all' ? (
                  <Card className="glass-effect">
                    <CardContent className="p-12 text-center">
                      <Package className="mx-auto mb-4 text-zinc-500" size={48} />
                      <h3 className="text-xl font-serif text-white mb-2">No Items Found</h3>
                      <p className="text-zinc-400 mb-4">
                        {searchQuery 
                          ? `No items match "${searchQuery}"` 
                          : `No items in ${categoryCounts.find(c => c.slug === selectedCategory)?.name || 'this category'}`
                        }
                      </p>
                      <div className="flex gap-2 justify-center">
                        {searchQuery && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSearchQuery('')}
                            className="text-white border-white hover:bg-white/10"
                          >
                            Clear Search
                          </Button>
                        )}
                        {selectedCategory !== 'all' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedCategory('all')}
                            className="text-white border-white hover:bg-white/10"
                          >
                            View All Items
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-effect">
                    <CardContent className="p-12 text-center">
                      <Package className="mx-auto mb-4 text-zinc-500" size={48} />
                      <h3 className="text-xl font-serif text-white mb-2">No Items Yet</h3>
                      <p className="text-zinc-400">
                        This shop hasn't listed any items for sale yet. Check back later!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6" data-testid="tab-panel-reviews">
            {reviews.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-garamond text-white">Customer Reviews</h2>
                  <Badge variant="outline" className="text-zinc-300">
                    <Star className="w-3 h-3 mr-1" />
                    {reviews.length} reviews
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-zinc-700 text-white">
                              {review.buyerName?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                                ))}
                              </div>
                              <span className="text-sm text-zinc-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                              )}
                            </div>
                            
                            {review.title && (
                              <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                            )}
                            
                            <p className="text-zinc-300 mb-3">{review.content}</p>
                            
                            {review.listingTitle && (
                              <p className="text-sm text-zinc-400 mb-3">
                                Product: <span className="text-zinc-300">{review.listingTitle}</span>
                              </p>
                            )}
                            
                            {review.photos && review.photos.length > 0 && (
                              <div className="flex gap-2 mb-3">
                                {review.photos.map((photo: string, index: number) => (
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`Review photo ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-zinc-700"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {review.sellerResponse && (
                              <div className="mt-4 p-3 bg-zinc-800/50 rounded border-l-2 border-red-600">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-white">Shop Owner Response</span>
                                  <span className="text-xs text-zinc-400">
                                    {new Date(review.sellerResponseDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-zinc-300">{review.sellerResponse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="glass-effect">
                <CardContent className="p-12 text-center">
                  <Star className="mx-auto mb-4 text-zinc-500" size={48} />
                  <h3 className="text-xl font-serif text-white mb-2">No Reviews Yet</h3>
                  <p className="text-zinc-400">
                    This shop hasn't received any reviews yet. Be the first to leave a review after making a purchase!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6" data-testid="tab-panel-about">
            {/* About Shop */}
            {displayData?.bio && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">About This Shop</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 whitespace-pre-line" data-testid="shop-bio">
                    {displayData.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Full Announcement */}
            {displayData?.announcement && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Shop Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 whitespace-pre-line" data-testid="shop-announcement-full">
                    {displayData.announcement}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Shop Stats */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Shop Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Sales</span>
                  <span className="font-semibold">{seller?.totalSales || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Listings</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="font-semibold">
                    {seller?.memberSince 
                      ? new Date(seller.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6" data-testid="tab-panel-policies">
            {/* Shop Policies */}
            {displayData?.policies && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Shop Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 text-sm whitespace-pre-line" data-testid="shop-policies">
                    {displayData.policies}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Shipping Info */}
            {displayData?.shippingInfo && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Shipping & Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-zinc-300 mb-2">Shipping Information</h4>
                    <p className="text-zinc-400 text-sm whitespace-pre-line" data-testid="shop-shipping">
                      {displayData.shippingInfo}
                    </p>
                  </div>
                  {displayData?.returnPolicy && (
                    <div>
                      <h4 className="font-medium text-sm text-zinc-300 mb-2">Return Policy</h4>
                      <p className="text-zinc-400 text-sm whitespace-pre-line" data-testid="shop-returns">
                        {displayData.returnPolicy}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom Reviews Section (like Etsy) */}
        {!isPreview && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            {/* Announcement Section */}
            {displayData?.announcement && (
              <div className="mb-8">
                <h3 className="text-lg font-serif text-white mb-3">Announcement</h3>
                <p className="text-zinc-300 text-sm leading-relaxed max-w-4xl">
                  {displayData.announcement.length > 200 
                    ? `${displayData.announcement.substring(0, 200)}...` 
                    : displayData.announcement
                  }
                </p>
                {displayData.announcement.length > 200 && (
                  <button 
                    onClick={() => {
                      setActiveTab('about');
                      // Scroll to tabs section
                      setTimeout(() => {
                        const tabsElement = document.querySelector('[role="tabpanel"][data-state="active"]');
                        if (tabsElement) {
                          tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
                  >
                    Read more
                  </button>
                )}
              </div>
            )}

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif text-white mb-2">Reviews</h3>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">Average item review</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length;
                          return (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-current' : ''}`} />
                          );
                        })}
                      </div>
                      <span className="text-zinc-400">({reviews.length})</span>
                    </div>
                  )}
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Sort by:</span>
                    <select className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-1">
                      <option>Suggested</option>
                      <option>Newest</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                    </select>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="flex gap-4 pb-6 border-b border-zinc-800 last:border-b-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {review.buyerName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">
                            {review.buyerName?.split('@')[0] || 'Anonymous'}
                          </span>
                          <span className="text-sm text-zinc-400">
                            on {new Date(review.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex text-yellow-400 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        
                        <p className="text-zinc-300 mb-3">{review.content}</p>
                        
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.photos.map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Review photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded border border-zinc-700"
                              />
                            ))}
                          </div>
                        )}
                        
                        {review.listingTitle && (
                          <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800">
                            <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0"></div>
                            <span className="text-sm text-zinc-300">{review.listingTitle}</span>
                          </div>
                        )}
                        
                        {review.sellerResponse && (
                          <div className="mt-4 ml-8 p-3 bg-zinc-800/50 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-white">Shop owner response</span>
                              <span className="text-xs text-zinc-400">
                                {new Date(review.sellerResponseDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-300">{review.sellerResponse}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {reviews.length > 5 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('reviews')}
                        className="text-white border-white hover:bg-white/10"
                      >
                        View all {reviews.length} reviews
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto mb-4 text-zinc-500" size={48} />
                  <h4 className="text-lg font-serif text-white mb-2">No reviews yet</h4>
                  <p className="text-zinc-400">
                    This shop hasn't received any reviews yet. Be the first to leave a review!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isPreview && <Footer />}
    </div>
  );
}