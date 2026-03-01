"use client";

import { useQuery } from "@tanstack/react-query";
import { GitHubFile } from "@/types";

export async function fetchContents(
  owner: string,
  repo: string,
  path: string
): Promise<GitHubFile[]> {
  const params = new URLSearchParams({ owner, repo, path });
  const res = await fetch(`/api/github/contents?${params}`);
  if (!res.ok) throw new Error("Failed to fetch contents");
  const data = await res.json();
  // API may return a single file object or array
  return Array.isArray(data) ? data : [data];
}

export function useGitHubContents(
  owner: string,
  repo: string,
  path: string = ""
) {
  return useQuery({
    queryKey: ["contents", owner, repo, path],
    queryFn: () => fetchContents(owner, repo, path),
    enabled: !!owner && !!repo,
  });
}
