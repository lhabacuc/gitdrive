"use client";

import { useQuery } from "@tanstack/react-query";

interface CommitHistoryItem {
  sha: string;
  message: string;
  date: string;
  author: {
    name: string;
    avatar_url: string;
    login: string;
  };
}

async function fetchHistory(
  owner: string,
  repo: string,
  path: string
): Promise<CommitHistoryItem[]> {
  const params = new URLSearchParams({ owner, repo, path });
  const res = await fetch(`/api/github/history?${params}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function useFileHistory(
  owner: string,
  repo: string,
  path: string,
  enabled = true
) {
  return useQuery({
    queryKey: ["file-history", owner, repo, path],
    queryFn: () => fetchHistory(owner, repo, path),
    enabled: !!owner && !!repo && !!path && enabled,
  });
}
