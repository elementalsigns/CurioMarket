import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import Product from "@/pages/product";
import SellerOnboarding from "@/pages/seller-onboarding";
import SellerOnboardingSimple from "@/pages/seller-onboarding-simple";
import SellerDashboard from "@/pages/seller-dashboard";
import SellerOrders from "@/pages/seller-orders";
import CreateListing from "@/pages/create-listing";
import EditListing from "@/pages/edit-listing";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import SellerStart from "@/pages/seller-start";
import UserProfile from "@/pages/user-profile";
import AccountManager from "@/pages/account-manager";
import SellerTerms from "@/pages/seller-terms";
import SellerGuide from "@/pages/seller-guide";
import SellerGuideClean from "@/pages/seller-guide-clean";
import DemoSimple from "@/pages/demo-simple";
import SellerGuideSimple from "@/pages/seller-guide-simple";
import SellerGuideMinimal from "@/pages/seller-guide-minimal";
import SellerGuideFinal from "@/pages/seller-guide-final";
import SellerGuideStandalone from "@/pages/seller-guide-standalone";
import TestSellerGuide from "@/pages/test-seller-guide";
import HelpCenter from "@/pages/help-center";
import Safety from "@/pages/safety";
import ContactUs from "@/pages/contact-us";
import PrivacyPolicyStandalone from "@/pages/privacy-policy";
import TermsOfServiceStandalone from "@/pages/terms-of-service";
import ProhibitedItemsStandalone from "@/pages/prohibited-items";
import CookiesPolicyStandalone from "@/pages/cookies-policy";
import Wishlists from "@/pages/wishlists";
import SellerAnalytics from "@/pages/seller-analytics";
import InventoryManagement from "@/pages/inventory-management";
import Reviews from "@/pages/reviews";
import Verification from "@/pages/verification";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPage from "@/pages/admin";
import SetAdminPage from "@/pages/set-admin";
import Events from "@/pages/events";
import SignIn from "@/pages/signin";
import SignInOnly from "@/pages/signin-only";
import SellerSubscription from "@/pages/SellerSubscription";
import IncognitoAuth from "@/pages/incognito-auth";
import ShopPage from "@/pages/shop";
import OrderConfirmation from "@/pages/order-confirmation";
import OrderDetails from "@/pages/order-details";
import Messages from "@/pages/messages";

// Authentication guard component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // SURGICAL FIX: Derive authentication state from user existence
  const isAuthenticated = Boolean(user);
  const isAuthReady = !isLoading;
  
  useEffect(() => {
    // Only redirect when auth is fully ready and user is not authenticated
    if (isAuthReady && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `/signin?next=${encodeURIComponent(currentPath)}`;
      setLocation(redirectUrl);
    }
  }, [isAuthenticated, isAuthReady, setLocation]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  return <>{children}</>;
}

function Router() {
  const { user, isLoading } = useAuth();
  
  // SURGICAL FIX: Derive authentication state from user existence
  const isAuthenticated = Boolean(user);

  // Auto-redirect paid sellers away from subscription pages with LOCAL STORAGE persistence
  useEffect(() => {
    const checkAndRedirect = async () => {
      const currentPath = window.location.pathname;
      
      // INSTANT CHECK: Check localStorage first for immediate redirect
      const cachedRole = localStorage.getItem('curio_user_role');
      if (cachedRole === 'seller' && (
          currentPath === '/subscribe' || 
          currentPath === '/seller/subscription' || 
          currentPath === '/seller/start'
        )) {
        console.log('[INSTANT REDIRECT] Cached seller role detected - immediate redirect');
        window.location.replace('/seller/dashboard');
        return;
      }
      
      // Wait for auth to complete before redirecting
      if (!isLoading && user) {
        const userRole = (user as any).role;
        const userId = (user as any).id;
        
        // Cache the role for instant future redirects
        if (userRole) {
          localStorage.setItem('curio_user_role', userRole);
          localStorage.setItem('curio_user_id', userId);
        }
        
        // PRODUCTION FIX: Check if this is production domain
        const isProduction = window.location.hostname.endsWith('curiosities.market');
        
        console.log('[PRODUCTION REDIRECT] User loaded:', {
          userId,
          role: userRole,
          path: currentPath,
          timestamp: new Date().toISOString(),
          isProduction,
          isSeller: userRole === 'seller' || userRole === 'admin',
          hasStripeId: !!(user as any).stripeCustomerId,
          shouldShowDashboard: (userRole === 'seller' || userRole === 'admin') && !!(user as any).stripeCustomerId
        });
        
        // Method 1: Check user role (primary method)
        if (userRole === 'seller' || userRole === 'admin') {
          if (currentPath === '/subscribe' || 
              currentPath === '/seller/subscription' || 
              currentPath === '/seller/start') {
            console.log('[PRODUCTION REDIRECT] SELLER DETECTED - Redirecting by role to dashboard');
            // Use replace to prevent back button issues
            window.location.replace('/seller/dashboard');
            return;
          }
          
          // PRODUCTION FIX: For production, ensure seller dashboard access works  
          if (isProduction && currentPath === '/seller/dashboard') {
            console.log('[PRODUCTION REDIRECT] Direct seller dashboard access - ensuring auth state');
            // Force a brief delay to ensure auth state is fully resolved
            setTimeout(() => {
              if (!window.location.pathname.includes('/seller/dashboard')) {
                window.location.replace('/seller/dashboard');
              }
            }, 100);
          }
          
          // COMPREHENSIVE PRODUCTION FIX: Handle NotFound issues in production
          if (isProduction && currentPath === '/') {
            // Check if user was trying to access seller dashboard but ended up on home page
            console.log('[PRODUCTION FIX] Admin user on home page in production - checking for seller dashboard intent');
            const lastClickedElement = document.activeElement;
            const referrer = document.referrer;
            
            // If this looks like a seller dashboard attempt, redirect
            if (referrer.includes('seller') || localStorage.getItem('seller_dashboard_intent')) {
              console.log('[PRODUCTION FIX] Redirecting to seller dashboard based on intent');
              localStorage.removeItem('seller_dashboard_intent');
              setTimeout(() => {
                window.location.replace('/seller/dashboard');
              }, 100);
            }
          }
        }
        
        // Method 2: Check subscription status as backup (for edge cases)
        if (currentPath === '/subscribe' || 
            currentPath === '/seller/subscription' || 
            currentPath === '/seller/start') {
          try {
            console.log('[PRODUCTION REDIRECT] Checking subscription status as backup...');
            const response = await fetch('/api/subscription/status', { 
              method: 'POST',
              credentials: 'include' // Ensure cookies are sent
            });
            if (response.ok) {
              const data = await response.json();
              console.log('[PRODUCTION REDIRECT] Subscription status response:', data);
              if (data.hasActiveSubscription) {
                console.log('[PRODUCTION REDIRECT] ACTIVE SUBSCRIPTION - Redirecting to dashboard');
                window.location.replace('/seller/dashboard');
              }
            } else {
              console.log('[PRODUCTION REDIRECT] Subscription status check failed:', response.status);
            }
          } catch (error) {
            console.error('[PRODUCTION REDIRECT] Subscription check error:', error);
          }
        }
      } else if (!isLoading && !user) {
        // Clear cached role if no user
        localStorage.removeItem('curio_user_role');
        localStorage.removeItem('curio_user_id');
        console.log('[PRODUCTION REDIRECT] No user authenticated, path:', window.location.pathname);
      }
    };
    
    checkAndRedirect();
  }, [user, isLoading]);

  // SURGICAL FIX: Add detailed route debugging with render tracking
  const currentPath = window.location.pathname;
  const renderId = Math.random().toString(36).substr(2, 9);
  console.log(`[ROUTE DEBUG ${renderId}]`, {
    currentPath,
    isLoading,
    isAuthenticated,
    user: user ? 'EXISTS' : 'NONE',
    userRole: (user as any)?.role,
    shouldShowHome: !isLoading && isAuthenticated,
    shouldShowLanding: !isLoading && !isAuthenticated,
    timestamp: new Date().toISOString()
  });

  return (
    <Switch>
      {isLoading ? (
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </Route>
      ) : (
        <>
          {/* SURGICAL FIX: Explicit route matching for home page */}
          <Route path="/" component={() => {
            console.log('[ROOT ROUTE] Rendering home page - authenticated:', isAuthenticated);
            return isAuthenticated ? <Home /> : <Landing />;
          }} />
          <Route path="/browse" component={Browse} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/shop/:sellerId" component={() => <ShopPage />} />
          <Route path="/seller/terms" component={SellerTerms} />
          <Route path="/seller/guide" component={SellerGuideStandalone} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/safety" component={Safety} />
          <Route path="/contact" component={ContactUs} />
          <Route path="/privacy" component={PrivacyPolicyStandalone} />
          <Route path="/terms" component={TermsOfServiceStandalone} />
          <Route path="/prohibited" component={ProhibitedItemsStandalone} />
          <Route path="/cookies" component={CookiesPolicyStandalone} />
          <Route path="/events" component={Events} />
          <Route path="/signin" component={SignInOnly} />
          <Route path="/signup" component={SignIn} />
          <Route path="/incognito-auth" component={IncognitoAuth} />
          
          {/* Subscription routes - accessible to all */}
          <Route path="/seller/subscription" component={SellerSubscription} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/account-demo" component={DemoSimple} />
          
          {/* Redirect old inventory URL to new one */}
          <Route path="/seller/inventory" component={() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/seller/inventory-management');
            }, [setLocation]);
            return null;
          }} />
          
          {/* Redirect legacy seller-dashboard to new seller/dashboard */}
          <Route path="/seller-dashboard" component={() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/seller/dashboard', { replace: true });
            }, [setLocation]);
            return null;
          }} />
          
          {/* Protected routes - require authentication */}
          <Route path="/seller/onboard" component={() => <ProtectedRoute><SellerOnboarding /></ProtectedRoute>} />
          <Route path="/seller/onboarding" component={() => <ProtectedRoute><SellerOnboardingSimple /></ProtectedRoute>} />
          <Route path="/seller/start" component={() => <ProtectedRoute><SellerStart /></ProtectedRoute>} />
          <Route path="/seller/dashboard" component={() => <ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/orders" component={() => <ProtectedRoute><SellerOrders /></ProtectedRoute>} />
          <Route path="/seller/analytics" component={() => <ProtectedRoute><SellerAnalytics /></ProtectedRoute>} />
          <Route path="/seller/inventory-management" component={() => <ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
          <Route path="/seller/reviews" component={() => <ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/seller/listings/create" component={() => <ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/seller/listings/edit/:id" component={() => <ProtectedRoute><EditListing /></ProtectedRoute>} />
          <Route path="/checkout" component={() => <ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-confirmation" component={() => <ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="/orders/:orderId" component={OrderDetails} />
          <Route path="/messages/new" component={() => <ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages" component={() => <ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/profile" component={() => <ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/account" component={() => <ProtectedRoute><AccountManager /></ProtectedRoute>} />
          <Route path="/verification" component={() => <ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/admin" component={() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/cleanup" component={() => <ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/set-admin" component={() => <ProtectedRoute><SetAdminPage /></ProtectedRoute>} />
          <Route path="/wishlists" component={() => <ProtectedRoute><Wishlists /></ProtectedRoute>} />
          
          {/* Logout route */}
          <Route path="/logout-complete" component={() => {
            // Clear localStorage tokens and redirect
            useEffect(() => {
              console.log('[LOGOUT-COMPLETE] Clearing localStorage tokens');
              localStorage.removeItem('curio_auth_token');
              localStorage.removeItem('curio_user_role');
              localStorage.removeItem('curio_user_id');
              
              // Force a page reload to clear any cached auth state
              setTimeout(() => {
                window.location.replace('/');
              }, 100);
            }, []);
            
            return (
              <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-garamond text-white mb-4">Signing out...</h1>
                  <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto" />
                </div>
              </div>
            );
          }} />
          
          {/* Catch-all 404 route */}
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark" style={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'hsl(212, 5%, 5%)'}}>
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
