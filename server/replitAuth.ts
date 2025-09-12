import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Configure session cookie settings for custom domain support
  const isProduction = process.env.NODE_ENV === 'production';
  // Always use production settings for HTTPS and custom domain compatibility
  const useProductionSettings = true; // Enable for all custom domain access
  
  const cookieConfig = {
    httpOnly: true,
    secure: useProductionSettings, // HTTPS required for production domain compatibility
    maxAge: sessionTtl,
    sameSite: useProductionSettings ? 'none' as const : 'lax' as const, // 'none' for cross-site compatibility
    domain: undefined, // Let browser handle domain automatically
  };
  
  console.log('[SESSION] Cookie config:', {
    isProduction,
    useProductionSettings,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    domain: cookieConfig.domain
  });
  
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    return session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: true, // Allow session creation for guest users
      cookie: cookieConfig,
    });
  } catch (error) {
    console.error("Session store error:", error);
    // Fallback to memory store in case of database issues
    return session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: true, // Allow session creation for guest users
      cookie: cookieConfig,
    });
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"], // Use the user ID from Replit claims
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      } catch (error) {
        console.error("Auth verification error:", error);
        verified(error);
      }
    };

    // Get configured domains and add production domain if not present
    const configuredDomains = process.env.REPLIT_DOMAINS?.split(",") || [];
    const productionDomain = "www.curiosities.market";
    
    // Add production domain if not in configured domains
    if (!configuredDomains.includes(productionDomain)) {
      configuredDomains.push(productionDomain);
    }
    
    for (const domain of configuredDomains) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      console.log(`[AUTH] Configured authentication strategy for domain: ${domain}`);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      const hostname = req.hostname;
      console.log("Login attempt for hostname:", hostname);
      console.log("Available strategies:", Object.keys((passport as any)._strategies || {}));
      
      // Find matching strategy - include localhost for development
      const strategyName = Object.keys((passport as any)._strategies || {}).find(key => 
        key.startsWith('replitauth:') && (
          key.includes(hostname) || 
          (hostname === '127.0.0.1' && key.includes('.replit.dev')) ||
          (hostname === 'localhost' && key.includes('.replit.dev'))
        )
      );
      
      if (!strategyName) {
        console.error("No matching auth strategy found for hostname:", hostname);
        return res.status(500).json({ error: "Authentication strategy not found" });
      }
      
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      const hostname = req.hostname;
      
      // Find matching strategy - include localhost for development
      const strategyName = Object.keys((passport as any)._strategies || {}).find(key => 
        key.startsWith('replitauth:') && (
          key.includes(hostname) || 
          (hostname === '127.0.0.1' && key.includes('.replit.dev')) ||
          (hostname === 'localhost' && key.includes('.replit.dev'))
        )
      );
      
      if (!strategyName) {
        console.error("No matching auth strategy found for callback:", hostname);
        return res.redirect("/api/login");
      }
      
      passport.authenticate(strategyName, (err: any, user: any, info: any) => {
        console.log('[AUTH] Passport callback triggered:', {
          hasError: !!err,
          hasUser: !!user,
          userKeys: user ? Object.keys(user) : [],
          strategyName
        });
        
        if (err) {
          console.error('[AUTH] Passport authentication error:', err);
          return res.redirect("/api/login");
        }
        if (!user) {
          console.error('[AUTH] No user returned from authentication');
          return res.redirect("/api/login");
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error('[AUTH] Login error:', err);
            return res.redirect("/api/login");
          }
          
          // Debug token generation
          console.log('[AUTH] User object after login:', {
            hasAccessToken: !!user.access_token,
            tokenLength: user.access_token?.length || 0,
            userKeys: Object.keys(user || {}),
            userId: user.id || user.claims?.sub
          });
          
          // For production, include access token in redirect for frontend storage
          const redirectUrl = new URL('/', `${req.protocol}://${req.get('host')}`);
          if (user.access_token) {
            redirectUrl.searchParams.set('access_token', user.access_token);
            redirectUrl.searchParams.set('auth_success', 'true');
            console.log('[AUTH] Redirecting with access token, length:', user.access_token.length);
          } else {
            console.log('[AUTH] WARNING: No access token found in user object');
          }
          
          res.redirect(redirectUrl.toString());
        });
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      console.log('[LOGOUT] Logout requested');
      req.logout(() => {
        // Clear session
        req.session.destroy((err) => {
          if (err) {
            console.error('[LOGOUT] Session destroy error:', err);
          }
          // Clear cookies
          res.clearCookie('connect.sid');
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}/logout-complete?clear_tokens=true`,
            }).href
          );
        });
      });
    });
  } catch (error) {
    console.error("Auth setup error:", error);
    
    // Provide fallback auth routes that explain the issue
    app.get("/api/login", (req, res) => {
      res.status(500).json({ 
        error: "Authentication not available", 
        message: "Please check your Replit authentication configuration" 
      });
    });
    
    app.get("/api/callback", (req, res) => {
      res.redirect("/signin?error=auth_config");
    });
    
    app.get("/api/logout", (req, res) => {
      console.log('[LOGOUT] Fallback logout - clearing session');
      req.session.destroy((err) => {
        if (err) {
          console.error('[LOGOUT] Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect("/");
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  const hostname = req.get('host') || '';
  const origin = req.headers.origin || '';

  console.log('====== AUTHENTICATION DEBUG ======');
  console.log('Auth check - hostname:', hostname);
  console.log('Auth check - origin:', origin);
  console.log('Auth check - isAuthenticated():', req.isAuthenticated());
  console.log('Auth check - user:', user ? 'exists' : 'null');
  console.log('Auth check - user.expires_at:', user?.expires_at);
  console.log('Auth check - Authorization header:', req.headers.authorization);
  console.log('Auth check - NODE_ENV:', process.env.NODE_ENV);
  console.log('Auth check - cookies:', Object.keys(req.cookies || {}));
  console.log('Auth check - session ID:', req.sessionID);
  console.log('===================================');

  // Check if this is a logout request - don't bypass auth for logout
  if (req.path === '/api/logout' || req.path === '/api/auth/logout') {
    console.log('[AUTH] Logout request detected - skipping auth bypass');
    return next();
  }

  // Allow normal Replit authentication to work


  // Try Authorization header first (for incognito/cookieless requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('Found Bearer token, attempting validation...');
    
    // For development/testing, accept any token that looks valid
    // In production, you'd want proper token validation
    if (token && token.length > 10) {
      try {
        // Simple token validation - make a request to Replit userinfo endpoint
        const response = await fetch('https://replit.com/api/userinfo', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userinfo = await response.json();
          
          // Create a user object with the required data
          req.user = {
            claims: userinfo,
            access_token: token,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
          };
          
          console.log('Auth success via Bearer token for user:', userinfo.sub || userinfo.id);
          return next();
        }
      } catch (error) {
        console.log('Bearer token validation failed:', error);
      }
    }
  }

  // Fall back to session-based auth
  if (!req.isAuthenticated()) {
    console.log('[AUTH] ❌ Session authentication failed or no session function');
    console.log(`[AUTH] Session exists but not authenticated - sessionID: ${req.sessionID}`);
    console.log(`[AUTH] Session keys: [`, Object.keys(req.session || {}), `]`);
    console.log(`[AUTH] Full session data:`, JSON.stringify(req.session, null, 2));
    
    // PRODUCTION FIX: Check if user has a valid session even if req.isAuthenticated() fails
    // This handles cross-domain authentication issues in production
    const session = req.session as any;
    if (session?.passport?.user || session?.user) {
      const sessionUser = session.passport?.user || session.user;
      console.log(`[AUTH] ✅ Found valid session user data despite isAuthenticated() failure`);
      
      // Create a minimal user object for the request
      req.user = {
        claims: {
          sub: sessionUser.sub || sessionUser.id || sessionUser.claims?.sub,
          email: sessionUser.email || sessionUser.claims?.email,
        } as any,
        access_token: sessionUser.access_token,
        expires_at: sessionUser.expires_at || (Math.floor(Date.now() / 1000) + 3600)
      };
      
      console.log(`[AUTH] ✅ Production auth bypass successful for user: ${req.user.claims.sub}`);
      return next();
    }
    
    console.log(`[AUTH] ❌ Authentication required - no valid token or session`);
    return res.status(401).json({ message: "Authentication required" });
  }

  // Handle cases where user is authenticated but missing expires_at (production fix)
  if (!user?.expires_at) {
    console.log('Auth success - user authenticated but missing expires_at, setting default');
    // Set a default expires_at for existing authenticated sessions
    user.expires_at = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
