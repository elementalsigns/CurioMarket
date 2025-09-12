import type { Express } from "express";
import { authService, createAuthMiddleware } from "./auth-service";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export async function setupAuthRoutes(app: Express) {
  console.log('[AUTH] Setting up authentication routes...');
  
  try {
    // Initialize the auth service
    await authService.initialize();
    
    // Create the auth middleware
    const requireAuth = createAuthMiddleware(authService);
    
    // Login route - redirect to OAuth provider
    app.get('/api/auth/login', (req, res) => {
      try {
        const state = Math.random().toString(36).substring(7);
        const authUrl = authService.getAuthorizationUrl(state);
        
        // Store state in session for validation
        if (req.session) {
          (req.session as any).authState = state;
        }
        
        res.redirect(authUrl);
      } catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({ error: 'Failed to initiate login' });
      }
    });

    // Callback route - handle OAuth callback
    app.get('/api/auth/callback', async (req, res) => {
      try {
        const { code, state } = req.query;
        
        if (!code) {
          return res.status(400).json({ error: 'Authorization code missing' });
        }

        // Validate state parameter
        if (req.session && (req.session as any).authState && state !== (req.session as any).authState) {
          return res.status(400).json({ error: 'Invalid state parameter' });
        }

        const authUser = await authService.handleCallback(code as string, state as string);
        
        // Store user in session
        if (req.session) {
          (req.session as any).userId = authUser.id;
          (req.session as any).accessToken = authUser.accessToken;
          (req.session as any).refreshToken = authUser.refreshToken;
          (req.session as any).expiresAt = authUser.expiresAt;
        }

        // For incognito mode support, also redirect with token in URL
        const redirectUrl = new URL('/', req.get('host') ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000');
        redirectUrl.searchParams.set('access_token', authUser.accessToken);
        redirectUrl.searchParams.set('auth_success', 'true');
        
        res.redirect(redirectUrl.toString());
      } catch (error) {
        console.error('[AUTH] Callback error:', error);
        res.redirect('/?error=auth_failed');
      }
    });

    // Logout route
    app.get('/api/auth/logout', (req, res) => {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('[AUTH] Session destroy error:', err);
          }
        });
      }
      
      // Clear any tokens from localStorage (frontend will handle this)
      res.redirect('/?logged_out=true');
    });

    // Get current user route - DISABLED: Using the one in routes.ts instead
    // app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    //   try {
    //     const userId = req.user.claims.sub;
    //     const user = await storage.getUser(userId);
    //     
    //     if (!user) {
    //       return res.status(404).json({ message: 'User not found' });
    //     }
    //     
    //     // User role returned from database
    //     
    //     res.json(user);
    //   } catch (error) {
    //     console.error('[AUTH] Get user error:', error);
    //     res.status(500).json({ message: 'Failed to fetch user' });
    //   }
    // });

    // Token validation route (for frontend to check token validity)
    app.post('/api/auth/validate', async (req, res) => {
      try {
        const { access_token } = req.body;
        
        if (!access_token) {
          return res.status(400).json({ error: 'Access token required' });
        }

        const authUser = await authService.validateToken(access_token);
        
        if (!authUser) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ 
          valid: true,
          user: {
            id: authUser.id,
            email: authUser.email,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            profileImageUrl: authUser.profileImageUrl,
          }
        });
      } catch (error) {
        console.error('[AUTH] Token validation error:', error);
        res.status(500).json({ error: 'Validation failed' });
      }
    });

    console.log('[AUTH] Authentication routes set up successfully');
    return requireAuth;
  } catch (error) {
    console.error('[AUTH] Failed to setup auth routes:', error);
    
    // Fallback routes in case of setup failure
    app.get('/api/auth/login', (req, res) => {
      res.status(500).json({ error: 'Authentication not available' });
    });
    
    // Fallback disabled - using main auth route instead
    // app.get('/api/auth/user', (req, res) => {
    //   res.status(500).json({ error: 'Authentication not available' });
    // });
    
    // Return a middleware that always fails
    return (req: any, res: any, next: any) => {
      res.status(500).json({ error: 'Authentication not available' });
    };
  }
}