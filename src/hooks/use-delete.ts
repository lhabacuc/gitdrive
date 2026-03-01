"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: (_, variables) => {
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo, dirPath],
      });
    },
  });
}
