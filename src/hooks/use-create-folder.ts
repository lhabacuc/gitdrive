"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateFolderParams {
  owner: string;
  repo: string;
  path: string;
}

async function createFolder({ owner, repo, path }: CreateFolderParams) {
  const res = await fetch("/api/github/folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner, repo, path }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create folder");
  }

  return res.json();
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (_, variables) => {
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo, dirPath],
      });
    },
  });
}
