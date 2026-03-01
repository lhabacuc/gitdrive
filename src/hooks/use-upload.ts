"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UPLOAD_LIMIT_CONTENTS_API, UPLOAD_LIMIT_MAX } from "@/lib/constants";

interface UploadParams {
  owner: string;
  repo: string;
  path: string;
  file: File;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadFile({ owner, repo, path, file }: UploadParams) {
  if (file.size > UPLOAD_LIMIT_MAX) {
    throw new Error("File exceeds 100MB limit");
  }

  const content = await fileToBase64(file);
  const isLarge = file.size >= UPLOAD_LIMIT_CONTENTS_API;
  const endpoint = isLarge ? "/api/github/upload-large" : "/api/github/upload";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner,
      repo,
      path,
      content,
      message: `Upload ${file.name}`,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Upload failed");
  }

  return res.json();
}

export function useUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: (_, variables) => {
      // Invalidate the contents query for the directory
      const dirPath = variables.path.split("/").slice(0, -1).join("/");
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.owner, variables.repo, dirPath],
      });
    },
  });
}
