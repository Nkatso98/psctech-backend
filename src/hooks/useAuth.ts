import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Simulate authentication check
    setTimeout(() => {
      setAuthState({
        user: {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'teacher'
        },
        isAuthenticated: true,
        isLoading: false
      });
    }, 1000);
  }, []);

  return authState;
}










