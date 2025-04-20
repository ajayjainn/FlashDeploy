import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SimpleRepoSelector } from "@/components/SimpleRepoSelector";
import { getRepositories, Repository } from "@/lib/api";
import { Loader, ArrowLeft } from "lucide-react";
import { useDeployProject } from "@/hooks/use-project-queries";

export default function NewProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const deployMutation = useDeployProject();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [projectSlug, setProjectSlug] = useState("");

  // Fetch repositories if not already loaded
  const fetchRepositories = async () => {
    if (repositories.length === 0) {
      setIsLoading(true);
      try {
        const repos = await getRepositories();
        setRepositories(repos);
      } catch (error) {
        console.error("Failed to load repositories:", error);
        toast({
          title: "Error",
          description: "Failed to load repositories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle repo selection
  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    // Generate a default slug from the repo name
    const defaultSlug = repo.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setProjectSlug(defaultSlug);
    // Move to next step
    setStep(2);
  };

  // Handle deployment
  const handleDeploy = async () => {
    if (!selectedRepo || !projectSlug) return;

    deployMutation.mutate(
      { 
        owner: selectedRepo.owner, 
        repo: selectedRepo.name, 
        slug: projectSlug 
      },
      {
        onSuccess: () => navigate("/dashboard")
      }
    );
  };

  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/dashboard");
    }
  };

  // Load repositories when component mounts
  useState(() => {
    fetchRepositories();
  });

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Create a New Project</h1>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Repository</CardTitle>
            <CardDescription>
              Choose a GitHub repository to deploy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-primary animate-spin mr-2" />
                <span>Loading repositories...</span>
              </div>
            ) : repositories.length > 0 ? (
              <SimpleRepoSelector
                repositories={repositories}
                selectedRepo={selectedRepo?.id || null}
                onSelect={handleRepoSelect}
              />
            ) : (
              <div className="text-center py-8">
                {/* <GitHubIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" /> */}
                <h3 className="text-lg font-medium mb-2">No repositories found</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your GitHub account or make sure you have repositories with proper access.
                </p>
                <Button onClick={fetchRepositories}>
                  Refresh Repositories
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedRepo && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Project</CardTitle>
            <CardDescription>
              Set up the deployment settings for {selectedRepo.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo">Repository</Label>
              <div className="flex items-center bg-muted p-3 rounded-md">
                {/* <GitHubIcon className="w-5 h-5 mr-2 text-muted-foreground" /> */}
                <span>{selectedRepo.owner}/{selectedRepo.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Project Slug</Label>
              <Input
                id="slug"
                value={projectSlug}
                onChange={(e) => setProjectSlug(e.target.value)}
                placeholder="my-project"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                This will be part of your deployment URL: https://{projectSlug || 'your-project'}.domain.com
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              onClick={handleDeploy} 
              disabled={!projectSlug || deployMutation.isPending}
            >
              {deployMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy Project"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}