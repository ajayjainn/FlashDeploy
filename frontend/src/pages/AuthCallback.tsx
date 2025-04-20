import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      
      if (error) {
        setError(error);
        toast({
          title: "Authentication Error",
          description: error,
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }
      
      if (token) {
        // Store the token in localStorage for persistence
        localStorage.setItem('auth_token', token);
        
        try {
          // Check authentication status with new token
          await checkAuth();
          
          // Get the redirect path from state if available
          const state = location.state as { from?: { pathname: string } };
          const from = state?.from?.pathname || '/dashboard';
          
          // Redirect to the intended location or dashboard
          navigate(from, { replace: true });
        } catch (err) {
          console.error("Authentication verification failed:", err);
          setError("Failed to verify your authentication. Please try again.");
          toast({
            title: "Authentication Failed",
            description: "We couldn't verify your authentication. Please try again.",
            variant: "destructive",
          });
          setTimeout(() => navigate('/'), 3000);
        }
      } else {
        // If no token, redirect to home
        setError("No authentication token received");
        toast({
          title: "Authentication Failed",
          description: "No authentication token received",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, checkAuth, navigate, location, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Error</h1>
            <p className="mb-4">{error}</p>
            <p>Redirecting you to the home page...</p>
          </>
        ) : (
          <>
            <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Authentication in progress...</h1>
            <p>Please wait while we complete your sign in.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 