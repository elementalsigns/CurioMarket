import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useEffect } from "react";

export function useAuth() {
  // SURGICAL FIX: Force fresh data in production only
  const isProduction = window.location.hostname === 'curiosities.market' || 
                       window.location.hostname === 'www.curiosities.market';
  
  const { data: user, isLoading, isFetching, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 2, // Moderate retries for reliability
    refetchOnWindowFocus: false, // Disable aggressive refetching
    refetchOnMount: false, // Disable refetch on mount
    refetchInterval: false, // FIXED: Disable polling to stop infinite loop
    staleTime: 5 * 60 * 1000, // FIXED: 5 minutes stale time to reduce requests
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    networkMode: 'online',
  });

  // Production debugging
  useEffect(() => {
    if (user) {
      console.log('[PRODUCTION AUTH] User loaded:', {
        id: (user as any).id,
        role: (user as any).role,
        email: (user as any).email,
        stripeCustomerId: (user as any).stripeCustomerId,
        capabilities: (user as any).capabilities,
        timestamp: new Date().toISOString()
      });
    }
    if (error) {
      console.error('[PRODUCTION AUTH] Auth error:', error);
    }
  }, [user, error]);

  // Detect if user is effectively a seller (has subscription or seller profile)
  // SURGICAL FIX: Prioritize backend capabilities, fallback to legacy checks
  const isSeller = Boolean(user && (
    !!(user as any).capabilities?.isSeller ||
    (user as any).role === 'admin' ||
    (user as any).role === 'seller' || 
    !!(user as any).stripeSubscriptionId || 
    !!(user as any).sellerId
  ));
  
  // Debug isSeller calculation (moved to existing useEffect to avoid hook order issues)
  useEffect(() => {
    if (user) {
      console.log('[PRODUCTION AUTH] User loaded:', {
        id: (user as any).id,
        role: (user as any).role,
        email: (user as any).email,
        stripeCustomerId: (user as any).stripeCustomerId,
        capabilities: (user as any).capabilities,
        timestamp: new Date().toISOString()
      });
      
      // Inline seller debug to avoid hook order issues
      console.log('[SELLER DEBUG]', {
        hasCapabilitiesIsSeller: !!(user as any).capabilities?.isSeller,
        isAdmin: (user as any).role === 'admin',
        isSeller: (user as any).role === 'seller',
        hasStripeSubId: !!(user as any).stripeSubscriptionId,
        hasSellerId: !!(user as any).sellerId,
        finalIsSeller: isSeller,
        capabilities: (user as any).capabilities
      });
    }
    if (error) {
      console.error('[PRODUCTION AUTH] Auth error:', error);
    }
  }, [user, error, isSeller]);
  
  // Determine effective role for UI routing
  // SURGICAL FIX: Preserve admin role, otherwise use seller if applicable
  const effectiveRole = (user as any)?.role === 'admin' ? 'admin' : (isSeller ? 'seller' : (user as any)?.role);
  
  // SURGICAL FIX: Only consider auth ready when not loading AND not fetching
  const isAuthReady = !isLoading && !isFetching;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAuthReady,
    authError: error,
    isSeller,
    effectiveRole,
  };
}
