import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Eye
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Link } from "wouter";

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

  // In preview mode, use previewData; otherwise fetch from API
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ["/api/seller/public", sellerId],
    queryFn: () => fetch(`/api/seller/public/${sellerId}`).then(res => res.json()),
    enabled: !isPreview && !!sellerId,
  });

  const seller = fetchedData?.seller;
  const listings = fetchedData?.listings || [];

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
                    <span>4.8 (127 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>234 followers</span>
                  </div>
                </div>
              </div>
              {!isPreview && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shop Info */}
          <div className="space-y-6">
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

            {/* Shop Stats */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Shop Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Sales</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Active Listings</span>
                  <span className="font-semibold">{isPreview ? "12" : (listings as any)?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Member Since</span>
                  <span className="font-semibold">Oct 2023</span>
                </div>
              </CardContent>
            </Card>

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
          </div>

          {/* Right Column - Listings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-garamond text-white">
                Featured Items {isPreview && <span className="text-lg text-zinc-400">(Sample)</span>}
              </h2>
              <Badge variant="outline" className="text-zinc-300">
                <Package className="w-3 h-3 mr-1" />
                {isPreview ? "12" : (listings as any)?.length || 0} items
              </Badge>
            </div>

            {isPreview ? (
              // Show sample listings for preview
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : (listings as any)?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="shop-listings">
                {(listings as any)?.map((listing: any) => (
                  <ProductCard key={listing.id} listing={listing} />
                ))}
              </div>
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
      </div>

      {!isPreview && <Footer />}
    </div>
  );
}