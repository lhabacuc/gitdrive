"use client";

import { useParams } from "next/navigation";
import { useGitHubContents } from "@/hooks/use-github-contents";
import { FileGrid } from "@/components/drive/file-grid";
import { DriveToolbar } from "./drive-toolbar";

export default function RepoPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data: items = [], isLoading } = useGitHubContents(owner, repo, "");

  return (
    <div className="flex flex-col h-full">
      <DriveToolbar owner={owner} repo={repo} currentPath="" />
      <FileGrid
        items={items}
        owner={owner}
        repo={repo}
        currentPath=""
        isLoading={isLoading}
      />
    </div>
  );
}
