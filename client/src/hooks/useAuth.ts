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
        timestamp: new Date().toISOString()
      });
    }
    if (error) {
      console.error('[PRODUCTION AUTH] Auth error:', error);
    }
  }, [user, error]);

  // Detect if user is effectively a seller (has subscription or seller profile)
  // SURGICAL FIX: Prioritize backend capabilities, fallback to legacy checks
  const isSeller = user && (
    !!(user as any).capabilities?.isSeller ||
    (user as any).role === 'admin' ||
    (user as any).role === 'seller' || 
    !!(user as any).stripeSubscriptionId || 
    !!(user as any).sellerId
  );
  
  // Determine effective role for UI routing
  // SURGICAL FIX: Preserve admin role, otherwise use seller if applicable
  const effectiveRole = (user as any)?.role === 'admin' ? 'admin' : (isSeller ? 'seller' : (user as any)?.role);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError: error,
    isSeller,
    effectiveRole,
  };
}
