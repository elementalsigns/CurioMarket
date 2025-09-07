import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";
import SubscriptionPayment from "@/components/subscription/SubscriptionPayment";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";

export default function SellerSubscriptionPage() {
  const [, navigate] = useLocation();
  const [showPayment, setShowPayment] = useState(false);

  // IMMEDIATE scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // INSTANT redirect check from localStorage
  useEffect(() => {
    const cachedRole = localStorage.getItem('curio_user_role');
    if (cachedRole === 'seller') {
      console.log('[SELLER-SUBSCRIPTION] Cached seller detected - immediate redirect');
      window.location.replace('/seller/dashboard');
      return;
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Immediate redirect for existing sellers
  useEffect(() => {
    if (user && (user as any).role === 'seller') {
      console.log('SellerSubscription: Redirecting seller to dashboard');
      localStorage.setItem('curio_user_role', 'seller');
      window.location.replace('/seller/dashboard');
      return;
    }
  }, [user]);

  const handleSubscriptionSuccess = () => {
    setShowPayment(false);
    // Redirect to seller onboarding
    navigate('/seller/setup');
  };

  const handleStartSubscription = () => {
    setShowPayment(true);
  };

  const handleCancel = () => {
    setShowPayment(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-700">
          <CardContent className="p-6 text-center">
            <p className="text-zinc-400 mb-4">Please sign in to access seller subscription.</p>
            <Button 
              onClick={() => navigate('/signin')}
              className="bg-red-800 hover:bg-red-700 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has seller role (indicating they're a paid seller)
  const hasActiveSubscription = (user as any)?.role === 'seller';

  // Auto-redirect paid sellers to dashboard
  useEffect(() => {
    if (hasActiveSubscription && !showPayment) {
      navigate('/seller/dashboard');
    }
  }, [hasActiveSubscription, showPayment, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Become a Seller</h1>
            <p className="text-zinc-400 text-lg">
              Join Curio Market and start selling your unique collections
            </p>
          </div>

          {/* Content */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Subscription Info */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Seller Subscription
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Everything you need to succeed on Curio Market
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">$10</div>
                    <div className="text-zinc-400">per month</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-zinc-300">Create unlimited listings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-zinc-300">Professional seller dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-zinc-300">Order management & analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-zinc-300">Direct customer messaging</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-zinc-300">Only 2.6% platform fee per sale</span>
                    </div>
                  </div>

                  {!hasActiveSubscription && !showPayment && (
                    <Button 
                      onClick={handleStartSubscription}
                      className="w-full bg-red-800 hover:bg-red-700 text-white"
                      data-testid="button-start-subscription"
                    >
                      Start Subscription
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment/Status */}
            <div>
              {hasActiveSubscription ? (
                <SubscriptionStatus onManageSubscription={() => {/* TODO: Implement billing portal */}} />
              ) : showPayment ? (
                <SubscriptionPayment 
                  onSuccess={handleSubscriptionSuccess}
                  onCancel={handleCancel}
                />
              ) : (
                <Card className="bg-zinc-900 border-zinc-700">
                  <CardContent className="p-6 text-center">
                    <div className="text-zinc-400 mb-4">
                      Ready to start your seller journey?
                    </div>
                    <p className="text-sm text-zinc-500">
                      Click "Start Subscription" to begin the payment process and unlock all seller features.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {hasActiveSubscription && (
            <div className="mt-8 text-center">
              <Button 
                onClick={() => navigate('/seller/dashboard')}
                className="bg-red-800 hover:bg-red-700 text-white"
              >
                Go to Seller Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}