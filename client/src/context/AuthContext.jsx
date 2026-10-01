import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try { await api.post('/auth/sync'); } catch (error) { console.warn('Profile synchronization failed:', error.message); }
      }
      setLoading(false);
    });
  }, []);

  function ensureConfigured() { if (!auth) throw new Error('Firebase is not configured. Add the values in client/.env first.'); }
  const value = useMemo(() => ({
    user, loading, firebaseConfigured,
    async register({ name, email, password }) { ensureConfigured(); const credential = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(credential.user, { displayName: name }); await api.post('/auth/sync'); return credential.user; },
    async login({ email, password }) { ensureConfigured(); const credential = await signInWithEmailAndPassword(auth, email, password); await api.post('/auth/sync'); return credential.user; },
    async loginWithGoogle() { ensureConfigured(); const credential = await signInWithPopup(auth, new GoogleAuthProvider()); await api.post('/auth/sync'); return credential.user; },
    async resetPassword(email) { ensureConfigured(); return sendPasswordResetEmail(auth, email); },
    logout: () => auth ? signOut(auth) : Promise.resolve(),
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
