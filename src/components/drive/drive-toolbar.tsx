"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus } from "lucide-react";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";

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
      <div className="flex items-center gap-2 px-6 pb-2">
        <Button
          size="sm"
          onClick={() => setUploadOpen(true)}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFolderOpen(true)}
          className="gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          New Folder
        </Button>
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
