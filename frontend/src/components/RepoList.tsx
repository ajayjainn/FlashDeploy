import { Repository } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GithubIcon } from "lucide-react";

interface RepoListProps {
  repositories: Repository[];
  selectedRepo: string | null;
  onSelect: (repo: Repository) => void;
}

export function RepoList({ repositories, selectedRepo, onSelect }: RepoListProps) {
  return (
    <RadioGroup value={selectedRepo || undefined} className="grid gap-3">
      {repositories.map((repo) => (
        <Card
          key={repo.id}
          className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
            selectedRepo === repo.id
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
          onClick={() => onSelect(repo)}
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value={repo.id} id={repo.id} className="mt-1" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <Label htmlFor={repo.id} className="text-base font-medium cursor-pointer">
                  {repo.name}
                </Label>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                  {repo.private ? "Private" : "Public"}
                </span>
              </div>
              {repo.description && (
                <p className="text-sm text-muted-foreground">{repo.description}</p>
              )}
              <div className="flex items-center space-x-2 pt-1">
                <GithubIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{repo.owner}/{repo.name}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </RadioGroup>
  );
}
