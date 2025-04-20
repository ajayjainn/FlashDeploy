import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProjects, deployProject, Project } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

// Key for projects query
export const projectsQueryKey = ["projects"];

/**
 * Hook to fetch and cache all user projects
 */
export function useProjects() {
  const { isAuthenticated, checkAuth, logout } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: async () => {
      try {
        const data = await getUserProjects();
        return data;
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          // Attempt to re-authenticate
          const success = await checkAuth();
          if (!success) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            setTimeout(() => logout(), 2000);
          } else {
            // Try fetching projects again if re-auth succeeded
            return await getUserProjects();
          }
        }
        toast({
          title: "Error",
          description: "Could not load your projects. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Hook to get a specific project by slug
 */
export function useProject(slug: string | undefined) {
  const projectsQuery = useProjects();

  const project = slug && projectsQuery.data 
    ? projectsQuery.data.find(p => p.slug === slug) 
    : null;

  return {
    project,
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    refetch: projectsQuery.refetch
  };
}

/**
 * Hook to deploy a new project
 */
export function useDeployProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ owner, repo, slug }: { owner: string; repo: string; slug: string }) => {
      return await deployProject(owner, repo, slug);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your project deployment has started.",
      });
      
      // Invalidate projects query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// TO be implemented
/**
 * Hook to redeploy a project
 */
export function useRedeployProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // await redeployProject(projectId);
      return new Promise<void>(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Redeploying",
        description: "Your project is being redeployed.",
      });
      
      // Invalidate projects query after a short delay to refresh status
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: projectsQueryKey });
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Redeployment failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // await deleteProject(projectId);
      return new Promise<void>(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted.",
      });
      
      // Invalidate projects query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  });
} 