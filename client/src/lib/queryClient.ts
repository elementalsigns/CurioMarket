import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Clear any legacy auth tokens from localStorage to prevent conflicts
function clearLegacyTokens() {
  const hadTokens = localStorage.getItem('curio_auth_token') || localStorage.getItem('replit_access_token');
  if (hadTokens) {
    console.log('[AUTH] Clearing legacy tokens from localStorage');
    localStorage.removeItem('curio_auth_token');
    localStorage.removeItem('replit_access_token');
  }
}

// Clear tokens on page load to prevent auth conflicts
clearLegacyTokens();

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  console.log('[AUTH] Using session-based authentication only');

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle authentication failures specifically
  if (res.status === 401 || res.status === 403) {
    console.log('[AUTH] Authentication failed, status:', res.status);
    // For production users, only redirect to login if accessing protected routes
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev')) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/signin') || currentPath.includes('/login') || currentPath.includes('/callback');
      const isProtectedRoute = currentPath.includes('/account') || currentPath.includes('/seller') || currentPath.includes('/admin');
      
      // Only redirect to login for protected routes, not for homepage/public browsing
      if (!isAuthPage && isProtectedRoute) {
        console.log('[AUTH] Redirecting to login from protected route:', currentPath);
        window.location.href = '/api/login';
        return {}; // Return empty object instead of Response
      } else {
        console.log('[AUTH] Public route or auth page, not redirecting to login');
      }
    }
  }

  // Check if response is ok and handle errors properly
  if (!res.ok) {
    let errorText;
    try {
      errorText = await res.text();
    } catch {
      errorText = res.statusText;
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
  
  // Parse JSON response automatically for mutations
  try {
    return await res.json();
  } catch (error) {
    // If response is not JSON (e.g., 204 No Content), return empty object
    return {};
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: HeadersInit = {};
    
    console.log('[AUTH] Using session cookies for authentication');

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    // Handle authentication failures specifically for production
    if (res.status === 401 || res.status === 403) {
      console.log('[AUTH] API call failed with status:', res.status);
      console.log('[AUTH] URL:', queryKey.join("/"));
      
      // For production, only redirect to login if accessing protected routes
      if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev')) {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/signin') || currentPath.includes('/login') || currentPath.includes('/callback');
        const isProtectedRoute = currentPath.includes('/account') || currentPath.includes('/seller') || currentPath.includes('/admin');
        
        // Only redirect to login for protected routes, not for homepage/public browsing
        if (!isAuthPage && isProtectedRoute) {
          console.log('[AUTH] Query failed, redirecting to login from protected route:', currentPath);
          window.location.href = '/api/login';
          return null;
        } else {
          console.log('[AUTH] Public route or auth page, not redirecting to login');
        }
      }
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
