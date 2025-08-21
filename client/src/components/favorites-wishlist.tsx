import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Share2, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Eye, 
  Star,
  List,
  Grid,
  Filter,
  Search,
  Globe,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FavoriteItem {
  id: string;
  listingId: string;
  title: string;
  price: string;
  image: string;
  sellerName: string;
  isAvailable: boolean;
  createdAt: string;
}

interface Wishlist {
  id: string;
  name: string;
  isPublic: boolean;
  description?: string;
  itemCount: number;
  createdAt: string;
}

export default function FavoritesWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createWishlistModal, setCreateWishlistModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [newWishlistDescription, setNewWishlistDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Get favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/user/favorites"],
  });

  // Get wishlists
  const { data: wishlists, isLoading: wishlistsLoading } = useQuery({
    queryKey: ["/api/user/wishlists"],
  });

  // Create wishlist mutation
  const createWishlistMutation = useMutation({
    mutationFn: async (wishlistData: any) => {
      return await apiRequest("POST", "/api/user/wishlists", wishlistData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/wishlists"] });
      toast({
        title: "Wishlist created",
        description: "Your new wishlist has been created",
      });
      setCreateWishlistModal(false);
      setNewWishlistName("");
      setNewWishlistDescription("");
      setIsPublic(false);
    },
  });

  // Remove from favorites
  const removeFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return await apiRequest("DELETE", `/api/user/favorites/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: "Removed",
        description: "Item removed from favorites",
      });
    },
  });

  // Add to cart
  const addToCartMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return await apiRequest("POST", "/api/cart/add", { listingId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item added to your cart",
      });
    },
  });

  const handleCreateWishlist = () => {
    if (!newWishlistName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a wishlist name",
        variant: "destructive",
      });
      return;
    }

    createWishlistMutation.mutate({
      name: newWishlistName,
      description: newWishlistDescription,
      isPublic,
    });
  };

  const handleRemoveFavorite = (listingId: string) => {
    removeFavoriteMutation.mutate(listingId);
  };

  const handleAddToCart = (listingId: string) => {
    addToCartMutation.mutate(listingId);
  };

  const shareWishlist = (wishlistId: string) => {
    const shareUrl = `${window.location.origin}/wishlist/${wishlistId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Wishlist link copied to clipboard",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Favorites & Wishlists</h1>
          <p className="text-zinc-400">Keep track of items you love</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="text-zinc-300 border-zinc-600"
          >
            {viewMode === "grid" ? <List size={16} /> : <Grid size={16} />}
          </Button>
          <Button
            onClick={() => setCreateWishlistModal(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus size={16} className="mr-2" />
            New Wishlist
          </Button>
        </div>
      </div>

      <Tabs defaultValue="favorites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger value="favorites" className="text-zinc-300 data-[state=active]:text-white">
            <Heart size={16} className="mr-2" />
            Favorites ({favorites?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="wishlists" className="text-zinc-300 data-[state=active]:text-white">
            <List size={16} className="mr-2" />
            Wishlists ({wishlists?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          {favoritesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass-effect animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-48 bg-zinc-700 rounded mb-4"></div>
                    <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                    <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites?.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {favorites.map((item: FavoriteItem) => (
                <Card key={item.id} className="glass-effect group hover:ring-1 hover:ring-red-600 transition-all">
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex gap-4" : ""}`}>
                    <div className={`relative ${viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square mb-4"} overflow-hidden rounded-lg`}>
                      <Link to={`/product/${item.listingId}`}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </Link>
                      
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Badge variant="destructive">Sold Out</Badge>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFavorite(item.listingId)}
                      >
                        <Heart size={16} className="fill-red-500 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <Link to={`/product/${item.listingId}`}>
                          <h3 className="font-medium text-white hover:text-red-400 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-zinc-400 text-sm">by {item.sellerName}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">{item.price}</span>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-current" />
                          <span className="text-zinc-400 text-sm">4.8</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item.listingId)}
                          disabled={!item.isAvailable || addToCartMutation.isPending}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <ShoppingCart size={14} className="mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => handleRemoveFavorite(item.listingId)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-effect">
              <CardContent className="p-12 text-center">
                <Heart size={64} className="text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No favorites yet</h3>
                <p className="text-zinc-400 mb-6">Start browsing and save items you love</p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link to="/browse">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wishlists" className="space-y-6">
          {wishlistsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="glass-effect animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-zinc-700 rounded mb-4"></div>
                    <div className="h-16 bg-zinc-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wishlists?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wishlists.map((wishlist: Wishlist) => (
                <Card key={wishlist.id} className="glass-effect hover:ring-1 hover:ring-red-600 transition-all">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="truncate">{wishlist.name}</span>
                      <div className="flex items-center gap-2">
                        {wishlist.isPublic ? (
                          <Globe size={16} className="text-green-500" />
                        ) : (
                          <Lock size={16} className="text-zinc-400" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => shareWishlist(wishlist.id)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {wishlist.description && (
                        <p className="text-zinc-400 text-sm line-clamp-2">
                          {wishlist.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">
                          {wishlist.itemCount} items
                        </span>
                        <span className="text-zinc-400">
                          {wishlist.isPublic ? "Public" : "Private"}
                        </span>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full text-zinc-300 border-zinc-600 hover:bg-zinc-800"
                        asChild
                      >
                        <Link to={`/wishlist/${wishlist.id}`}>
                          <Eye size={16} className="mr-2" />
                          View Wishlist
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-effect">
              <CardContent className="p-12 text-center">
                <List size={64} className="text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No wishlists yet</h3>
                <p className="text-zinc-400 mb-6">Create wishlists to organize your favorite items</p>
                <Button
                  onClick={() => setCreateWishlistModal(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus size={16} className="mr-2" />
                  Create First Wishlist
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Wishlist Modal */}
      {createWishlistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="glass-effect w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Create New Wishlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Wishlist Name *
                </label>
                <Input
                  placeholder="e.g., Gothic Decor, Dream Collection"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description (optional)
                </label>
                <Input
                  placeholder="Describe your wishlist..."
                  value={newWishlistDescription}
                  onChange={(e) => setNewWishlistDescription(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-zinc-700 bg-zinc-800"
                />
                <label htmlFor="public" className="text-white text-sm">
                  Make this wishlist public
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCreateWishlistModal(false)}
                  className="flex-1 text-zinc-300 border-zinc-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWishlist}
                  disabled={createWishlistMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {createWishlistMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}