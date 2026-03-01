"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RenameParams {
  owner: string;
  repo: string;
  oldPath: string;
  newPath: string;
  type: "file" | "dir";
  sha?: string;
}

async function renameItem(params: RenameParams) {
  const res = await fetch("/api/github/rename", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Rename failed");
  }

  return res.json();
}

export function useRename() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameItem,
    onSuccess: (_, variables) => {
      const oldDir = variables.oldPath.split("/").slice(0, -1).join("/");
      const newDir = variables.newPath.split("/").slice(0, -1).join("/");

      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo, oldDir],
      });

      if (newDir !== oldDir) {
        queryClient.invalidateQueries({
          queryKey: ["contents", variables.owner, variables.repo, newDir],
        });
      }
    },
  });
}
