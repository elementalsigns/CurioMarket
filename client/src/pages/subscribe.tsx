import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/useAuth";
import { Check, Crown, Store } from 'lucide-react';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
        return_url: `${window.location.origin}/seller/dashboard`,
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
        title: "Subscription Activated",
        description: "Welcome to Curio Market! Your seller account is now active.",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="subscribe-form">
      <Card className="glass-effect border border-gothic-purple/30">
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
        data-testid="button-subscribe"
      >
        {isProcessing ? "Processing..." : "Start Your Subscription"}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (user) {
      // Create subscription when user is loaded
      apiRequest("POST", "/api/subscription/create")
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            // Already has active subscription
            toast({
              title: "Already Subscribed",
              description: "You already have an active subscription",
            });
            window.location.href = "/seller/dashboard";
          }
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to initialize subscription",
            variant: "destructive",
          });
        });
    }
  }, [user, toast]);

  const handleSuccess = () => {
    window.location.href = "/seller/dashboard";
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

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20" data-testid="subscription-loading">
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
          {/* Header */}
          <div className="text-center mb-12" data-testid="subscribe-header">
            <Crown className="mx-auto mb-6 text-gothic-purple" size={64} />
            <h1 className="text-4xl font-serif font-bold mb-4">
              Activate Your <span className="text-gothic-purple">Seller</span> Account
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Start selling your oddities to collectors worldwide with our comprehensive seller platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div>
              <Card className="glass-effect border border-gothic-purple/30 mb-8" data-testid="plan-details">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-serif">Core Seller Plan</CardTitle>
                    <div className="text-3xl font-bold text-gothic-red">
                      $10<span className="text-base text-foreground/60 font-normal">/mo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-foreground/80">
                    Keep more of your earnings with Curio Market's 2.6% platform fee. Combined with Stripe's 2.9% processing fee, total fees are just 5.5%.
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-serif font-bold">What's Included:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Unlimited product listings
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Custom shop branding and profile
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Integrated buyer-seller messaging
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Comprehensive analytics dashboard
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Order management system
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Secure payment processing via Stripe
                      </li>
                      <li className="flex items-center text-foreground/80">
                        <Check className="text-gothic-purple mr-3 flex-shrink-0" size={16} />
                        Access to oddity-focused community
                      </li>
                    </ul>
                  </div>

                  <Card className="bg-gothic-purple/10 border border-gothic-purple/30" data-testid="pricing-breakdown">
                    <CardContent className="p-4">
                      <h4 className="font-serif font-bold mb-2">Fee Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Stripe Processing:</span>
                          <span>2.9% + $0.30</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span>2.6%</span>
                        </div>
                        <div className="border-t border-gothic-purple/30 mt-2 pt-2 flex justify-between font-semibold">
                          <span>Total Fees:</span>
                          <span>5.5% + $0.30</span>
                        </div>
                        <div className="text-xs text-foreground/60 mt-2">
                          Example: On a $100 sale, you keep $94.20 after all fees.
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly subscription</span>
                          <span>$10.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee per sale</span>
                          <span>2.6%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment processing</span>
                          <span>2.9% + $0.30</span>
                        </div>
                      </div>
                      <div className="text-xs text-foreground/60 mt-2">
                        Example: On a $100 sale, you keep $93.80 after all fees
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="glass-effect" data-testid="next-steps">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center">
                    <Store className="mr-2" size={20} />
                    What Happens Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-foreground/80">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      Complete your subscription payment below
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      Access your seller dashboard immediately
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      Create your first listing and start selling
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">4.</span>
                      Connect with collectors and grow your business
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Form */}
            <div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm onSuccess={handleSuccess} />
              </Elements>

              <div className="mt-6">
                <Card className="bg-gothic-purple/10 border border-gothic-purple/30" data-testid="compliance-reminder">
                  <CardContent className="p-4">
                    <h4 className="font-serif font-bold mb-2">Compliance Reminder</h4>
                    <p className="text-sm text-foreground/80">
                      By subscribing, you agree to comply with all local, state, and federal laws regarding 
                      the sale of oddities and specimens. Review our prohibited items list and seller guidelines.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-foreground/60">
                  Secure payment processing by Stripe. Cancel anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
