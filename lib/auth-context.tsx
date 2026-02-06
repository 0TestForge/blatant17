"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface User {
  uid: string
  email: string | null
  displayName: string | null
}

interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  isAdmin: boolean
  photoURL: string | null
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Set up Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }
          setUser(userData)

          // Try to fetch user profile from Firestore (optional)
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) {
              const profileData = userDocSnap.data() as UserProfile
              setUserProfile(profileData)
              setIsAdmin(profileData.isAdmin || false)
            } else {
              // Try to create default profile if doesn't exist
              try {
                const defaultProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  isAdmin: false,
                  photoURL: firebaseUser.photoURL,
                  createdAt: new Date().toISOString(),
                }
                await setDoc(userDocRef, defaultProfile)
                setUserProfile(defaultProfile)
                setIsAdmin(false)
              } catch (writeError) {
                // Silently fail if we can't write profile - still allow auth to work
                console.warn("Could not create user profile in Firestore:", writeError)
                const defaultProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  isAdmin: false,
                  photoURL: firebaseUser.photoURL,
                }
                setUserProfile(defaultProfile)
                setIsAdmin(false)
              }
            }
          } catch (firestoreError) {
            // If Firestore is not available, create profile from auth data
            console.warn("Could not fetch user profile from Firestore, using auth data:", firestoreError)
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              isAdmin: false,
              photoURL: firebaseUser.photoURL,
            }
            setUserProfile(defaultProfile)
            setIsAdmin(false)
          }
        } else {
          // User is signed out
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error in auth state listener:", error)
        // Still allow auth to work even if there's an error
        setLoading(false)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error("All fields are required")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update user profile with display name
      await updateProfile(firebaseUser, {
        displayName: name,
      })

      // Create user profile object
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        isAdmin: false,
        photoURL: null,
        createdAt: new Date().toISOString(),
      }

      // Try to save to Firestore (optional - won't block signup if it fails)
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), userProfile)
      } catch (firestoreError) {
        // Silently fail if we can't write to Firestore
        console.warn("Could not save user profile to Firestore, but signup completed:", firestoreError)
      }

      // Update state
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
      })
      setUserProfile(userProfile)
      setIsAdmin(false)
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account"

      // Provide more specific error messages
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address")
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password is too weak")
      }

      throw new Error(errorMessage)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update state with auth data
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      }
      setUser(userData)

      // Try to fetch user profile from Firestore (optional)
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile
          setUserProfile(profileData)
          setIsAdmin(profileData.isAdmin || false)
        } else {
          // If no profile exists, create one from auth data
          const defaultProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAdmin: false,
            photoURL: firebaseUser.photoURL,
          }
          setUserProfile(defaultProfile)
          setIsAdmin(false)
        }
      } catch (firestoreError) {
        // If Firestore read fails, still allow signin with auth data
        console.warn("Could not fetch user profile from Firestore:", firestoreError)
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          isAdmin: false,
          photoURL: firebaseUser.photoURL,
        }
        setUserProfile(defaultProfile)
        setIsAdmin(false)
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign in"

      // Provide more specific error messages
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email")
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address")
      } else if (error.code === "auth/user-disabled") {
        throw new Error("This account has been disabled")
      }

      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
    } catch (error) {
      console.error("Error logging out:", error)
      throw new Error("Failed to log out")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        logout,
        isAdmin,
        signIn,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
