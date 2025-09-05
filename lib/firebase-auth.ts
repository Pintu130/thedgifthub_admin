// import {
//   getAuth,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
//   onAuthStateChanged,
//   type User,
//   type UserCredential
// } from "firebase/auth";
// import { app } from "./firebase";

// const auth = getAuth(app);

// export const signIn = async (email: string, password: string): Promise<UserCredential> => {
//   return await signInWithEmailAndPassword(auth, email, password);
// };

// export const signOut = async (): Promise<void> => {
//   await firebaseSignOut(auth);
// };

// export const getCurrentUser = (): User | null => {
//   return auth.currentUser;
// };

// export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
//   return onAuthStateChanged(auth, callback);
// };

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth"
import { app } from "./firebase"
import { setLocalStorage, removeLocalStorage } from "@/utils/storage"

const auth = getAuth(app)
const AUTH_USER_KEY = 'authUser'

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    // Store user data in localStorage
    if (userCredential.user) {
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName|| "Admin",
        creationTime: userCredential.user.metadata.creationTime,
        lastSignInTime: userCredential.user.metadata.lastSignInTime,
        stsTokenManager: {
          accessToken: (userCredential.user as any)?.accessToken,
          refreshToken: userCredential.user.refreshToken,
        },
      }
      setLocalStorage(AUTH_USER_KEY, userData)
    }
    return userCredential
  } catch (error) {
    // Clear auth data on error
    removeLocalStorage(AUTH_USER_KEY)
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } finally {
    // Always clear the stored user data on sign out
    removeLocalStorage(AUTH_USER_KEY)
  }
}

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

export const getStoredUser = (): any => {
  if (typeof window === 'undefined') return null
  const storedUser = localStorage.getItem(AUTH_USER_KEY)
  return storedUser ? JSON.parse(storedUser) : null
}

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    // Update stored user data when auth state changes
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
        stsTokenManager: {
          accessToken: (user as any)?.accessToken,
          refreshToken: user.refreshToken,
        },
      }
      setLocalStorage(AUTH_USER_KEY, userData)
    } else {
      removeLocalStorage(AUTH_USER_KEY)
    }
    callback(user)
  })
}
