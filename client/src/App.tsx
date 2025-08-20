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
import SellerDashboard from "@/pages/seller-dashboard";
import CreateListing from "@/pages/create-listing";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import UserProfile from "@/pages/user-profile";

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
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/product/:slug" component={Product} />
          <Route path="/seller/onboard" component={SellerOnboarding} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/seller/listings/create" component={CreateListing} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/profile" component={UserProfile} />
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
        <div className="dark min-h-screen bg-background">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
