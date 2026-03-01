"use client";

import { useQuery } from "@tanstack/react-query";
import { GitHubFile } from "@/types";

async function searchFiles(
  owner: string,
  repo: string,
  query: string
): Promise<GitHubFile[]> {
  const params = new URLSearchParams({ owner, repo, query });
  const res = await fetch(`/api/github/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useSearch(owner: string, repo: string, query: string) {
  return useQuery({
    queryKey: ["search", owner, repo, query],
    queryFn: () => searchFiles(owner, repo, query),
    enabled: !!owner && !!repo && query.length >= 2,
  });
}
