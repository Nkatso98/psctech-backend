import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Institution, AuthContextType } from './types';
import { userStore, getCurrentInstitution, setCurrentInstitution, institutionStore, initializeDemoData } from './store';

// Helper function to get data from localStorage
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, initialize demo data and check for existing logged-in user
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    const currentUser = userStore.getCurrentUser();
    const currentInstitution = getCurrentInstitution();
    
    // Only set user if they were previously logged in (don't auto-login demo users)
    if (currentUser) {
      setUser(currentUser);
      setInstitution(currentInstitution);
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = userStore.getByUsername(username);
    
    if (foundUser && foundUser.passwordHash === password) {
      setUser(foundUser);
      userStore.setCurrentUser(foundUser);
      
      // Get and set institution
      const userInstitution = institutionStore.getById(foundUser.institutionId);
      if (userInstitution) {
        setInstitution(userInstitution);
        setCurrentInstitution(userInstitution);
      }
      
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setInstitution(null);
    userStore.setCurrentUser(null);
    setCurrentInstitution(null);
    
    // Clear all localStorage data to ensure complete logout
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentInstitution');
    localStorage.removeItem('users');
    localStorage.removeItem('institutions');
    
    // Force page reload to clear any cached state
    window.location.href = '/';
  };

  const value = {
    user,
    institution,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}