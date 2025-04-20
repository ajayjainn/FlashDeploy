import { useState } from "react";
import { Repository } from "@/lib/api";
import { GithubIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SimpleRepoSelectorProps {
  repositories: Repository[];
  selectedRepo: string | null;
  onSelect: (repo: Repository) => void;
  disabled?: boolean;
}

export function SimpleRepoSelector({
  repositories = [],
  selectedRepo,
  onSelect,
  disabled = false
}: SimpleRepoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Ensure repositories is always an array
  const repoArray = Array.isArray(repositories) ? repositories : [];
  
  // Filter repositories based on search term
  const filteredRepos = repoArray.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Find the currently selected repository
  const selectedRepository = repoArray.find(r => r.id === selectedRepo);
  
  // Handle selection of a repository
  const handleSelectRepo = (repoId: string) => {
    const repo = repoArray.find(r => r.id === repoId);
    if (repo) {
      onSelect(repo);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search input */}
      <div className="relative w-full">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search repositories..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>
      
      {/* Repository list */}
      <div className="max-h-60 overflow-y-auto border rounded-md divide-y w-full">
        {filteredRepos.length > 0 ? (
          filteredRepos.map(repo => (
            <Button
              key={repo.id}
              variant="ghost"
              className={`w-full justify-start p-3 h-auto ${selectedRepo === repo.id ? 'bg-accent' : ''}`}
              onClick={() => handleSelectRepo(repo.id)}
              disabled={disabled}
            >
              <div className="flex items-center space-x-2 w-full">
                <GithubIcon className="h-4 w-4 flex-shrink-0" />
                <div className="flex flex-col items-start overflow-hidden w-full">
                  <span className="font-medium text-sm">{repo.name}</span>
                  <span className="text-xs truncate w-full">
                    {repo.owner}/{repo.name}
                  </span>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-secondary flex-shrink-0">
                  {repo.private ? "Private" : "Public"}
                </span>
              </div>
            </Button>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground w-full">
            No repositories found
          </div>
        )}
      </div>
      
      {/* Selected repository details */}
      {selectedRepository && (
        <div className="p-4 border rounded-md bg-secondary/20 w-full">
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <GithubIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{selectedRepository.name}</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                {selectedRepository.private ? "Private" : "Public"}
              </span>
            </div>
            
            {selectedRepository.description && (
              <p className="text-sm text-muted-foreground w-full">{selectedRepository.description}</p>
            )}
            
            <div className="text-xs text-muted-foreground w-full">
              {selectedRepository.owner}/{selectedRepository.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 