'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/config';
import { useVocabulary } from '@/hooks/use-vocabulary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from '../ui/button';
import { getAuth as getFirebaseAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { init, isInitialized, words } = useVocabulary();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      init(user);
      if(!user && words.length <= 4) { // Only show login for new users
        setShowLogin(true);
      } else {
        setShowLogin(false);
      }
    });

    return () => unsubscribe();
  }, [init, words.length]);
  
  const handleGoogleSignIn = async () => {
    const auth = getFirebaseAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowLogin(false);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
        {children}
        <Dialog open={showLogin} onOpenChange={setShowLogin}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Welcome to LexiLearn</DialogTitle>
                    <DialogDescription>
                        Sign in to sync your vocabulary across all your devices and keep your progress safe.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Button onClick={handleGoogleSignIn} className="w-full">
                        Sign In with Google
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
