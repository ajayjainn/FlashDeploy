import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, ExternalLink, Clock, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/use-project-queries";

export default function Dashboard() {
  // Use React Query hook for projects
  const { data: projects = [], isLoading } = useProjects();

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link to="/dashboard/new">
          <Button>
            <PlusCircle size={16} className="mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin mr-2" />
          <span>Loading projects...</span>
        </div>
      ) : (
        <div>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/dashboard/project/${project.slug}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full border-2 hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center">
                            <Package size={18} className="mr-2 text-primary" />
                            {project.name}
                          </CardTitle>
                          <CardDescription>{project.slug}</CardDescription>
                        </div>
                        <Badge variant={
                          project.status === 'Deployed' ? 'success' : 
                          project.status === 'Deploying' ? 'warning' : 
                          'destructive'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm font-medium mb-1">Repository</div>
                      <div className="text-sm text-muted-foreground truncate mb-3">{project.repository}</div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-primary">
                        <span>View details</span>
                        <ExternalLink size={12} className="ml-1" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No projects yet</CardTitle>
                <CardDescription>
                  Create your first project by clicking the button below
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Link to="/dashboard/new">
                  <Button size="lg">
                    <PlusCircle size={16} className="mr-2" />
                    Create your first project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
