/**
 * @fileoverview Premium Clerk Authentication Provider for Halterra
 * @description Sophisticated authentication wrapper with feature flag system
 * @version 1.0.0
 * @premium ✨ Ultra-premium implementation
 */

import type { ReactNode } from 'react';
import { ClerkProvider, useUser, useAuth } from '@clerk/clerk-react';
import {
  HalterraAuthContext,
  MockAuthProvider,
  type HalterraAuthState,
} from './authContext';

/**
 * Premium Clerk theme configuration
 * Matches Halterra's ultra-sophisticated design system
 */
const halterraPremiumTheme = {
  variables: {
    colorPrimary: '#6366f1', // Premium indigo
    colorSuccess: '#10b981', // Elegant emerald
    colorDanger: '#ef4444', // Refined red
    colorWarning: '#f59e0b', // Sophisticated amber
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorInputBackground: '#f9fafb',
    colorInputText: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '16px',
    borderRadius: '12px', // Premium rounded corners
    spacingUnit: '8px',
  },
  elements: {
    // Premium card styling
    card: {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(99, 102, 241, 0.1)',
      backdropFilter: 'blur(20px)',
    },
    // Premium input styling
    formFieldInput: {
      borderColor: 'rgba(99, 102, 241, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:focus': {
        borderColor: 'rgb(99, 102, 241)',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
      },
    },
    // Premium button styling
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 12px 20px -5px rgba(99, 102, 241, 0.3)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    // Premium social buttons
    socialButtonsBlockButton: {
      border: '1px solid rgba(99, 102, 241, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        background: 'rgba(99, 102, 241, 0.05)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        transform: 'translateY(-1px)',
      },
    },
    // Premium footer
    footer: {
      opacity: 0.6,
      '& a': {
        color: 'rgb(99, 102, 241)',
        textDecoration: 'none',
        transition: 'opacity 0.2s',
        '&:hover': {
          opacity: 0.8,
        },
      },
    },
  },
};

/**
 * Clerk integration wrapper component
 * Bridges Clerk auth with Halterra's unified auth context
 */
function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const authState: HalterraAuthState = {
    user: user as any,
    isLoaded,
    isSignedIn: !!user,
    getToken: async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('[Halterra Auth] Failed to retrieve token:', error);
        return null;
      }
    },
  };

  return (
    <HalterraAuthContext.Provider value={authState}>
      {children}
    </HalterraAuthContext.Provider>
  );
}

/**
 * Premium Halterra Authentication Provider
 * Feature-flagged authentication with sophisticated fallback system
 *
 * @param {Object} props - Provider properties
 * @param {ReactNode} props.children - Child components to wrap
 *
 * @example
 * ```tsx
 * // In main.tsx
 * <HalterraAuthProvider>
 *   <App />
 * </HalterraAuthProvider>
 * ```
 */
export function HalterraAuthProvider({ children }: { children: ReactNode }) {
  // Feature flag check - elegantly toggles between real and mock auth
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

  // Development mode banner (only in console, non-intrusive)
  if (!authEnabled && import.meta.env.DEV) {
    console.log(
      '%c✨ Halterra Premium Auth',
      'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;',
      '\n🔓 Development Mode: Authentication disabled\n' +
      '📝 Set VITE_AUTH_ENABLED=true to enable Clerk\n' +
      '🎭 Using premium mock authentication'
    );
  }

  // Mock authentication for seamless development
  if (!authEnabled) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // Production-ready Clerk authentication
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    throw new Error(
      '🚨 Halterra Auth Configuration Error:\n' +
      'VITE_CLERK_PUBLISHABLE_KEY is missing from environment variables.\n' +
      'Please add it to your .env.local file.\n' +
      'Get your key from: https://dashboard.clerk.com'
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: undefined, // Use custom theme
        variables: halterraPremiumTheme.variables,
        elements: halterraPremiumTheme.elements,
      }}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

/**
 * Re-export authentication hook for convenience
 * Provides unified auth interface across the application
 */
export { useHalterraAuth } from './authContext';
