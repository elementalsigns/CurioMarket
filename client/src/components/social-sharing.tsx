import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Share2, Facebook, Twitter, MessageCircle, Link, Copy, Instagram } from "lucide-react";
import { SiPinterest, SiLinkedin } from "react-icons/si";

interface SocialSharingProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: string;
    images: string[];
    sellerShopName?: string;
  };
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function SocialSharing({ listing, className, variant = "outline", size = "default" }: SocialSharingProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = `${window.location.origin}/listings/${listing.id}`;
  const shareTitle = `${listing.title} - ${listing.sellerShopName || 'Curio Market'}`;
  const shareDescription = listing.description.length > 100 
    ? `${listing.description.substring(0, 100)}...` 
    : listing.description;
  const sharePrice = `$${listing.price}`;
  const shareImage = listing.images[0] || '';
  
  const shareText = `Check out this unique curio: ${shareTitle} - ${sharePrice}. ${shareDescription}`;
  
  const platforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('facebook');
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500",
      action: () => {
        const text = `${shareText} #CurioMarket #Oddities #Collectibles`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('twitter');
      }
    },
    {
      name: "Pinterest",
      icon: SiPinterest,
      color: "bg-red-600 hover:bg-red-700",
      action: () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(shareImage)}&description=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('pinterest');
      }
    },
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('linkedin');
      }
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      action: () => {
        const text = `${shareText} ${shareUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        trackShare('whatsapp');
      }
    },
    {
      name: "Copy Link",
      icon: Link,
      color: "bg-zinc-600 hover:bg-zinc-700",
      action: () => copyToClipboard(shareUrl)
    },
    {
      name: "Copy for Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      action: () => copyToClipboard(`${shareText}\n\nLink in bio! 🔗\n\n#CurioMarket #Oddities #Collectibles #Vintage #Curiosities`)
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      if (text === shareUrl) {
        trackShare('copy_link');
      } else {
        trackShare('copy_instagram');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          platform,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          data-testid="button-share"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-50">Share this listing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview Card */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {shareImage && (
                  <img 
                    src={shareImage} 
                    alt={listing.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-zinc-50 truncate">
                    {shareTitle}
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    {sharePrice}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    {shareDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Button
                  key={platform.name}
                  onClick={platform.action}
                  className={`${platform.color} text-white justify-start`}
                  data-testid={`button-share-${platform.name.toLowerCase().replace(' ', '-')}`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* Share URL Display */}
          <div className="pt-4 border-t border-zinc-700">
            <label className="text-sm font-medium text-zinc-400 mb-2 block">
              Share URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-sm text-zinc-300"
                data-testid="input-share-url"
              />
              <Button
                onClick={() => copyToClipboard(shareUrl)}
                variant="outline"
                size="sm"
                data-testid="button-copy-url"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}