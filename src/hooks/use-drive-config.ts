"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DriveConfig } from "@/types";

interface ConfigResponse {
  config: DriveConfig;
  sha: string | null;
}

const DEFAULT_CONFIG: DriveConfig = {
  defaultRepo: null,
  displayName: "My Drive",
  viewMode: "grid",
  sortBy: "name",
  sortOrder: "asc",
  showHiddenFiles: false,
  uploadLimitMB: 100,
};

async function fetchConfig(owner: string, repo: string): Promise<ConfigResponse> {
  const params = new URLSearchParams({ owner, repo });
  const res = await fetch(`/api/github/config?${params}`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

async function updateConfig(params: {
  owner: string;
  repo: string;
  config: DriveConfig;
}): Promise<ConfigResponse> {
  const res = await fetch("/api/github/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save config");
  }
  return res.json();
}

export function useDriveConfig(owner?: string, repo?: string) {
  const query = useQuery({
    queryKey: ["drive-config", owner, repo],
    queryFn: () => fetchConfig(owner!, repo!),
    enabled: !!owner && !!repo,
  });

  return {
    ...query,
    config: query.data?.config ?? DEFAULT_CONFIG,
    sha: query.data?.sha ?? null,
  };
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConfig,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["drive-config", variables.owner, variables.repo],
        data
      );
    },
  });
}
