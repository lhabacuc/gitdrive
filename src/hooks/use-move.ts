"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitHubFile } from "@/types";

interface MoveParams {
  owner: string;
  repo: string;
  items: { path: string; type: "file" | "dir"; sha?: string }[];
  destinationDir: string;
} 

async function moveItems(params: MoveParams) {
  const res = await fetch("/api/github/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Move failed");
  }

  return res.json();
}

export function useMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveItems,
    onMutate: async (variables) => {
      // Determine source directories for optimistic removal
      const sourceDirs: string[] = [];
      for (const item of variables.items) {
        const sourceDir = item.path.split("/").slice(0, -1).join("/");
        if (!sourceDirs.includes(sourceDir)) {
          sourceDirs.push(sourceDir);
        }
      }

      const previousStates: { queryKey: string[]; data: GitHubFile[] | undefined }[] = [];

      // Optimistically remove from source directories
      for (const sourceDir of sourceDirs) {
        const queryKey = ["contents", variables.owner, variables.repo, sourceDir];
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<GitHubFile[]>(queryKey);
        previousStates.push({ queryKey, data: previous });

        const movePaths = new Set(variables.items.map((i) => i.path));
        queryClient.setQueryData<GitHubFile[]>(queryKey, (old) =>
          old?.filter((item) => !movePaths.has(item.path))
        );
      }

      return { previousStates };
    },
    onError: (_err, _variables, context) => {
      // Rollback all source directories
      if (context?.previousStates) {
        for (const { queryKey, data } of context.previousStates) {
          if (data) queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate source and destination
      const sourceDirs: string[] = [];
      for (const item of variables.items) {
        const sourceDir = item.path.split("/").slice(0, -1).join("/");
        if (!sourceDirs.includes(sourceDir)) {
          sourceDirs.push(sourceDir);
        }
      }
      for (const sourceDir of sourceDirs) {
        queryClient.invalidateQueries({
          queryKey: ["contents", variables.owner, variables.repo, sourceDir],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [
          "contents",
          variables.owner,
          variables.repo,
          variables.destinationDir,
        ],
      });
    },
  });
}
