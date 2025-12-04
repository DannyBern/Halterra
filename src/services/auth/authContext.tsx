/**
 * @fileoverview Premium Authentication Context for Halterra
 * @description Ultra-sophisticated auth context with elegant fallback system
 * @version 1.0.0
 * @premium ✨
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UserResource } from '@clerk/types';

/**
 * Premium authentication state interface
 * Provides comprehensive user authentication data
 */
export interface HalterraAuthState {
  /** Current authenticated user (Clerk) or mock user */
  user: UserResource | MockUser | null;
  /** Loading state for authentication checks */
  isLoaded: boolean;
  /** Signed in status */
  isSignedIn: boolean;
  /** Get current session token (JWT) */
  getToken: () => Promise<string | null>;
}

/**
 * Mock user interface for development mode
 * Mirrors essential Clerk user properties
 */
export interface MockUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
  fullName: string | null;
}

/**
 * Premium Auth Context
 * Central authentication state management
 */
export const HalterraAuthContext = createContext<HalterraAuthState | undefined>(
  undefined
);

/**
 * Premium hook to access authentication state
 * @throws {Error} If used outside of HalterraAuthProvider
 * @returns {HalterraAuthState} Current authentication state
 *
 * @example
 * ```tsx
 * const { user, isSignedIn } = useHalterraAuth();
 * if (isSignedIn) {
 *   console.log(`Welcome, ${user.firstName}!`);
 * }
 * ```
 */
export function useHalterraAuth(): HalterraAuthState {
  const context = useContext(HalterraAuthContext);

  if (context === undefined) {
    throw new Error(
      'useHalterraAuth must be used within HalterraAuthProvider. ' +
      'Please wrap your app with <HalterraAuthProvider>.'
    );
  }

  return context;
}

/**
 * Mock Authentication Provider
 * Premium fallback for development mode (when AUTH_ENABLED=false)
 * Provides seamless development experience without real authentication
 */
export function MockAuthProvider({ children }: { children: ReactNode }) {
  // Premium mock user for elegant development experience
  const mockUser: MockUser = {
    id: 'dev_user_mock_premium',
    firstName: 'Developer',
    lastName: 'Halterra',
    primaryEmailAddress: { emailAddress: 'dev@halterra.app' },
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HalterraDev',
    fullName: 'Developer Halterra',
  };

  const mockAuthState: HalterraAuthState = {
    user: mockUser as any, // Type assertion for mock compatibility
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => 'mock_jwt_token_dev_mode',
  };

  return (
    <HalterraAuthContext.Provider value={mockAuthState}>
      {children}
    </HalterraAuthContext.Provider>
  );
}
