# 🌟 Halterra Premium Authentication System

## Overview

Ultra-sophisticated authentication system with feature flag support for seamless development and production deployment.

## Architecture

```
┌─────────────────────────────────────────┐
│   HalterraAuthProvider (Root Wrapper)   │
│   ├── Feature Flag Check                │
│   ├── Mock Auth (DEV)                   │
│   └── Clerk Auth (PROD)                 │
└─────────────────────────────────────────┘
           │
           ├─> HalterraAuthContext
           │   └─> useHalterraAuth() hook
           │
           └─> Your App Components
```

## Feature Flag System

### Development Mode (`VITE_AUTH_ENABLED=false`)
- ✅ **Zero friction development**
- ✅ **Mock user**: `dev@halterra.app`
- ✅ **All auth flows work identically**
- ✅ **No Clerk account needed**
- ✅ **Instant startup**

### Production Mode (`VITE_AUTH_ENABLED=true`)
- 🔐 **Real Clerk authentication**
- 🌐 **Google OAuth + Apple Sign-In**
- 🔒 **Secure JWT tokens**
- ☁️ **Cloud-synced user data**

## Quick Start

### 1. Using Auth in Components

```tsx
import { useHalterraAuth } from '@/services/auth';

function MyComponent() {
  const { user, isSignedIn, isLoaded } = useHalterraAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      <img src={user.imageUrl} alt="Profile" />
    </div>
  );
}
```

### 2. Backend API Protection

```javascript
// api/my-endpoint.js
import { withAuth } from '../lib/auth.js';

export default withAuth(async function handler(req, res, auth) {
  // auth is automatically verified and injected
  const userId = auth.userId;

  // Your secure API logic here
  return res.json({ message: `Hello user ${userId}!` });
});
```

### 3. Manual Auth Verification

```javascript
// api/custom-endpoint.js
import { verifyAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  const auth = await verifyAuth(req);

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Your logic here
}
```

## Configuration

### Environment Variables

```bash
# .env.local (Development)
VITE_AUTH_ENABLED=false

# .env.production (Production)
VITE_AUTH_ENABLED=true
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
```

### Clerk Setup (Production Only)

1. **Create Clerk Account**
   - Visit: https://clerk.com
   - Create new application: "Halterra"

2. **Enable OAuth Providers**
   - Dashboard → Social Connections
   - Enable: Google, Apple

3. **Copy Publishable Key**
   - Dashboard → API Keys
   - Copy: "Publishable key"
   - Add to `.env.local`:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
     ```

4. **Enable Auth**
   ```bash
   # In .env.local
   VITE_AUTH_ENABLED=true
   ```

5. **Restart Dev Server**
   ```bash
   npm run dev
   ```

## Premium Theme Customization

The authentication UI uses Halterra's premium design system:

```tsx
// clerkProvider.tsx
const halterraPremiumTheme = {
  variables: {
    colorPrimary: '#6366f1',      // Premium indigo
    borderRadius: '12px',          // Elegant rounded corners
    fontFamily: 'Inter, system-ui',
  },
  elements: {
    card: {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(20px)', // Glass morphism
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      // Premium gradient button
    },
  },
};
```

## Security Features

### JWT Token Management
- ✅ **Automatic token refresh**
- ✅ **Secure httpOnly cookies**
- ✅ **60s clock skew tolerance**
- ✅ **Comprehensive error handling**

### Rate Limiting (Future)
- Per-user limits (not IP-based)
- Stored in Vercel KV
- Distributed across edge locations

### Data Encryption
- JWT tokens signed by Clerk
- HTTPS-only cookies
- No sensitive data in client storage

## API Reference

### `useHalterraAuth()`
Hook to access authentication state.

**Returns:**
```typescript
{
  user: UserResource | MockUser | null,
  isLoaded: boolean,
  isSignedIn: boolean,
  getToken: () => Promise<string | null>
}
```

### `verifyAuth(req)`
Backend middleware to verify JWT tokens.

**Parameters:**
- `req` - HTTP request object

**Returns:**
```typescript
{
  userId: string,
  sessionId: string,
  metadata: {
    email: string,
    emailVerified: boolean,
    createdAt: number,
    expiresAt: number
  }
} | null
```

### `withAuth(handler)`
Higher-order function to wrap API handlers with auth.

**Parameters:**
- `handler(req, res, auth)` - Your API handler

**Returns:**
- Wrapped handler with automatic auth verification

## Troubleshooting

### "Missing Authorization header"
- Ensure frontend is sending token:
  ```tsx
  const { getToken } = useHalterraAuth();
  const token = await getToken();
  headers: { 'Authorization': `Bearer ${token}` }
  ```

### "Invalid token claims"
- Token may be expired - Clerk handles refresh automatically
- Check Clerk dashboard for JWT configuration

### "Missing VITE_CLERK_PUBLISHABLE_KEY"
- Add key to `.env.local`
- Restart dev server
- Ensure `VITE_AUTH_ENABLED=true`

## Development Workflow

1. **Start with Mock Auth**
   ```bash
   # .env.local
   VITE_AUTH_ENABLED=false
   ```
   - Develop core features without auth setup
   - All auth flows work with mock user

2. **Switch to Real Auth When Ready**
   ```bash
   # .env.local
   VITE_AUTH_ENABLED=true
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   ```
   - Test real authentication flows
   - Verify OAuth providers work

3. **Deploy to Production**
   - Vercel automatically uses production env vars
   - `VITE_AUTH_ENABLED=true` in Vercel dashboard
   - `VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx`

## Premium Features

- 🎨 **Ultra-sophisticated UI theme**
- 🌐 **French localization ready**
- 🔄 **Seamless mock/real auth switching**
- 📱 **Mobile-optimized auth modals**
- ⚡ **Zero-latency auth checks**
- 🛡️ **Enterprise-grade security**

## Support

Need help? Check:
- Clerk Documentation: https://clerk.com/docs
- Halterra Plan: `C:\Users\danny\.claude\plans\crispy-stargazing-axolotl.md`

---

**Built with ❤️ for Halterra Premium**
