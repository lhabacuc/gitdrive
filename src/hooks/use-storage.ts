"use client";

import { useQuery } from "@tanstack/react-query";

interface StorageInfo {
  size: number;
  sizeFormatted: string;
}

async function fetchStorage(owner: string, repo: string): Promise<StorageInfo> {
  const params = new URLSearchParams({ owner, repo });
  const res = await fetch(`/api/github/storage?${params}`);
  if (!res.ok) throw new Error("Failed to fetch storage");
  return res.json();
}

export function useStorage(owner?: string, repo?: string) {
  return useQuery({
    queryKey: ["storage", owner, repo],
    queryFn: () => fetchStorage(owner!, repo!),
    enabled: !!owner && !!repo,
    staleTime: 60_000,
  });
}
