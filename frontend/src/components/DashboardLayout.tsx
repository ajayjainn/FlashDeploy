import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useProjects } from "@/hooks/use-project-queries";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PlusCircle, Home, Package, GitBranch, Loader, LogOut, RefreshCw, Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

// A floating trigger component that only shows when sidebar is minimized
function FloatingSidebarTrigger() {
  const { state } = useSidebar();
  
  if (state === "expanded") {
    return null;
  }
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed left-4 top-20 z-50 rounded-full shadow-md"
    >
      <SidebarTrigger>
        <Menu size={18} />
      </SidebarTrigger>
    </Button>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: projects = [], isLoading, error, refetch } = useProjects();

  const handleRefresh = () => {
    refetch();
  };

  const handleNewProject = () => {
    navigate("/dashboard/new");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GitBranch size={18} />
                </div>
                <span className="font-semibold">Deploy Flow</span>
              </Link>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link to="/dashboard">
                      <SidebarMenuButton
                        isActive={location.pathname === "/dashboard"}
                        tooltip="Dashboard"
                      >
                        <Home size={18} />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <div className="flex items-center justify-between mb-2">
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <div className="flex gap-1">
                  {error && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleRefresh}
                      title="Refresh projects"
                    >
                      <RefreshCw size={14} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleNewProject}
                  >
                    <PlusCircle size={14} />
                    <span>New</span>
                  </Button>
                </div>
              </div>
              <SidebarGroupContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader size={16} className="animate-spin text-muted-foreground" />
                  </div>
                ) : error ? (
                  <div className="px-3 py-2 text-sm text-destructive">
                    Could not load your projects. Please try again.
                  </div>
                ) : projects.length > 0 ? (
                  <SidebarMenu>
                    {projects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <Link to={`/dashboard/project/${project.slug}`}>
                          <SidebarMenuButton
                            isActive={location.pathname === `/dashboard/project/${project.slug}`}
                            tooltip={project.name}
                          >
                            <Package size={18} />
                            <span>{project.name}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No projects yet. Create your first project.
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <img
                  src={user?.avatar || `https://github.com/${user?.username}.png`}
                  alt={user?.displayName}
                  className="h-8 w-8 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-medium truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8"
                  title="Logout"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-hidden bg-background w-full">
          {/* Floating trigger that only appears when sidebar is minimized */}
          <FloatingSidebarTrigger />
          <main className="h-full w-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
} 