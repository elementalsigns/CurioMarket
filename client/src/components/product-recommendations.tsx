import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Star, 
  Eye, 
  TrendingUp, 
  Clock,
  User,
  ShoppingCart,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  rating: number;
  reviewCount: number;
  sellerName: string;
  isOnSale: boolean;
  views: number;
  isFavorited?: boolean;
}

interface RecommendationSection {
  title: string;
  subtitle?: string;
  products: Product[];
  type: 'similar' | 'viewed' | 'trending' | 'personalized' | 'seller';
}

interface ProductRecommendationsProps {
  productId?: string;
  sellerId?: string;
  category?: string;
  userId?: string;
}

export default function ProductRecommendations({ 
  productId, 
  sellerId, 
  category, 
  userId 
}: ProductRecommendationsProps) {
  const { user } = useAuth();

  // Get similar products
  const { data: similarProducts } = useQuery({
    queryKey: ["/api/products/similar", productId],
    enabled: !!productId,
  });

  // Get recently viewed
  const { data: recentlyViewed } = useQuery({
    queryKey: ["/api/user/recently-viewed"],
    enabled: !!user,
  });

  // Get trending products
  const { data: trendingProducts } = useQuery({
    queryKey: ["/api/products/trending", category],
  });

  // Get personalized recommendations
  const { data: personalizedRecs } = useQuery({
    queryKey: ["/api/recommendations/personalized"],
    enabled: !!user,
  });

  // Get more from seller
  const { data: sellerProducts } = useQuery({
    queryKey: ["/api/seller/products", sellerId],
    enabled: !!sellerId,
  });

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="glass-effect group hover:ring-1 hover:ring-red-600 transition-all w-full">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
            />
          </Link>
          
          {product.isOnSale && (
            <Badge className="absolute top-2 left-2 bg-red-600 text-white">
              Sale
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart 
              size={16} 
              className={product.isFavorited ? "fill-red-500 text-red-500" : "text-white"} 
            />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-medium text-white hover:text-red-400 transition-colors line-clamp-2 text-sm">
                {product.title}
              </h3>
            </Link>
            <p className="text-zinc-400 text-xs">by {product.sellerName}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-current" />
              <span className="text-zinc-400 text-xs">{product.rating}</span>
            </div>
          </div>

          <Button 
            size="sm" 
            className="w-full bg-red-600 hover:bg-red-700 text-xs"
          >
            <ShoppingCart size={14} className="mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const RecommendationSection = ({ section }: { section: RecommendationSection }) => {
    if (!section.products || section.products.length === 0) return null;

    const getIcon = (type: string) => {
      switch (type) {
        case 'similar': return <Eye size={20} className="text-blue-500" />;
        case 'viewed': return <Clock size={20} className="text-purple-500" />;
        case 'trending': return <TrendingUp size={20} className="text-green-500" />;
        case 'personalized': return <Zap size={20} className="text-yellow-500" />;
        case 'seller': return <User size={20} className="text-red-500" />;
        default: return <Star size={20} className="text-zinc-400" />;
      }
    };

    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            {getIcon(section.type)}
            <div>
              <h3 className="text-lg">{section.title}</h3>
              {section.subtitle && (
                <p className="text-zinc-400 text-sm font-normal">{section.subtitle}</p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {section.products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {section.products.length > 10 && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-800"
              >
                View All {section.products.length} Items
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const sections: RecommendationSection[] = [
    // Similar products (when viewing a specific product)
    ...(similarProducts ? [{
      title: "Similar Items",
      subtitle: "You might also like these",
      products: similarProducts,
      type: 'similar' as const,
    }] : []),

    // More from seller
    ...(sellerProducts ? [{
      title: `More from ${sellerProducts.sellerName}`,
      subtitle: `Discover other items from this seller`,
      products: sellerProducts.products,
      type: 'seller' as const,
    }] : []),

    // Personalized recommendations
    ...(personalizedRecs && user ? [{
      title: "Recommended for You",
      subtitle: "Based on your interests and activity",
      products: personalizedRecs,
      type: 'personalized' as const,
    }] : []),

    // Recently viewed
    ...(recentlyViewed && user ? [{
      title: "Recently Viewed",
      subtitle: "Items you looked at recently",
      products: recentlyViewed,
      type: 'viewed' as const,
    }] : []),

    // Trending products
    ...(trendingProducts ? [{
      title: "Trending Now",
      subtitle: "Popular items in this category",
      products: trendingProducts,
      type: 'trending' as const,
    }] : []),
  ];

  if (sections.length === 0) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
            <Star size={32} className="text-zinc-600" />
          </div>
          <p className="text-zinc-400">Loading recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <RecommendationSection key={`${section.type}-${index}`} section={section} />
      ))}

      {/* Recommendation Feedback */}
      {user && (
        <Card className="glass-effect border-zinc-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Improve Your Recommendations</h4>
                <p className="text-zinc-400 text-sm">
                  Help us show you better products by rating our suggestions
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-zinc-300 border-zinc-600"
                >
                  👍 Helpful
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-zinc-300 border-zinc-600"
                >
                  👎 Not Relevant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browse More */}
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-medium text-white mb-2">Discover More</h3>
          <p className="text-zinc-400 mb-6">
            Explore our full collection of unique oddities and curiosities
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="outline" className="text-zinc-300 border-zinc-600">
              <Link to="/browse">Browse All Products</Link>
            </Button>
            <Button asChild variant="outline" className="text-zinc-300 border-zinc-600">
              <Link to="/categories">Shop by Category</Link>
            </Button>
            <Button asChild variant="outline" className="text-zinc-300 border-zinc-600">
              <Link to="/sellers">Discover Sellers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}