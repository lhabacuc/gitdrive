"use client";

import { useGitHubRepos } from "@/hooks/use-github-repos";
import { GitHubRepo } from "@/types";
import { formatBytes } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FolderGit2, Lock, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RepoSelector() {
  const { data: repos, isLoading, error } = useGitHubRepos();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">Failed to load repositories</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Repositories</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose a repository to browse as a drive
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {repos?.map((repo: GitHubRepo) => (
          <button
            key={repo.id}
            onClick={() => router.push(`/drive/${repo.owner.login}/${repo.name}`)}
            className="flex flex-col gap-2 rounded-xl bg-white/[0.04] p-4 text-left transition-all hover:bg-white/[0.07] border border-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground truncate flex-1">
                {repo.name}
              </span>
              {repo.private ? (
                <Lock className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Globe className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            {repo.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-1">
              <span>{formatBytes(repo.size * 1024)}</span>
              <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
