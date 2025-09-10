import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get auth token from URL params (for incognito mode) or localStorage
function getAuthToken(): string | null {
  // First check URL params for token (after OAuth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('access_token');
  if (tokenFromUrl) {
    // Store in localStorage and remove from URL
    localStorage.setItem('curio_auth_token', tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('[AUTH] Token found in URL and stored');
    return tokenFromUrl;
  }
  
  // Fall back to localStorage - check both possible keys for compatibility
  const storedToken = localStorage.getItem('curio_auth_token') || localStorage.getItem('replit_access_token');
  console.log('[AUTH] Getting token from localStorage:', storedToken ? 'Found' : 'Not found');
  return storedToken;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const token = getAuthToken();
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[AUTH] Adding Bearer token to request');
  } else {
    console.log('[AUTH] No token available for request');
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle authentication failures specifically
  if (res.status === 401 || res.status === 403) {
    console.log('[AUTH] Authentication failed, status:', res.status);
    // Trigger re-authentication for production users
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev')) {
      console.log('[AUTH] Redirecting to login...');
      window.location.href = '/api/login';
      return {}; // Return empty object instead of Response
    }
  }

  await throwIfResNotOk(res);
  
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
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[AUTH] Using Bearer token for API call');
    } else {
      console.log('[AUTH] No token, relying on session cookies');
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    // Handle authentication failures specifically for production
    if (res.status === 401 || res.status === 403) {
      console.log('[AUTH] API call failed with status:', res.status);
      console.log('[AUTH] URL:', queryKey.join("/"));
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // For production users without tokens, try re-authentication
      if (!token && window.location.hostname !== 'localhost' && !window.location.hostname.includes('replit.dev')) {
        console.log('[AUTH] Production auth failure, redirecting to login...');
        window.location.href = '/api/login';
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
