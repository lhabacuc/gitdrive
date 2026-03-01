"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitHubFile } from "@/types";

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
    onMutate: async (variables) => {
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      const folderName = variables.path.split("/").pop() || "";
      const queryKey = ["contents", variables.owner, variables.repo, dirPath];

      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<GitHubFile[]>(queryKey);

      const optimisticFolder: GitHubFile = {
        name: folderName,
        path: variables.path,
        sha: "optimistic",
        size: 0,
        type: "dir",
        download_url: null,
        html_url: "",
      };

      queryClient.setQueryData<GitHubFile[]>(queryKey, (old) =>
        old ? [...old, optimisticFolder] : [optimisticFolder]
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
