import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Star,
  Plus,
  UserPlus,
  UserMinus,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Globe
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SocialFeaturesProps {
  sellerId?: string;
  listingId?: string;
  wishlistId?: string;
}

interface Follower {
  id: string;
  name: string;
  avatar?: string;
  followedAt: string;
}

interface Following {
  id: string;
  shopName: string;
  avatar?: string;
  followedAt: string;
  newListingsCount: number;
}

export default function SocialFeatures({ sellerId, listingId, wishlistId }: SocialFeaturesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shareModal, setShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Get follower/following data
  const { data: followers } = useQuery({
    queryKey: ["/api/user/followers"],
    enabled: !!user,
  });

  const { data: following } = useQuery({
    queryKey: ["/api/user/following"],
    enabled: !!user,
  });

  const { data: sellerInfo } = useQuery({
    queryKey: ["/api/seller", sellerId],
    enabled: !!sellerId,
  });

  const { data: isFollowingSeller } = useQuery({
    queryKey: ["/api/user/following", sellerId],
    enabled: !!sellerId && !!user,
  });

  // Follow/unfollow seller
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      return await apiRequest("POST", `/api/sellers/${sellerId}/${action}`);
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/following", sellerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seller", sellerId] });
      
      toast({
        title: action === 'follow' ? "Following seller" : "Unfollowed seller",
        description: action === 'follow' 
          ? "You'll be notified of new listings from this seller"
          : "You've stopped following this seller",
      });
    },
  });

  // Share functions
  const handleShare = (type: 'product' | 'seller' | 'wishlist') => {
    let url = window.location.origin;
    
    if (type === 'product' && listingId) {
      url += `/product/${listingId}`;
    } else if (type === 'seller' && sellerId) {
      url += `/seller/${sellerId}`;
    } else if (type === 'wishlist' && wishlistId) {
      url += `/wishlist/${wishlistId}`;
    }
    
    setShareUrl(url);
    setShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  const shareToSocial = (platform: string) => {
    const text = "Check out this amazing find on Curio Market!";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);
    
    let socialUrl = "";
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'email':
        socialUrl = `mailto:?subject=${encodedText}&body=${encodedUrl}`;
        break;
    }
    
    if (socialUrl) {
      window.open(socialUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Seller Follow Section */}
      {sellerId && sellerInfo && (
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={sellerInfo.avatar} />
                  <AvatarFallback className="bg-zinc-700 text-white text-lg">
                    {sellerInfo.shopName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {sellerInfo.shopName}
                  </h3>
                  <p className="text-zinc-400">{sellerInfo.followerCount} followers</p>
                  <div className="flex items-center mt-2">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span className="text-white ml-1">{sellerInfo.rating}</span>
                    <span className="text-zinc-400 ml-2">({sellerInfo.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('seller')}
                  className="text-zinc-300 border-zinc-600"
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
                
                {user && (
                  <Button
                    onClick={() => followMutation.mutate(isFollowingSeller ? 'unfollow' : 'follow')}
                    disabled={followMutation.isPending}
                    className={
                      isFollowingSeller 
                        ? "bg-zinc-700 hover:bg-zinc-600 text-white" 
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {isFollowingSeller ? (
                      <>
                        <UserMinus size={16} className="mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Actions for Products */}
      {listingId && (
        <Card className="glass-effect">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4">Share This Item</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('product')}
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                <Heart size={16} className="mr-2" />
                Save to Wishlist
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                <MessageCircle size={16} className="mr-2" />
                Ask Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User's Social Dashboard */}
      {user && (
        <Tabs defaultValue="following" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="following" className="text-zinc-300 data-[state=active]:text-white">
              Following ({following?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followers" className="text-zinc-300 data-[state=active]:text-white">
              Followers ({followers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Sellers You Follow</CardTitle>
              </CardHeader>
              <CardContent>
                {following?.length > 0 ? (
                  <div className="space-y-4">
                    {following.map((seller: Following) => (
                      <div key={seller.id} className="flex items-center justify-between p-4 border border-zinc-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={seller.avatar} />
                            <AvatarFallback className="bg-zinc-700 text-white">
                              {seller.shopName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link to={`/seller/${seller.id}`}>
                              <h4 className="text-white font-medium hover:text-red-400 transition-colors">
                                {seller.shopName}
                              </h4>
                            </Link>
                            <p className="text-zinc-400 text-sm">
                              Following since {new Date(seller.followedAt).toLocaleDateString()}
                            </p>
                            {seller.newListingsCount > 0 && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                {seller.newListingsCount} new items
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-zinc-300 border-zinc-600"
                          >
                            <Link to={`/seller/${seller.id}`}>
                              <ExternalLink size={14} className="mr-1" />
                              Visit Shop
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => followMutation.mutate('unfollow')}
                            className="text-zinc-400 hover:text-red-400"
                          >
                            <UserMinus size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Not following anyone yet</h3>
                    <p className="text-zinc-400 mb-6">
                      Follow sellers to get notified of their new listings
                    </p>
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <Link to="/sellers">Discover Sellers</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-white">Your Followers</CardTitle>
              </CardHeader>
              <CardContent>
                {followers?.length > 0 ? (
                  <div className="space-y-4">
                    {followers.map((follower: Follower) => (
                      <div key={follower.id} className="flex items-center space-x-3 p-4 border border-zinc-700 rounded-lg">
                        <Avatar>
                          <AvatarImage src={follower.avatar} />
                          <AvatarFallback className="bg-zinc-700 text-white">
                            {follower.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-white font-medium">{follower.name}</h4>
                          <p className="text-zinc-400 text-sm">
                            Following since {new Date(follower.followedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No followers yet</h3>
                    <p className="text-zinc-400">
                      Create great listings to attract followers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="glass-effect w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-zinc-300 border-zinc-600"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('twitter')}
                    className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  >
                    <Twitter size={16} className="mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('facebook')}
                    className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  >
                    <Facebook size={16} className="mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('email')}
                    className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                  >
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShareModal(false)}
                  className="flex-1 text-zinc-300 border-zinc-600"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}