# Firebase Authentication Setup - PartySpace

## Overview

This project now has a complete Firebase Authentication system integrated. Users can sign up, sign in, and manage their accounts with Firebase.

## What's Been Implemented

### 1. Firebase Configuration
- **File**: `lib/firebase.ts`
- Firebase app, Authentication, Firestore, and Analytics initialized
- Offline persistence enabled for authentication
- Secure configuration with your Firebase project credentials

### 2. Authentication Context
- **File**: `lib/auth-context.tsx`
- React Context API for global auth state management
- Hooks: `useAuth()` for accessing auth state
- Methods:
  - `signUp(email, password, name)` - Create new user account
  - `signIn(email, password)` - Sign in existing user
  - `logout()` - Sign out user
- State:
  - `user` - Current user object
  - `userProfile` - Extended user profile from Firestore
  - `loading` - Loading state
  - `isAdmin` - Admin flag from user profile

### 3. Sign In & Sign Up Components
- **Files**: 
  - `components/sign-in.tsx`
  - `components/sign-up.tsx`
- Pre-built UI components ready to use
- Email/password validation
- Error handling with user-friendly messages
- Password visibility toggle
- Links to switch between sign in and sign up

### 4. Protected Routes
- **File**: `components/protected-route.tsx`
- Wrapper component to protect pages that require authentication
- Optional admin role checking
- Automatic redirects for unauthorized access

### 5. Utility Functions
- **File**: `lib/firebase-utils.ts`
- Password reset functionality
- Email/password change methods
- Email and password validation helpers

### 6. User Profile Storage
- Firestore collection: `users` with document structure:
  ```json
  {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "User Name",
    "isAdmin": false,
    "photoURL": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

## Setup Instructions

### 1. Install Dependencies
Dependencies have already been installed. If needed, run:
```bash
pnpm install
```

### 2. Environment Variables
Create a `.env.local` file (copy from `.env.example`):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCyt9eDjuttp1LmsCyI0K5-WX310AHaheo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=partyspace-d135f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=partyspace-d135f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=partyspace-d135f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=834325903410
NEXT_PUBLIC_FIREBASE_APP_ID=1:834325903410:web:363e51362e43ade5e4242b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5EZJLQNFCR
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `partyspace-d135f`
3. Enable these services:
   - **Authentication**: Email/Password provider (should be enabled)
   - **Firestore Database**: Create database in production mode
   - **Analytics**: Already configured

### 4. Firestore Security Rules
Add these rules to your Firestore (Security Rules tab):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Public collections (adjust as needed)
    match /venues/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Usage Examples

### Using Authentication in Components

```typescript
"use client"

import { useAuth } from "@/lib/auth-context"

export function MyComponent() {
  const { user, userProfile, logout } = useAuth()

  if (!user) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {userProfile?.displayName}!</p>
      <button onClick={() => logout()}>Sign Out</button>
    </div>
  )
}
```

### Protecting Routes

```typescript
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div>Admin Content</div>
    </ProtectedRoute>
  )
}
```

### Using Sign In Modal

```typescript
"use client"

import { useState } from "react"
import { SignIn } from "@/components/sign-in"
import { SignUp } from "@/components/sign-up"

export function AuthModal() {
  const [view, setView] = useState<"signin" | "signup">("signin")

  return (
    <div className="modal">
      {view === "signin" ? (
        <SignIn
          onClose={() => console.log("Close modal")}
          onSignUp={() => setView("signup")}
        />
      ) : (
        <SignUp
          onClose={() => console.log("Close modal")}
          onSignIn={() => setView("signin")}
        />
      )}
    </div>
  )
}
```

## API Reference

### useAuth Hook

```typescript
interface AuthContextType {
  user: User | null              // Current user (uid, email, displayName)
  userProfile: UserProfile | null // Extended profile from Firestore
  loading: boolean                // Auth initialization state
  isAdmin: boolean                // Whether user is admin
  
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}
```

### Utility Functions

```typescript
// Firebase Utils
import { 
  sendPasswordReset,
  changeEmail,
  changePassword,
  isValidEmail,
  validatePassword
} from "@/lib/firebase-utils"

// Example usage
try {
  await sendPasswordReset("user@example.com")
  console.log("Password reset email sent")
} catch (error) {
  console.error(error.message)
}
```

## Security Best Practices

1. **Never log sensitive data**: Don't log passwords or auth tokens
2. **Use HTTPS only**: Always use HTTPS in production
3. **Validate on both ends**: Validate user input on client and server
4. **Limit auth attempts**: Implement rate limiting for sign in attempts
5. **Keep credentials safe**: Store Firebase config in environment variables (they're already public keys)
6. **Firestore rules**: Use proper security rules to protect user data

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve 'firebase/auth'"
**Solution**: Run `pnpm install` to install Firebase dependencies

### Issue: "auth/configuration-not-found"
**Solution**: Make sure Firebase initialization happens on client side and your config is correct

### Issue: "auth/invalid-api-key"
**Solution**: Check that NEXT_PUBLIC_FIREBASE_API_KEY matches your Firebase project

### Issue: Users not persisting after refresh
**Solution**: Check browser localStorage is enabled, auth persistence is set in `firebase.ts`

## Testing

You can test the authentication system:

1. **Sign Up**:
   - Go to the Sign Up page
   - Fill in name, email, password
   - Click "Create Account"
   - Check Firebase Console > Authentication to see new user

2. **Sign In**:
   - Use the email and password you just created
   - Should redirect after successful login

3. **Protected Routes**:
   - Create a protected page with `<ProtectedRoute>`
   - Try accessing without logging in (should redirect)
   - Try accessing while logged in (should work)

## Next Steps

1. Create additional forms (forgot password, profile settings)
2. Add Google/GitHub authentication providers
3. Implement email verification
4. Set up analytics tracking
5. Add user profile page with edit functionality
6. Implement role-based access control (RBAC)

## Files Reference

- `lib/firebase.ts` - Firebase initialization
- `lib/auth-context.tsx` - Auth state management
- `lib/firebase-utils.ts` - Utility functions
- `components/sign-in.tsx` - Sign in form
- `components/sign-up.tsx` - Sign up form
- `components/protected-route.tsx` - Route protection
- `.env.example` - Environment variables template

## Support

For issues or questions:
1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Check console errors in browser DevTools
4. Verify Firebase Console settings
