"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitHubFile } from "@/types";

interface DeleteParams {
  owner: string;
  repo: string;
  path: string;
  sha?: string;
  type: "file" | "dir";
}

async function deleteItem({ owner, repo, path, sha, type }: DeleteParams) {
  const res = await fetch("/api/github/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner,
      repo,
      path,
      sha,
      type,
      message: `Delete ${path}`,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Delete failed");
  }

  return res.json();
}

export function useDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
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
    },
  });
}
