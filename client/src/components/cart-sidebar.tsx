import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    staleTime: 0, // Always refetch when component mounts
    gcTime: 0, // Don't cache results  
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => apiRequest("DELETE", `/api/cart/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      console.error("Remove from cart error:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      console.log('API call made:', { itemId, quantity });
      return apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: (data) => {
      console.log('API success:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.refetchQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: any) => {
      console.error("Update quantity error:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Type safety check - move this first
  if (!isOpen) return null;
  
  const cart = (cartData as any)?.cart;
  const items = (cartData as any)?.items || [];
  
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.listing?.price || 0) * item.quantity);
  }, 0);

  // Buyer only pays the item price - platform fee is deducted from seller payout  
  const total = subtotal;


  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        data-testid="cart-backdrop"
      />
      
      {/* Sidebar */}
      <div 
        className="ml-auto w-full max-w-md bg-background border-l border-border shadow-xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-serif font-semibold" data-testid="cart-title">
                Your Cart
              </h2>
              {items.length > 0 && (
                <Badge variant="secondary" data-testid="cart-count">
                  {items.length}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              data-testid="button-close-cart"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center" data-testid="cart-empty">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add some oddities and curiosities to get started
                </p>
                <Button 
                  onClick={onClose} 
                  className="w-full"
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {items.map((item: any) => (
                  <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Item Image */}
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                          {item.listing?.images?.[0] && (
                            <img 
                              src={item.listing.images[0].url}
                              alt={item.listing.images[0].alt}
                              className="w-full h-full object-cover"
                              data-testid={`cart-item-image-${item.id}`}
                            />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1" data-testid={`cart-item-title-${item.id}`}>
                            {item.listing?.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {item.listing?.seller?.shopName}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="w-6 h-6"
                                disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Decrease clicked:', { itemId: item.id, currentQuantity: item.quantity, newQuantity: item.quantity - 1 });
                                  if (item.quantity > 1) {
                                    updateQuantityMutation.mutate({
                                      itemId: item.id,
                                      quantity: item.quantity - 1  // Set absolute quantity
                                    });
                                  }
                                }}
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm" data-testid={`quantity-${item.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="w-6 h-6"
                                disabled={updateQuantityMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Increase clicked:', { itemId: item.id, currentQuantity: item.quantity, newQuantity: item.quantity + 1 });
                                  updateQuantityMutation.mutate({
                                    itemId: item.id,
                                    quantity: item.quantity + 1  // Set absolute quantity
                                  });
                                }}
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Price and Remove */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm" data-testid={`price-${item.id}`}>
                                ${(parseFloat(item.listing?.price || 0) * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-6 h-6 text-destructive"
                                disabled={removeFromCartMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCartMutation.mutate(item.id);
                                }}
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer with totals and checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-muted/50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span data-testid="cart-total">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={onClose}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}