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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError: error,
  };
}
