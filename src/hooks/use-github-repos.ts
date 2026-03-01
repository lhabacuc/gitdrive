"use client";

import { useQuery } from "@tanstack/react-query";
import { GitHubRepo } from "@/types";

async function fetchRepos(): Promise<GitHubRepo[]> {
  const res = await fetch("/api/github/repos");
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}

export function useGitHubRepos() {
  return useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });
}
