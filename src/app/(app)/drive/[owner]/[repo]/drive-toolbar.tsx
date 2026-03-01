"use client";

import { useState } from "react";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";
import { Upload, FolderPlus } from "lucide-react";

interface DriveToolbarProps {
  owner: string;
  repo: string;
  currentPath: string;
}

export function DriveToolbar({ owner, repo, currentPath }: DriveToolbarProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--view))] border-b border-white/[0.06]">
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
