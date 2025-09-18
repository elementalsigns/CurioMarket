import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useEffect } from "react";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 3, // More retries for production reliability
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: 30000, // Check every 30 seconds for production
    staleTime: 1 * 60 * 1000, // Shorter stale time for production
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    networkMode: 'online', // Ensure network requests in production
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

  // Live testing log
  if (user && isSeller !== undefined) {
    console.log(`[LIVE TEST] useAuth returning: isSeller=${isSeller}, role=${(user as any)?.role}, capabilities=${JSON.stringify((user as any)?.capabilities)}`);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError: error,
    isSeller,
    effectiveRole,
  };
}
