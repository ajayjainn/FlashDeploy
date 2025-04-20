import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, checkAuth } = useAuth();

  return (
    <header className="bg-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-black text-black dark:text-white border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <span className="text-xl font-bold tracking-tight">Deploy Flow</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              {/* Dashboard Link */}
              <div className="text-black dark:text-white transition-colors">{user?.displayName}</div>
              <a 
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </a>


              {/* Logout Button */}
              <button 
                onClick={async() => {
                  await logout();
                  navigate('/');
                }} 
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Login Button */}
              <button 
                onClick={() => navigate('/login')} 
                className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}