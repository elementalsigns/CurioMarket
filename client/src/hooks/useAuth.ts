import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1, // Try once on failure
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
