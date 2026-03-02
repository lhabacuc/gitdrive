"use client";

import { useState } from "react";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";
import { Upload, FolderPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useStorage } from "@/hooks/use-storage";
import { formatBytes } from "@/lib/utils";

interface DriveToolbarProps {
  owner: string;
  repo: string;
  currentPath: string;
}

export function DriveToolbar({ owner, repo, currentPath }: DriveToolbarProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const { data: storage } = useStorage(owner, repo);
  const repoSize = storage?.size || 0;
  const repoLimit = 10 * 1024 * 1024 * 1024; // GitHub repository soft limit: 10GB
  const usage = Math.min(100, Math.round((repoSize / repoLimit) * 100));

  return (
    <>
      <div className="px-3 py-1.5 bg-[hsl(var(--view))] border-b border-white/[0.06] space-y-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <button
            onClick={() => setFolderOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            New Folder
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Repository storage</span>
            <span>
              {formatBytes(repoSize)} / 10 GB ({usage}%)
            </span>
          </div>
          <Progress value={usage} className="h-1.5" />
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        owner={owner}
        repo={repo}
        currentPath={currentPath}
      />
      <CreateFolderDialog
        open={folderOpen}
        onOpenChange={setFolderOpen}
        owner={owner}
        repo={repo}
        currentPath={currentPath}
      />
    </>
  );
}
