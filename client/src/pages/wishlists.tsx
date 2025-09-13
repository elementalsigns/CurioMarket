import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2, Eye, ExternalLink, ShoppingBag, MessageCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Wishlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
}

interface WishlistItem {
  id: string;
  notes?: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    price: string;
    images: Array<{ url: string; altText: string }>;
  };
}

// Component to display wishlist card with item count
function WishlistCard({ wishlist, isSelected, onSelect }: { 
  wishlist: Wishlist, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  const { data: itemCount = 0 } = useQuery({
    queryKey: ['/api/wishlists', wishlist.id, 'items', 'count'],
    queryFn: () => fetch(`/api/wishlists/${wishlist.id}/items`).then(res => res.json()).then(items => items.length),
  });

  return (
    <Card 
      className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-colors ${
        isSelected ? 'border-red-600 bg-zinc-800' : 'hover:border-zinc-700'
      }`}
      onClick={onSelect}
      data-testid={`card-wishlist-${wishlist.id}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">{wishlist.name} ({itemCount})</CardTitle>
          {wishlist.isPublic && (
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              <Eye className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
        </div>
        {wishlist.description && (
          <CardDescription className="text-zinc-400">
            {wishlist.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

// Component to display individual favorite items
function FavoriteItemCard({ listingId }: { listingId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch listing details
  const { data: listing, isLoading } = useQuery({
    queryKey: ['/api/listings', listingId],
    queryFn: () => fetch(`/api/listings/${listingId}`).then(res => res.json()),
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/favorites/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Item removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="bg-zinc-800 h-48 rounded mb-4"></div>
            <div className="bg-zinc-800 h-4 rounded mb-2"></div>
            <div className="bg-zinc-800 h-4 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 group hover:border-zinc-700 transition-colors">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={listing.images?.[0]?.url || '/api/placeholder/300/300'} 
            alt={listing.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeFavoriteMutation.mutate()}
              disabled={removeFavoriteMutation.isPending}
              data-testid={`button-remove-favorite-${listingId}`}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-white font-semibold mb-2 truncate">
            {listing.title}
          </h3>
          <p className="text-red-400 font-bold mb-3">
            ${listing.price}
          </p>
          <div className="flex gap-2">
            <Link href={`/product/${listing.slug}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                data-testid={`button-view-${listingId}`}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WishlistsPage() {
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWishlist, setNewWishlist] = useState({ name: '', description: '', isPublic: false });
  const { toast } = useToast();

  // Fetch user's favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
  });

  // Fetch user's wishlists
  const { data: wishlists = [], isLoading: wishlistsLoading } = useQuery({
    queryKey: ['/api/wishlists'],
  });

  // Fetch selected wishlist items
  const { data: wishlistItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/wishlists', selectedWishlist, 'items'],
    queryFn: () => fetch(`/api/wishlists/${selectedWishlist}/items`).then(res => res.json()),
    enabled: !!selectedWishlist,
  });

  // Create wishlist mutation
  const createWishlistMutation = useMutation({
    mutationFn: async (data: typeof newWishlist) => {
      return await apiRequest('POST', '/api/wishlists', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists'] });
      setShowCreateDialog(false);
      setNewWishlist({ name: '', description: '', isPublic: false });
      toast({
        title: "Wishlist Created",
        description: "Your new wishlist has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async ({ wishlistId, listingId }: { wishlistId: string; listingId: string }) => {
      return await apiRequest('DELETE', `/api/wishlists/${wishlistId}/items/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists', selectedWishlist, 'items'] });
      toast({
        title: "Item Removed",
        description: "Item removed from wishlist successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  });

  const handleCreateWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    createWishlistMutation.mutate(newWishlist);
  };

  if (wishlistsLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Return to Home Button */}
        <div className="mb-6">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="text-white hover:text-red-600 hover:bg-transparent transition-colors"
              data-testid="button-return-home"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Wishlists</h1>
            <p className="text-zinc-400">Organize your favorite curiosities and oddities</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                data-testid="button-create-wishlist"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <form onSubmit={handleCreateWishlist}>
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Wishlist</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Create a collection to organize your favorite items
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Name</label>
                    <Input
                      data-testid="input-wishlist-name"
                      value={newWishlist.name}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="e.g., Victorian Curiosities"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Description (optional)</label>
                    <Input
                      data-testid="input-wishlist-description"
                      value={newWishlist.description}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="Describe this collection..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      data-testid="checkbox-wishlist-public"
                      type="checkbox"
                      checked={newWishlist.isPublic}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <label className="text-sm text-white">Make this wishlist public</label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    data-testid="button-save-wishlist"
                    className="bg-red-600 hover:bg-red-700"
                    disabled={createWishlistMutation.isPending}
                  >
                    {createWishlistMutation.isPending ? 'Creating...' : 'Create Wishlist'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Favorites Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Heart className="w-6 h-6 mr-2 text-red-600" />
            General Favorites ({favorites.length})
          </h2>
          
          {favorites.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 text-center py-8">
              <CardContent>
                <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No general favorites yet</p>
                <p className="text-zinc-500 text-sm mb-4">
                  Items saved to "General Favorites" appear here. Use wishlists below to organize your collections.
                </p>
                <Link href="/browse">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-browse-to-favorite"
                  >
                    Start Browsing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((listingId: string) => (
                <FavoriteItemCard key={listingId} listingId={listingId} />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wishlists Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {wishlists.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800 text-center py-8">
                  <CardContent>
                    <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-4">No wishlists yet</p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      data-testid="button-create-first-wishlist"
                    >
                      Create your first wishlist
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                wishlists.map((wishlist: Wishlist) => (
                  <WishlistCard
                    key={wishlist.id}
                    wishlist={wishlist}
                    isSelected={selectedWishlist === wishlist.id}
                    onSelect={() => setSelectedWishlist(wishlist.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="lg:col-span-2">
            {selectedWishlist ? (
              <div>
                {itemsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <Card className="bg-zinc-900 border-zinc-800 text-center py-8">
                    <CardContent>
                      <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">Empty Wishlist</h3>
                      <p className="text-zinc-400 mb-4">Start browsing and add items to this wishlist</p>
                      <Link href="/browse">
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          data-testid="button-browse-items"
                        >
                          Browse Collections
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistItems.map((item: WishlistItem) => (
                      <Card key={item.id} className="bg-zinc-900 border-zinc-800 group">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img 
                              src={item.listing.images?.[0]?.url || '/api/placeholder/300/300'} 
                              alt={item.listing.images?.[0]?.altText || item.listing.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromWishlistMutation.mutate({
                                  wishlistId: selectedWishlist,
                                  listingId: item.listing.id
                                })}
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-white font-semibold mb-2 truncate">
                              {item.listing.title}
                            </h3>
                            <p className="text-red-400 font-bold mb-2">
                              ${item.listing.price}
                            </p>
                            {item.notes && (
                              <p className="text-zinc-400 text-sm mb-4 italic">
                                "{item.notes}"
                              </p>
                            )}
                            
                            <div className="flex space-x-2">
                              <Link href={`/listing/${item.listing.id}`}>
                                <Button 
                                  size="sm" 
                                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                  data-testid={`button-view-${item.listing.id}`}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Item
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 text-center py-8">
                <CardContent>
                  <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">Select a Wishlist</h3>
                  <p className="text-zinc-400">Choose a wishlist from the sidebar to view its contents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}