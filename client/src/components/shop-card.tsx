import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Store, Users, Calendar } from "lucide-react";

interface ShopCardProps {
  shop: {
    id: string;
    shopName: string;
    bio?: string;
    location?: string;
    avatar?: string;
    banner?: string;
    createdAt?: string;
    isActive: boolean;
  };
}

export function ShopCard({ shop }: ShopCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  return (
    <Link href={`/shop/${shop.id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg border-border h-full flex flex-col" data-testid={`shop-card-${shop.id}`}>
        <CardContent className="p-0 flex flex-col h-full">
          {/* Shop Banner/Header */}
          <div className="h-24 w-full overflow-hidden rounded-t-lg bg-gradient-to-r from-zinc-800 to-zinc-700 relative">
            {shop.banner ? (
              <img
                src={shop.banner}
                alt={`${shop.shopName} banner`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Store className="w-8 h-8 text-zinc-500" />
              </div>
            )}
            
            {/* Shop Avatar */}
            <div className="absolute -bottom-6 left-4">
              <Avatar className="w-12 h-12 border-2 border-background">
                <AvatarImage src={shop.avatar} alt={shop.shopName} />
                <AvatarFallback className="bg-zinc-700 text-white text-lg font-semibold">
                  {shop.shopName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Shop Details */}
          <div className="p-4 pt-8 space-y-3 flex-1 flex flex-col">
            <div className="space-y-2 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight line-clamp-1 flex-1" data-testid={`shop-name-${shop.id}`}>
                  {shop.shopName}
                </h3>
                <Badge variant="outline" className="text-xs bg-red-600/10 text-red-400 border-red-600/20">
                  Shop
                </Badge>
              </div>
              
              {shop.bio && (
                <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed" data-testid={`shop-bio-${shop.id}`}>
                  {shop.bio}
                </p>
              )}
            </div>
            
            {/* Shop Metadata */}
            <div className="space-y-2 pt-2 border-t border-zinc-700">
              {shop.location && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{shop.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-zinc-400 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Since {formatDate(shop.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Active Seller</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}