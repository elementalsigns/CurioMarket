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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentIntent {
  sellerId: string;
  sellerName: string;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  subtotal: number;
  shipping: number;
  platformFee: number;
  stripeAccount: string;
  items: any[];
}

interface PaymentStatus {
  sellerId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  error?: string;
}

const MultiSellerCheckoutForm = ({ 
  setupIntentClientSecret,
  paymentIntents, 
  onSuccess, 
  cartItems 
}: { 
  setupIntentClientSecret: string;
  paymentIntents: PaymentIntent[]; 
  onSuccess: () => void; 
  cartItems: any[] 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSellerIndex, setCurrentSellerIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<'payment-method' | 'confirm-payments'>('payment-method');
  const [savedPaymentMethodId, setSavedPaymentMethodId] = useState<string | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>(
    paymentIntents.map(pi => ({ 
      sellerId: pi.sellerId, 
      status: 'pending' 
    }))
  );
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [completedPayments, setCompletedPayments] = useState<string[]>([]);

  const capturePaymentMethod = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe is not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    console.log('[CHECKOUT] Confirming SetupIntent to capture payment method...');
    
    try {
      // Confirm the SetupIntent to save the payment method
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`, // Stay on checkout for confirmation
        },
        redirect: 'if_required' // Only redirect if required by payment method
      });

      if (error) {
        console.error('[CHECKOUT] SetupIntent confirmation failed:', error);
        toast({
          title: "Payment Method Error",
          description: error.message || "Failed to save payment method.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        console.log('[CHECKOUT] Payment method captured successfully:', setupIntent.payment_method);
        setSavedPaymentMethodId(setupIntent.payment_method as string);
        setCurrentStep('confirm-payments');
        toast({
          title: "Payment Method Saved",
          description: "Now processing your payments...",
        });
        
        // Automatically start processing payments
        setTimeout(() => processPayments(setupIntent.payment_method as string), 500);
      } else {
        throw new Error('SetupIntent confirmation failed');
      }
    } catch (error: any) {
      console.error('[CHECKOUT] Error capturing payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to capture payment method.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const processPayments = async (paymentMethodId: string) => {
    console.log('[CHECKOUT] Starting multi-seller payment processing with saved payment method:', paymentMethodId);
    const completedPaymentIds: string[] = [];
    
    // Process each payment intent sequentially
    for (let i = 0; i < paymentIntents.length; i++) {
      const paymentIntent = paymentIntents[i];
      setCurrentSellerIndex(i);
      
      // Update status to processing
      setPaymentStatuses(prev => prev.map(status => 
        status.sellerId === paymentIntent.sellerId 
          ? { ...status, status: 'processing' }
          : status
      ));

      try {
        console.log(`[CHECKOUT] Processing payment ${i + 1}/${paymentIntents.length} for seller ${paymentIntent.sellerId}`);
        
        // Confirm this payment intent with the saved payment method
        const result = await apiRequest("POST", "/api/payments/confirm", {
          paymentIntentId: paymentIntent.paymentIntentId,
          paymentMethodId: paymentMethodId,
          sellerId: paymentIntent.sellerId,
          shippingAddress: shippingAddress
        });

        if (result.success && result.paymentIntentId) {
          completedPaymentIds.push(result.paymentIntentId);
          setCompletedPayments(prev => [...prev, paymentIntent.sellerId]);
          
          // Update status to succeeded
          setPaymentStatuses(prev => prev.map(status => 
            status.sellerId === paymentIntent.sellerId 
              ? { ...status, status: 'succeeded' }
              : status
          ));
          
          console.log(`[CHECKOUT] Payment succeeded for seller ${paymentIntent.sellerId}`);
        } else if (result.requiresAction) {
          // Handle 3D Secure or other required actions
          console.log(`[CHECKOUT] Payment requires action for seller ${paymentIntent.sellerId}`);
          
          const { error } = await stripe!.confirmCardPayment(result.clientSecret);
          
          if (error) {
            throw new Error(error.message || 'Payment confirmation failed');
          }
          
          // Re-check the payment status after action
          const recheckResult = await apiRequest("POST", "/api/payments/confirm", {
            paymentIntentId: paymentIntent.paymentIntentId,
            paymentMethodId: paymentMethodId,
            sellerId: paymentIntent.sellerId,
            shippingAddress: shippingAddress
          });
          
          if (recheckResult.success) {
            completedPaymentIds.push(recheckResult.paymentIntentId);
            setCompletedPayments(prev => [...prev, paymentIntent.sellerId]);
            setPaymentStatuses(prev => prev.map(status => 
              status.sellerId === paymentIntent.sellerId 
                ? { ...status, status: 'succeeded' }
                : status
            ));
          } else {
            throw new Error(recheckResult.error || 'Payment confirmation failed after action');
          }
        } else {
          throw new Error(result.error || 'Payment confirmation failed');
        }
      } catch (error: any) {
        console.error(`[CHECKOUT] Payment failed for seller ${paymentIntent.sellerId}:`, error);
        
        // Update status to failed
        setPaymentStatuses(prev => prev.map(status => 
          status.sellerId === paymentIntent.sellerId 
            ? { ...status, status: 'failed', error: error.message }
            : status
        ));

        // Show error and stop processing
        toast({
          title: "Payment Failed",
          description: `Payment failed for ${paymentIntent.sellerName}: ${error.message}`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    // All payments succeeded - create orders
    try {
      console.log('[CHECKOUT] All payments succeeded, creating orders...');
      const orderResponse = await apiRequest("POST", "/api/orders/create", {
        paymentIntentIds: completedPaymentIds,
        cartItems: cartItems,
        shippingAddress: shippingAddress,
        isMultiSeller: true
      });
      
      console.log('[CHECKOUT] Orders created successfully:', orderResponse);
      
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! All orders have been created.",
      });
      
      onSuccess();
    } catch (orderError) {
      console.error('[CHECKOUT] Order creation failed:', orderError);
      toast({
        title: "Warning",
        description: "Payments succeeded but order creation failed. Please contact support.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'payment-method') {
      await capturePaymentMethod();
    }
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

      {/* Payment Method Collection */}
      {currentStep === 'payment-method' && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="font-serif">Payment Method</CardTitle>
            <p className="text-sm text-foreground/70">
              Enter your payment information to complete the purchase
            </p>
          </CardHeader>
          <CardContent>
            <PaymentElement data-testid="payment-element" />
          </CardContent>
        </Card>
      )}

      {/* Multi-Seller Payment Progress */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="font-serif">Payment Progress</CardTitle>
          <p className="text-sm text-foreground/70">
            Processing payments for {paymentIntents.length} seller{paymentIntents.length > 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatuses.map((status, index) => {
            const paymentIntent = paymentIntents.find(pi => pi.sellerId === status.sellerId);
            const sellerItems = cartItems.filter(item => item.listing?.sellerId === status.sellerId);
            const sellerName = sellerItems[0]?.listing?.seller?.storeName || `Seller ${index + 1}`;
            
            return (
              <div key={status.sellerId} className="space-y-2" data-testid={`payment-progress-${status.sellerId}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {status.status === 'pending' && <Clock className="w-4 h-4 text-foreground/40" />}
                    {status.status === 'processing' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                    {status.status === 'succeeded' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {status.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                    <span className="font-medium">{sellerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={status.status === 'succeeded' ? 'default' : status.status === 'failed' ? 'destructive' : 'secondary'}>
                      {status.status === 'pending' ? 'Waiting' :
                       status.status === 'processing' ? 'Processing' :
                       status.status === 'succeeded' ? 'Completed' : 'Failed'}
                    </Badge>
                    {paymentIntent && (
                      <span className="text-sm text-foreground/70">
                        ${(paymentIntent.amount / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {status.status === 'processing' && (
                  <Progress value={50} className="h-2" />
                )}
                {status.status === 'succeeded' && (
                  <Progress value={100} className="h-2 bg-green-100" />
                )}
                {status.error && (
                  <p className="text-sm text-red-600">{status.error}</p>
                )}
              </div>
            );
          })}
          
          {paymentIntents.length > 1 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-foreground/70">
                💡 <strong>Platform fees are automatically handled:</strong> Each seller receives their portion minus processing fees, while our 2.6% platform fee is processed separately.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? 
          `Processing Payment ${currentSellerIndex + 1}/${paymentIntents.length}...` : 
          `Complete ${paymentIntents.length > 1 ? 'Multi-Seller ' : ''}Payment`
        }
      </Button>
    </form>
  );
};

interface CheckoutData {
  setupIntentClientSecret: string;
  setupIntentId: string;
  paymentIntents: PaymentIntent[];
  totalAmount: number;
  totalPlatformFee: number;
  sellersCount: number;
  cartId: string;
}

export default function Checkout() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    // Cart works for both authenticated and guest users
  });

  const cart = (cartData as any)?.cart;
  const items = (cartData as any)?.items || [];
  
  // Group items by seller for display
  const itemsBySeller = items.reduce((acc: any, item: any) => {
    const sellerId = item.listing?.sellerId || 'unknown';
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.listing?.seller,
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {});

  useEffect(() => {
    // Allow checkout for both authenticated and guest users
    // Only redirect if user is explicitly needed for the payment intent
    if (!authLoading && !user && items?.length > 0) {
      console.log('[CHECKOUT] Guest user with items, attempting checkout...');
      // Don't redirect immediately - try to create payment intent first
    }
  }, [user, authLoading, toast, items]);

  const initializeCheckout = async () => {
    if (!items?.length) return;
    
    setIsLoadingCheckout(true);
    setInitializationError(null);
    console.log('[CHECKOUT] Initializing multi-seller checkout for items:', items.length);
    
    try {
      // DEBUG: Log cookies before checkout
      console.log('[CHECKOUT DEBUG] Cookies:', document.cookie);
      console.log('[CHECKOUT DEBUG] Current domain:', window.location.hostname);
      console.log('[CHECKOUT DEBUG] Has cm.sid cookie:', document.cookie.includes('cm.sid'));
      
      // SURGICAL FIX: Use direct fetch to bypass apiRequest 401 issue
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          shippingAddress: {} // Will be collected in the form
        }),
        credentials: "include", // Explicit credentials for auth
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('[CHECKOUT] Multi-seller checkout initialized:', data);
      
      if (data.setupIntentClientSecret && data.paymentIntents && Array.isArray(data.paymentIntents)) {
        setCheckoutData(data);
        setInitializationError(null);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('[CHECKOUT] Failed to initialize checkout:', error);
      setInitializationError(error.message || 'Failed to initialize checkout');
      toast({
        title: "Error", 
        description: "Failed to initialize checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  useEffect(() => {
    // Initialize checkout when cart has items
    if (items?.length > 0) {
      initializeCheckout();
    }
  }, [items]);

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

  if (isLoadingCheckout || (!checkoutData && !initializationError)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-20" data-testid="checkout-loading">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          {isLoadingCheckout && (
            <p className="ml-3 text-foreground/70">Preparing multi-seller checkout...</p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  if (initializationError && !checkoutData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-4xl font-serif font-bold mb-4">Checkout Error</h1>
          <p className="text-foreground/70 mb-6">{initializationError}</p>
          <Button 
            onClick={initializeCheckout}
            className="bg-gothic-red hover:bg-gothic-red/80 text-white"
            data-testid="button-retry-checkout"
          >
            Try Again
          </Button>
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
                  {Object.entries(itemsBySeller).map(([sellerId, sellerGroup]: [string, any]) => (
                    <div key={sellerId} className="space-y-3" data-testid={`seller-group-${sellerId}`}>
                      {/* Seller Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-foreground/80">
                          {sellerGroup.seller?.storeName || 'Store'}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {sellerGroup.items.length} item{sellerGroup.items.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {/* Seller Items */}
                      <div className="space-y-2 ml-4">
                        {sellerGroup.items.map((item: any) => (
                          <div key={item.id} className="flex items-center space-x-3" data-testid={`cart-item-${item.id}`}>
                            <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center">
                              {item.listing?.images?.[0]?.url ? (
                                <img
                                  src={item.listing.images[0].url}
                                  alt={item.listing.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-lg opacity-50">📦</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium line-clamp-1" data-testid={`item-title-${item.id}`}>
                                {item.listing?.title}
                              </h5>
                              <p className="text-xs text-foreground/60">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-sm text-gothic-red font-bold" data-testid={`item-price-${item.id}`}>
                                ${(parseFloat(item.listing?.price || '0') * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {sellerId !== Object.keys(itemsBySeller)[Object.keys(itemsBySeller).length - 1] && (
                        <Separator className="my-3" />
                      )}
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
                    {checkoutData && checkoutData.paymentIntents.length > 1 && (
                      <div className="flex justify-between text-sm text-foreground/60">
                        <span>Platform Fees (2.6%)</span>
                        <span>
                          ${checkoutData.totalPlatformFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gothic-red">
                        ${checkoutData ? checkoutData.totalAmount.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    {checkoutData && checkoutData.paymentIntents.length > 1 && (
                      <p className="text-xs text-foreground/60 mt-2">
                        Payment will be processed separately for each seller
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {checkoutData && (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret: checkoutData.setupIntentClientSecret,
                    appearance: {
                      theme: 'stripe'
                    }
                  }}
                >
                  <MultiSellerCheckoutForm
                    setupIntentClientSecret={checkoutData.setupIntentClientSecret}
                    paymentIntents={checkoutData.paymentIntents}
                    onSuccess={handleSuccess}
                    cartItems={items}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
