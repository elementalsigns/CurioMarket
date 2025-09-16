import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, BookmarkPlus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Wishlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
}

interface WishlistSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  onSuccess?: () => void;
}

export default function WishlistSelector({ open, onOpenChange, listingId, onSuccess }: WishlistSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);

  // Fetch user's wishlists
  const { data: wishlists = [], isLoading: wishlistsLoading } = useQuery({
    queryKey: ["/api/wishlists"],
    enabled: open,
  }) as { data: Wishlist[], isLoading: boolean };

  // Fetch user's favorites to check if item is already favorited
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: open,
  }) as { data: string[] };

  // Check if item is already in favorites (general favorites)
  const isInGeneralFavorites = favorites.includes(listingId);

  // Create new wishlist mutation
  const createWishlistMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest('POST', '/api/wishlists', { 
        name,
        description: `Custom wishlist: ${name}`,
        isPublic: false 
      });
    },
    onSuccess: (newWishlist) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists'] });
      setNewWishlistName("");
      setShowCreateNew(false);
      // Automatically add to the newly created wishlist
      addToWishlistMutation.mutate({ wishlistId: newWishlist.id, listingId });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async ({ wishlistId, listingId }: { wishlistId: string; listingId: string }) => {
      return await apiRequest('POST', `/api/wishlists/${wishlistId}/items`, { listingId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      onOpenChange(false);
      onSuccess?.();
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Authentication required')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to wishlists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to wishlist. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Add to general favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/favorites', { listingId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      onOpenChange(false);
      onSuccess?.();
      toast({
        title: "Added to favorites",
        description: "Item has been added to your general favorites.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes('Authentication required')) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to add items to favorites.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to favorites. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleAddToWishlist = (wishlistId: string) => {
    addToWishlistMutation.mutate({ wishlistId, listingId });
  };

  const handleAddToGeneralFavorites = () => {
    addToFavoritesMutation.mutate();
  };

  const handleCreateAndAdd = () => {
    if (newWishlistName.trim()) {
      createWishlistMutation.mutate(newWishlistName.trim());
    }
  };

  if (wishlistsLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-600" />
            Choose Collection
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select where you'd like to save this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4 max-h-64 overflow-y-auto">
          {/* General Favorites Option */}
          <Button
            onClick={handleAddToGeneralFavorites}
            disabled={isInGeneralFavorites || addToFavoritesMutation.isPending}
            className={`w-full justify-start p-4 h-auto text-left border transition-colors ${
              isInGeneralFavorites 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed' 
                : 'bg-zinc-800 border-zinc-700 hover:border-red-600 hover:bg-zinc-700'
            }`}
            variant="outline"
            data-testid="button-add-general-favorites"
          >
            <div className="flex items-center w-full">
              <Star className="w-5 h-5 mr-3 text-yellow-500" />
              <div className="flex-1">
                <div className="font-medium text-white">
                  {isInGeneralFavorites ? "Already in General Favorites" : "General Favorites"}
                </div>
                <div className="text-sm text-zinc-400">
                  Quick access to your favorite items
                </div>
              </div>
              {addToFavoritesMutation.isPending && (
                <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full ml-2"></div>
              )}
            </div>
          </Button>

          {/* Existing Wishlists */}
          {wishlists.map((wishlist) => (
            <Button
              key={wishlist.id}
              onClick={() => handleAddToWishlist(wishlist.id)}
              disabled={addToWishlistMutation.isPending}
              className="w-full justify-start p-4 h-auto text-left bg-zinc-800 border border-zinc-700 hover:border-red-600 hover:bg-zinc-700 transition-colors"
              variant="outline"
              data-testid={`button-add-wishlist-${wishlist.id}`}
            >
              <div className="flex items-center w-full">
                <BookmarkPlus className="w-5 h-5 mr-3 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-white">{wishlist.name}</div>
                  {wishlist.description && (
                    <div className="text-sm text-zinc-400 truncate">
                      {wishlist.description}
                    </div>
                  )}
                </div>
                {wishlist.isPublic && (
                  <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                    Public
                  </Badge>
                )}
                {addToWishlistMutation.isPending && selectedWishlistId === wishlist.id && (
                  <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full ml-2"></div>
                )}
              </div>
            </Button>
          ))}

          {/* Create New Wishlist Section */}
          {showCreateNew ? (
            <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
              <div className="space-y-3">
                <Input
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="Enter wishlist name..."
                  className="bg-zinc-700 border-zinc-600 text-white"
                  data-testid="input-new-wishlist-name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateAndAdd();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateAndAdd}
                    disabled={!newWishlistName.trim() || createWishlistMutation.isPending}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                    data-testid="button-create-wishlist"
                  >
                    {createWishlistMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      "Create & Add"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateNew(false);
                      setNewWishlistName("");
                    }}
                    size="sm"
                    variant="outline"
                    className="border-zinc-600 text-zinc-300"
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowCreateNew(true)}
              className="w-full justify-start p-4 h-auto text-left border-2 border-dashed border-zinc-700 hover:border-red-600 bg-transparent hover:bg-zinc-800 transition-colors"
              variant="outline"
              data-testid="button-show-create-new"
            >
              <div className="flex items-center w-full">
                <Plus className="w-5 h-5 mr-3 text-red-600" />
                <div className="flex-1">
                  <div className="font-medium text-white">Create New Wishlist</div>
                  <div className="text-sm text-zinc-400">
                    Make a custom collection for this item
                  </div>
                </div>
              </div>
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            data-testid="button-close-wishlist-selector"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}