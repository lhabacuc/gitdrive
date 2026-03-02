"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrashItem, GitHubFile } from "@/types";

async function fetchTrashItems(owner: string, repo: string): Promise<TrashItem[]> {
  const params = new URLSearchParams({ owner, repo });
  const res = await fetch(`/api/github/trash?${params}`);
  if (!res.ok) throw new Error("Failed to fetch trash");
  return res.json();
}

export function useTrashItems(owner?: string, repo?: string) {
  return useQuery({
    queryKey: ["trash", owner, repo],
    queryFn: () => fetchTrashItems(owner!, repo!),
    enabled: !!owner && !!repo,
  });
}

export function useMoveToTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      owner: string;
      repo: string;
      path: string;
      type: "file" | "dir";
      name: string;
      sha?: string;
      size?: number;
    }) => {
      const res = await fetch("/api/github/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to move to trash");
      }
      return res.json();
    },
    onMutate: async (variables) => {
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      const queryKey = ["contents", variables.owner, variables.repo, dirPath];

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GitHubFile[]>(queryKey);

      queryClient.setQueryData<GitHubFile[]>(queryKey, (old) =>
        old?.filter((item) => item.path !== variables.path)
      );

      return { previous, queryKey };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo, dirPath],
      });
      queryClient.invalidateQueries({
        queryKey: ["trash", variables.owner, variables.repo],
      });
    },
  });
}

export function useRestoreFromTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      owner: string;
      repo: string;
      trashItem: TrashItem;
    }) => {
      const res = await fetch("/api/github/trash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to restore");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trash", variables.owner, variables.repo],
      });
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo],
      });
    },
  });
}

export function useDeleteForever() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      owner: string;
      repo: string;
      trashItem?: TrashItem;
      emptyAll?: boolean;
    }) => {
      const res = await fetch("/api/github/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trash", variables.owner, variables.repo],
      });
    },
  });
}
