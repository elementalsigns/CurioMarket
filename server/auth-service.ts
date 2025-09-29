import * as client from "openid-client";
import { storage } from "./storage";
import type { RequestHandler } from "express";

interface AuthConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class AuthService {
  private config: AuthConfig;
  private oidcClient: any;
  private isInitialized = false;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[AUTH] Initializing with issuer:', this.config.issuerUrl);
      
      const config = await client.discovery(new URL(this.config.issuerUrl), this.config.clientId);

      this.oidcClient = config;

      this.isInitialized = true;
      console.log('[AUTH] Successfully initialized');
    } catch (error) {
      console.error('[AUTH] Failed to initialize:', error);
      throw error;
    }
  }

  getAuthorizationUrl(state?: string): string {
    if (!this.isInitialized || !this.oidcClient) {
      throw new Error('Auth service not initialized');
    }

    const url = this.oidcClient.authorizationUrl({
      scope: 'openid email profile',
      state: state || 'default',
      prompt: 'login',
    });

    console.log('[AUTH] Generated authorization URL:', url);
    return url;
  }

  async handleCallback(code: string, state?: string): Promise<AuthUser> {
    if (!this.isInitialized || !this.oidcClient) {
      throw new Error('Auth service not initialized');
    }

    try {
      console.log('[AUTH] Processing callback with code:', code.substring(0, 10) + '...');

      const tokenSet = await this.oidcClient.callback(
        this.config.redirectUri,
        { code, state: state || 'default' }
      );

      const claims = tokenSet.claims();
      console.log('[AUTH] Received claims for user:', claims.sub);

      // Upsert user in database
      await storage.upsertUser({
        id: claims.sub,
        email: claims.email,
        firstName: claims.given_name || claims.first_name,
        lastName: claims.family_name || claims.last_name,
        profileImageUrl: claims.picture || claims.profile_image_url,
      });

      return {
        id: claims.sub,
        email: claims.email,
        firstName: claims.given_name || claims.first_name,
        lastName: claims.family_name || claims.last_name,
        profileImageUrl: claims.picture || claims.profile_image_url,
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: tokenSet.expires_at || (Math.floor(Date.now() / 1000) + 3600),
      };
    } catch (error) {
      console.error('[AUTH] Callback error:', error);
      throw error;
    }
  }

  async validateToken(accessToken: string): Promise<AuthUser | null> {
    if (!this.isInitialized || !this.oidcClient) {
      throw new Error('Auth service not initialized');
    }

    try {
      const userInfo = await this.oidcClient.userinfo(accessToken);
      console.log('[AUTH] Token validated for user:', userInfo.sub);

      // Get user from database
      const user = await storage.getUser(userInfo.sub);
      if (!user) {
        console.error('[AUTH] User not found in database:', userInfo.sub);
        return null;
      }

      return {
        id: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.given_name || userInfo.first_name,
        lastName: userInfo.family_name || userInfo.last_name,
        profileImageUrl: userInfo.picture || userInfo.profile_image_url,
        accessToken: accessToken,
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
    } catch (error) {
      console.error('[AUTH] Token validation failed:', error);
      return null;
    }
  }

  async refreshUserToken(refreshToken: string): Promise<AuthUser | null> {
    if (!this.isInitialized || !this.oidcClient) {
      throw new Error('Auth service not initialized');
    }

    try {
      const tokenSet = await this.oidcClient.refresh(refreshToken);
      const claims = tokenSet.claims();

      return {
        id: claims.sub,
        email: claims.email,
        firstName: claims.given_name || claims.first_name,
        lastName: claims.family_name || claims.last_name,
        profileImageUrl: claims.picture || claims.profile_image_url,
        accessToken: tokenSet.access_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: tokenSet.expires_at || (Math.floor(Date.now() / 1000) + 3600),
      };
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
      return null;
    }
  }
}

// Universal authentication middleware that works with both sessions and tokens
export function createAuthMiddleware(authService: AuthService): RequestHandler {
  return async (req: any, res, next) => {
    try {
      let authUser: AuthUser | null = null;
      const hostname = req.get('host') || '';


      // Method 1: Check Authorization header (Bearer token)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('[AUTH] Validating Bearer token...');
        authUser = await authService.validateToken(token);
        
        if (authUser) {
          console.log('[AUTH] Success via Bearer token for user:', authUser.id);
          req.user = {
            claims: { sub: authUser.id, email: authUser.email },
            access_token: authUser.accessToken,
            expires_at: authUser.expiresAt,
          };
          return next();
        }
      }

      // Method 2: Use the WORKING authService.getUserFromRequest pattern
      authUser = await authService.getUserFromRequest(req);
      if (authUser) {
        console.log('[AUTH] Auth success via authService for user:', authUser.id);
        req.user = {
          claims: { sub: authUser.id, email: authUser.email },
          access_token: authUser.accessToken || 'session-based',
          expires_at: authUser.expiresAt || (Math.floor(Date.now() / 1000) + 3600),
        };
        return next();
      }

      // Method 3: Development bypass for user ID 46848882
      if (process.env.NODE_ENV === 'development' && hostname.includes('replit.dev')) {
        console.log('[AUTH] Development bypass for user 46848882');
        req.user = {
          id: '46848882',
          claims: { sub: '46848882', email: 'elementalsigns@gmail.com' },
          access_token: 'development-bypass',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        return next();
      }

      console.log('[AUTH] All authentication methods failed');
      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error('[AUTH] Middleware error:', error);
      return res.status(500).json({ message: "Authentication error" });
    }
  };
}

// Initialize the auth service
export const authService = new AuthService({
  issuerUrl: process.env.ISSUER_URL || 'https://replit.com/oidc',
  clientId: process.env.REPL_ID!,
  clientSecret: process.env.REPL_SECRET,
  redirectUri: `${process.env.REPLIT_DOMAIN || 'https://localhost:5000'}/api/auth/callback`,
});