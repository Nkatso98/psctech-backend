import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SuperadminUser } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  superadminUser: SuperadminUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [superadminUser, setSuperadminUser] = useState<SuperadminUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Fetch superadmin user data from Firestore
      if (result.user) {
        const userDoc = await getDoc(doc(db, 'superadmins', result.user.uid));
        if (userDoc.exists()) {
          setSuperadminUser(userDoc.data() as SuperadminUser);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function register(email: string, password: string, userData: any) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create superadmin user document in Firestore
      if (result.user) {
        const superadminData = {
          id: result.user.uid,
          email: result.user.email || '',
          fullName: userData.fullName,
          role: 'Superadmin' as const,
          permissions: ['all'],
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        
        await setDoc(doc(db, 'superadmins', result.user.uid), superadminData);
        setSuperadminUser(superadminData);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setSuperadminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch superadmin user data
        try {
          const userDoc = await getDoc(doc(db, 'superadmins', user.uid));
          if (userDoc.exists()) {
            setSuperadminUser(userDoc.data() as SuperadminUser);
          }
        } catch (error) {
          console.error('Error fetching superadmin user:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    superadminUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}





