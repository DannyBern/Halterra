/**
 * @fileoverview Halterra Premium Authentication - Main Export
 * @description Centralized authentication exports for elegant imports
 * @version 1.0.0
 * @premium ✨
 */

// 🌟 Premium authentication provider
export { HalterraAuthProvider, useHalterraAuth } from './clerkProvider';

// 🎭 Premium auth context and types
export type { HalterraAuthState, MockUser } from './authContext';

/**
 * Usage examples:
 *
 * @example
 * // In any component
 * import { useHalterraAuth } from '@/services/auth';
 *
 * function MyComponent() {
 *   const { user, isSignedIn } = useHalterraAuth();
 *
 *   if (!isSignedIn) {
 *     return <div>Please sign in</div>;
 *   }
 *
 *   return <div>Welcome, {user.firstName}!</div>;
 * }
 */
