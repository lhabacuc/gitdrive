"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderColorName, FolderColorsConfig } from "@/types";

interface ColorsResponse {
  colors: FolderColorsConfig;
  sha: string | null;
}

async function fetchFolderColors(owner: string, repo: string): Promise<ColorsResponse> {
  const params = new URLSearchParams({ owner, repo });
  const res = await fetch(`/api/github/folder-colors?${params}`);
  if (!res.ok) throw new Error("Failed to fetch folder colors");
  return res.json();
}

async function updateFolderColors(params: {
  owner: string;
  repo: string;
  colors: FolderColorsConfig;
}): Promise<ColorsResponse> {
  const res = await fetch("/api/github/folder-colors", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save folder colors");
  }
  return res.json();
}

export function useFolderColors(owner?: string, repo?: string) {
  const query = useQuery({
    queryKey: ["folder-colors", owner, repo],
    queryFn: () => fetchFolderColors(owner!, repo!),
    enabled: !!owner && !!repo,
  });

  return {
    ...query,
    colors: query.data?.colors ?? {},
  };
}

export function useUpdateFolderColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      owner: string;
      repo: string;
      path: string;
      color: FolderColorName | null;
    }) => {
      const existing = queryClient.getQueryData<ColorsResponse>([
        "folder-colors",
        params.owner,
        params.repo,
      ]);
      const colors = { ...(existing?.colors ?? {}) };

      if (params.color === null || params.color === "blue") {
        delete colors[params.path];
      } else {
        colors[params.path] = params.color;
      }

      return updateFolderColors({
        owner: params.owner,
        repo: params.repo,
        colors,
      });
    },
    onMutate: async (variables) => {
      const queryKey = ["folder-colors", variables.owner, variables.repo];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ColorsResponse>(queryKey);

      const colors = { ...(previous?.colors ?? {}) };
      if (variables.color === null || variables.color === "blue") {
        delete colors[variables.path];
      } else {
        colors[variables.path] = variables.color;
      }

      queryClient.setQueryData<ColorsResponse>(queryKey, {
        colors,
        sha: previous?.sha ?? null,
      });

      return { previous, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["folder-colors", variables.owner, variables.repo],
      });
    },
  });
}
