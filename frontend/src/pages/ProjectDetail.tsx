import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Clock, Loader, RefreshCw, Trash2 } from "lucide-react";
import { useProject, useRedeployProject, useDeleteProject } from "@/hooks/use-project-queries";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Use React Query hooks
  const { project, isLoading } = useProject(slug);
  const redeployMutation = useRedeployProject();
  const deleteMutation = useDeleteProject();

  const handleRedeploy = async () => {
    if (!project) return;
    redeployMutation.mutate(project.id);
  };

  const handleDelete = async () => {
    if (!project) return;
    
    // This would typically show a confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
    
    if (confirmed) {
      deleteMutation.mutate(project.id);
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The project you are looking for does not exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={
            project.status === 'Deployed' ? 'default' : 
            project.status === 'Deploying' ? 'outline' : 
            'destructive'
          }>
            {project.status}
          </Badge>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleRedeploy}
            disabled={redeployMutation.isPending}
          >
            {redeployMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Redeploying...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Redeploy
              </>
            )}
          </Button> */}
          {/* <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Repository</div>
              <div className="flex items-center">
                <Github size={16} className="mr-2 text-muted-foreground" />
                <span>{project.repository}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Deployed URL</div>
              <a 
                href={project.deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                {project.deployedUrl}
                <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium mb-1">Created</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Last Updated</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Deployment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Project Slug</div>
              <div className="text-muted-foreground">{project.slug}</div>
            </div>
            
            <Separator />
            
            <div>
              <div className="text-sm font-medium mb-1">Environment Variables</div>
              <div className="bg-muted rounded-md p-3 text-sm">
                <p className="text-muted-foreground italic">No environment variables configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 