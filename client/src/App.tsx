import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
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
import Events from "@/pages/events";
import SignIn from "@/pages/signin";
import SignInOnly from "@/pages/signin-only";
import SellerSubscription from "@/pages/SellerSubscription";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </Route>
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/browse" component={Browse} />
          <Route path="/product/:slug" component={Product} />
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
          <Route path="/seller/subscription" component={SellerSubscription} />
          <Route path="/signin" component={SignInOnly} />
          <Route path="/signup" component={SignIn} />
          <Route path="/account-demo" component={DemoSimple} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/seller/terms" component={SellerTerms} />
          <Route path="/seller/guide" component={SellerGuideStandalone} />
          <Route path="/help" component={HelpCenter} />
          <Route path="/safety" component={Safety} />
          <Route path="/contact" component={ContactUs} />
          <Route path="/privacy" component={PrivacyPolicyStandalone} />
          <Route path="/terms" component={TermsOfServiceStandalone} />
          <Route path="/prohibited" component={ProhibitedItemsStandalone} />
          <Route path="/cookies" component={CookiesPolicyStandalone} />
          <Route path="/seller/subscription" component={SellerSubscription} />
          <Route path="/seller/onboard" component={SellerOnboarding} />
          <Route path="/seller/onboarding" component={SellerOnboardingSimple} />
          <Route path="/seller/start" component={SellerStart} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/orders" component={SellerOrders} />
          <Route path="/seller/analytics" component={SellerAnalytics} />
          <Route path="/seller/inventory" component={InventoryManagement} />
          <Route path="/seller/reviews" component={Reviews} />
          <Route path="/seller/listings/create" component={CreateListing} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/account" component={AccountManager} />
          <Route path="/verification" component={Verification} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/wishlists" component={Wishlists} />
          <Route path="/events" component={Events} />
          <Route path="/account-demo" component={DemoSimple} />
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
