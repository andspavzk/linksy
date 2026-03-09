import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<string | null>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AVATAR_COLORS = [
  'linear-gradient(135deg,#2b5bde,#7b5ea7)',
  'linear-gradient(135deg,#e53935,#f5a623)',
  'linear-gradient(135deg,#4fae4e,#00bcd4)',
  'linear-gradient(135deg,#f5c542,#f0855a)',
  'linear-gradient(135deg,#9c27b0,#5c6bc0)',
  'linear-gradient(135deg,#00bcd4,#4fae4e)',
]

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

function randomTag() {
  return '#' + String(Math.floor(Math.random() * 9999)).padStart(4, '0')
}

async function ensureProfile(user: User, username?: string): Promise<Profile> {
  const ref = doc(db, 'profiles', user.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data() as Profile
  }

  const profile: Profile = {
    uid: user.uid,
    username: username || user.displayName || user.email?.split('@')[0] || 'Kullanici',
    tag: randomTag(),
    avatarColor: randomColor(),
    status: 'online',
    activity: null,
    email: user.email || '',
    createdAt: Date.now(),
  }

  await setDoc(ref, profile)
  return profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await ensureProfile(firebaseUser)
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { status: 'online' })
        setProfile({ ...p, status: 'online' })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function refreshProfile() {
    if (!user) return
    const snap = await getDoc(doc(db, 'profiles', user.uid))
    if (snap.exists()) setProfile(snap.data() as Profile)
  }

  async function signUp(email: string, password: string, username: string): Promise<string | null> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await ensureProfile(cred.user, username.trim())
      return null
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') return 'Bu e-posta zaten kullaniliyor.'
      if (err.code === 'auth/weak-password') return 'Sifre en az 6 karakter olmali.'
      if (err.code === 'auth/invalid-email') return 'Gecersiz e-posta adresi.'
      return err.message
    }
  }

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return null
    } catch {
      return 'E-posta veya sifre hatali.'
    }
  }

  async function signInWithGoogleFn(): Promise<string | null> {
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await ensureProfile(cred.user)
      return null
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return null
      return err.message
    }
  }

  async function resetPasswordFn(email: string): Promise<string | null> {
    try {
      await sendPasswordResetEmail(auth, email)
      return null
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') return 'Bu e-posta ile kayitli hesap bulunamadi.'
      return err.message
    }
  }

  async function signOutFn() {
    if (user) {
      try {
        await updateDoc(doc(db, 'profiles', user.uid), { status: 'offline' })
      } catch {}
    }
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn,
      signInWithGoogle: signInWithGoogleFn,
      signOut: signOutFn,
      resetPassword: resetPasswordFn,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
