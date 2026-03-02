"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, LayoutGrid, List } from "lucide-react";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";
import { useDriveConfig, useUpdateConfig } from "@/hooks/use-drive-config";

interface DriveToolbarProps {
  owner: string;
  repo: string;
  currentPath: string;
}

export function DriveToolbar({ owner, repo, currentPath }: DriveToolbarProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const { config } = useDriveConfig(owner, repo);
  const updateConfig = useUpdateConfig();

  const toggleView = () => {
    const newMode = config.viewMode === "grid" ? "list" : "grid";
    updateConfig.mutate({
      owner,
      repo,
      config: { ...config, viewMode: newMode },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 px-2 sm:px-6 pb-2">
        <Button
          size="sm"
          onClick={() => setUploadOpen(true)}
          className="gap-1.5 sm:gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFolderOpen(true)}
          className="gap-1.5 sm:gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Folder</span>
        </Button>
        <div className="flex-1" />
        <div className="flex items-center border border-foreground/[0.08] rounded-lg overflow-hidden">
          <button
            onClick={toggleView}
            className={`p-1.5 transition-colors ${
              config.viewMode === "grid"
                ? "bg-foreground/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={toggleView}
            className={`p-1.5 transition-colors ${
              config.viewMode === "list"
                ? "bg-foreground/[0.08] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
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
