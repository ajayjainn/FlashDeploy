import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  githubId: string;
  displayName: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
      
      // Prepare headers with authorization
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Make the authentication status request
      const response = await fetch(API_ENDPOINTS.AUTH_STATUS, {
        headers,
        credentials: 'include' // Include cookies as well
      });
      
      if (!response.ok) {
        throw new Error('Authentication check failed');
      }
      
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Clear token if authentication failed
        localStorage.removeItem('auth_token');
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Redirect to GitHub OAuth flow
    window.location.href = API_ENDPOINTS.AUTH_GITHUB;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const headers: HeadersInit = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
          method: 'POST',
          headers,
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear the token from localStorage
      localStorage.removeItem('auth_token');
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate('/');
    }
  };

  useEffect(() => {
    const initialAuthCheck = async () => {
      await checkAuth();
    };
    
    initialAuthCheck();
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    checkAuth,
    logout,
    login
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
