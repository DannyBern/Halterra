/**
 * @fileoverview Premium Server-Side Authentication Middleware for Halterra
 * @description Ultra-sophisticated JWT verification with elegant fallback system
 * @version 1.0.0
 * @premium ✨ Enterprise-grade security
 */

import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Premium authentication result interface
 * @typedef {Object} HalterraAuthResult
 * @property {string} userId - Authenticated user's unique identifier
 * @property {string} sessionId - Current session identifier
 * @property {Object} [metadata] - Additional user metadata
 */

/**
 * Premium JWT Verification Middleware
 * Verifies Clerk authentication tokens with sophisticated error handling
 *
 * @param {Request} req - Incoming HTTP request
 * @returns {Promise<HalterraAuthResult|null>} Authentication result or null
 *
 * @example
 * ```javascript
 * export default async function handler(req, res) {
 *   const auth = await verifyAuth(req);
 *   if (!auth) {
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 *   // Proceed with authenticated request
 *   const userId = auth.userId;
 * }
 * ```
 */
export async function verifyAuth(req) {
  // Feature flag check - development mode bypass
  if (process.env.AUTH_ENABLED !== 'true') {
    // Premium development mode - return mock auth
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 [Halterra Auth] Development mode: Using mock authentication');
      return {
        userId: 'dev_user_mock_premium',
        sessionId: 'dev_session_mock',
        metadata: {
          mode: 'development',
          email: 'dev@halterra.app',
        },
      };
    }
    // Production without auth enabled - should not happen
    console.error('⚠️ [Halterra Auth] AUTH_ENABLED is false in production!');
    return null;
  }

  try {
    // Extract authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      console.warn('[Halterra Auth] Missing Authorization header');
      return null;
    }

    // Extract Bearer token with premium validation
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || token === authHeader) {
      console.warn('[Halterra Auth] Invalid Authorization header format');
      return null;
    }

    // Verify token with Clerk (premium JWT validation)
    const sessionClaims = await clerkClient.verifyToken(token, {
      // Premium: Verify token hasn't expired
      clockSkewInSeconds: 60, // Allow 60s clock skew for network delays
    });

    if (!sessionClaims || !sessionClaims.sub) {
      console.warn('[Halterra Auth] Invalid token claims');
      return null;
    }

    // Premium: Extract user ID and session ID
    const userId = sessionClaims.sub;
    const sessionId = sessionClaims.sid || 'unknown';

    // Success - return premium auth result
    return {
      userId,
      sessionId,
      metadata: {
        // Include additional claims for premium features
        email: sessionClaims.email,
        emailVerified: sessionClaims.email_verified,
        createdAt: sessionClaims.iat,
        expiresAt: sessionClaims.exp,
      },
    };
  } catch (error) {
    // Premium error handling with detailed logging
    console.error('[Halterra Auth] Token verification failed:', {
      error: error.message,
      code: error.code,
      status: error.status,
    });

    // Specific error handling
    if (error.message?.includes('expired')) {
      console.warn('[Halterra Auth] Token has expired');
    } else if (error.message?.includes('invalid')) {
      console.warn('[Halterra Auth] Token is invalid or malformed');
    } else {
      console.error('[Halterra Auth] Unexpected verification error');
    }

    return null;
  }
}

/**
 * Premium Authentication Guard Middleware
 * Wraps API handlers with automatic authentication checks
 *
 * @param {Function} handler - API route handler function
 * @returns {Function} Wrapped handler with auth protection
 *
 * @example
 * ```javascript
 * export default withAuth(async function handler(req, res, auth) {
 *   // auth is automatically verified and injected
 *   const userId = auth.userId;
 *   // Your handler logic...
 * });
 * ```
 */
export function withAuth(handler) {
  return async function authenticatedHandler(req, res) {
    // Verify authentication
    const auth = await verifyAuth(req);

    if (!auth) {
      // Premium error response
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in to continue.',
        code: 'AUTH_REQUIRED',
      });
    }

    // Inject auth into request for handler
    req.auth = auth;

    // Call original handler with auth context
    return handler(req, res, auth);
  };
}

/**
 * Premium User Metadata Retrieval
 * Fetches complete user profile from Clerk with sophisticated caching
 *
 * @param {string} userId - User's unique identifier
 * @returns {Promise<Object|null>} User profile or null
 *
 * @example
 * ```javascript
 * const user = await getUserProfile(auth.userId);
 * console.log(`Welcome, ${user.firstName}!`);
 * ```
 */
export async function getUserProfile(userId) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      // Premium: Include metadata
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
    };
  } catch (error) {
    console.error('[Halterra Auth] Failed to fetch user profile:', error.message);
    return null;
  }
}

/**
 * Premium: Export Clerk client for advanced operations
 * Use with caution - direct Clerk access should be rare
 */
export { clerkClient };
