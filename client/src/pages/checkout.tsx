import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ cartId, onSuccess }: { cartId: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        shipping: {
          name: shippingAddress.name,
          address: {
            line1: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
        },
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
      {/* Shipping Address */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="font-serif">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={shippingAddress.name}
              onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
              required
              className="mt-1"
              data-testid="input-name"
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              required
              className="mt-1"
              data-testid="input-address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                required
                className="mt-1"
                data-testid="input-city"
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                required
                className="mt-1"
                data-testid="input-state"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              required
              className="mt-1"
              data-testid="input-postal-code"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="font-serif">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? "Processing..." : "Complete Payment"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    // Cart works for both authenticated and guest users
  });

  const cart = (cartData as any)?.cart;
  const items = (cartData as any)?.items || [];

  useEffect(() => {
    // Allow checkout for both authenticated and guest users
    // Only redirect if user is explicitly needed for the payment intent
    if (!authLoading && !user && items?.length > 0) {
      console.log('[CHECKOUT] Guest user with items, attempting checkout...');
      // Don't redirect immediately - try to create payment intent first
    }
  }, [user, authLoading, toast, items]);

  useEffect(() => {
    // Create PaymentIntent when cart has items (works for both authenticated and guest users)
    if (items?.length > 0) {
      console.log('[CHECKOUT] Creating payment intent for items:', items.length);
      apiRequest("POST", "/api/create-payment-intent", { 
        cartItems: items,
        shippingAddress: {} // Will be collected in the form
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('[CHECKOUT] Payment intent created successfully');
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error('[CHECKOUT] Failed to create payment intent:', error);
          toast({
            title: "Error", 
            description: "Failed to initialize checkout. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [items, toast]);

  const handleSuccess = () => {
    // Redirect to success page or clear cart
    window.location.href = "/order-confirmation";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!authLoading && (!items || items.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="mx-auto mb-4 text-foreground/40" size={48} />
          <h1 className="text-4xl font-serif font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-foreground/70">Add some oddities to your cart before checking out.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20" data-testid="checkout-loading">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8" data-testid="checkout-header">
            <h1 className="text-4xl font-serif font-bold mb-2">Checkout</h1>
            <p className="text-foreground/70">Complete your order for these unique oddities</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="glass-effect sticky top-4" data-testid="order-summary">
                <CardHeader>
                  <CardTitle className="font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4" data-testid={`cart-item-${item.id}`}>
                      <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center">
                        {item.listing?.images?.[0]?.url ? (
                          <img
                            src={item.listing.images[0].url}
                            alt={item.listing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl opacity-50">📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1" data-testid={`item-title-${item.id}`}>
                          {item.listing?.title}
                        </h4>
                        <p className="text-sm text-foreground/60">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-gothic-red font-bold" data-testid={`item-price-${item.id}`}>
                          ${(parseFloat(item.listing?.price || '0') * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2" data-testid="order-totals">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${items.reduce((sum: number, item: any) => 
                        sum + (parseFloat(item.listing?.price || '0') * item.quantity), 0
                      ).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${items.reduce((sum: number, item: any) => 
                        sum + parseFloat(item.listing?.shippingCost || '0'), 0
                      ).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (2.6%)</span>
                      <span>${(items.reduce((sum: number, item: any) => 
                        sum + (parseFloat(item.listing?.price || '0') * item.quantity), 0
                      ) * 0.026).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gothic-red">
                        ${(items.reduce((sum: number, item: any) => {
                          const itemTotal = parseFloat(item.listing?.price || '0') * item.quantity;
                          const shipping = parseFloat(item.listing?.shippingCost || '0');
                          return sum + itemTotal + shipping;
                        }, 0) * 1.026).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm cartId={(cartData as any)?.cart?.id} onSuccess={handleSuccess} />
              </Elements>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
