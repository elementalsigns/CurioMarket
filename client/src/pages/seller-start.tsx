import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SellerStart() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // IMMEDIATE seller check - before any other logic
  useEffect(() => {
    console.log('[SELLER-START] Component mounted, user:', user);
    if (user && (user as any)?.role === 'seller') {
      console.log('[SELLER-START] IMMEDIATE seller redirect triggered');
      window.location.replace("/seller/dashboard");
    }
  }, [user]);

  // Check subscription status - but only for non-sellers
  const { data: subscriptionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/subscription/status"],
    enabled: !!user && (user as any)?.role !== 'seller',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please log in to access seller features",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
  }, [user, authLoading, toast]);

  // IMMEDIATE scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // INSTANT redirect check from localStorage
  useEffect(() => {
    const cachedRole = localStorage.getItem('curio_user_role');
    if (cachedRole === 'seller') {
      console.log('[SELLER-START] Cached seller detected - immediate redirect');
      window.location.replace('/seller/dashboard');
      return;
    }
  }, []);

  useEffect(() => {
    if (user && (user as any)?.role === 'seller') {
      // User has seller role, redirect directly to dashboard
      console.log('[SELLER-START] Seller detected - redirecting to dashboard');
      localStorage.setItem('curio_user_role', 'seller');
      window.location.replace("/seller/dashboard");
      return;
    }
  }, [user]);

  // ADDITIONAL check for when user data updates
  useEffect(() => {
    if (user && (user as any)?.role === 'seller') {
      console.log('[SELLER-START] User role confirmed as seller - forcing redirect');
      localStorage.setItem('curio_user_role', 'seller');
      window.location.replace("/seller/dashboard");
    }
  }, [(user as any)?.role]);

  const handleStartOnboarding = () => {
    if ((user as any)?.role === 'seller') {
      window.location.href = "/seller/onboarding";
    } else {
      window.location.href = "/subscribe";
    }
  };

  // RENDER GUARD: Never show subscription content to sellers
  if (user && (user as any)?.role === 'seller') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-foreground/70">Redirecting to seller dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (authLoading || statusLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Crown className="mx-auto mb-6 text-gothic-purple" size={64} />
          <h1 className="text-4xl font-serif font-bold mb-4">
            Welcome to <span className="text-gothic-purple">Seller Central</span>
          </h1>
          
          {(user as any)?.role === 'seller' ? (
            <Card className="glass-effect border border-green-500/30 mb-8">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center justify-center">
                  <Check className="mr-2" size={24} />
                  Subscription Active!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  Your seller subscription is active and ready. Let's set up your shop profile and start selling your curiosities.
                </p>
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
                >
                  Create Your Shop Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-effect border border-gothic-purple/30 mb-8">
              <CardHeader>
                <CardTitle>Subscription Required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  To become a seller on Curio Market, you need an active $10/month subscription.
                  Status: {(subscriptionStatus as any)?.subscriptionStatus || 'None'}
                </p>
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full bg-gothic-red hover:bg-gothic-red/80 text-white py-3 rounded-2xl font-medium text-lg"
                >
                  Start Subscription
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="text-sm text-foreground/60">
            <p>Need help? <a href="/help" className="text-gothic-red hover:underline">Contact Support</a></p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}