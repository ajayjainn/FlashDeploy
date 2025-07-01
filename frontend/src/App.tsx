import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import NewProject from "@/pages/NewProject";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "@/pages/NotFound";
import AuthCallback from "@/pages/AuthCallback";
import Header from "@/components/Header";
import Login from "./pages/Login";
const queryClient = new QueryClient();

// Wrapper component for dashboard pages
const DashboardContainer = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="deploy-flow-theme">
      <Router>
        <AuthProvider>
          <Toaster />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard Routes */}
            <Route element={<DashboardContainer />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/new" element={<NewProject />} />
              <Route path="/dashboard/project/:slug" element={<ProjectDetail />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
