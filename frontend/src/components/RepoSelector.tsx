import { Repository } from "@/lib/api";
import { Combobox } from "@/components/ui/combobox";
import { GithubIcon } from "lucide-react";

interface RepoSelectorProps {
  repositories: Repository[];
  selectedRepo: string | null;
  onSelect: (repo: Repository) => void;
  disabled?: boolean;
}

export function RepoSelector({ repositories, selectedRepo, onSelect, disabled = false }: RepoSelectorProps) {
  // Ensure repositories is an array before mapping
  const repoArray = Array.isArray(repositories) ? repositories : [];
  
  // Format repositories for combobox
  const options = repoArray.map((repo) => ({
    value: repo.id,
    label: repo.name,
    data: repo,
    description: repo.description,
    isPrivate: repo.private,
    owner: repo.owner
  }));
  console.log(options, "options");

  return (
    <div className="space-y-4">
      <Combobox
        options={options}
        value={selectedRepo || ""}
        onChange={(value, data) => {
          if (data) onSelect(data);
        }}
        placeholder="Search for a repository..."
        searchPlaceholder="Type to search repositories..."
        emptyMessage="No repositories found."
        disabled={disabled}
      />
      
      {selectedRepo && (
        <div className="p-4 border rounded-md bg-secondary/20">
          {(() => {
            const repo = repoArray.find(r => r.id === selectedRepo);
            if (!repo) return null;
            
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GithubIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{repo.name}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {repo.private ? "Private" : "Public"}
                  </span>
                </div>
                
                {repo.description && (
                  <p className="text-sm text-muted-foreground">{repo.description}</p>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {repo.owner}/{repo.name}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 