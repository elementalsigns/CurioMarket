import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 2, // Retry more in production for network issues
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: false,
    staleTime: 2 * 60 * 1000, // Shorter stale time for production
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError: error,
  };
}
