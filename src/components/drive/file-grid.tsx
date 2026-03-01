"use client";

import { GitHubFile } from "@/types";
import { FileCard } from "./file-card";
import { FolderCard } from "./folder-card";
import { isPreviewable } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2, FolderOpen } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { DeleteDialog } from "@/components/actions/delete-dialog";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";
import { RenameDialog } from "@/components/actions/rename-dialog";
import { InfoDialog } from "@/components/actions/info-dialog";
import { useDragSelect } from "@/hooks/use-drag-select";
import { useDriveConfig } from "@/hooks/use-drive-config";
import { useFolderColors, useUpdateFolderColor } from "@/hooks/use-folder-colors";
import { CONFIG_FOLDER } from "@/lib/constants";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Upload, FolderPlus, CheckSquare } from "lucide-react";

interface FileGridProps {
  items: GitHubFile[];
  owner: string;
  repo: string;
  currentPath: string;
  isLoading: boolean;
}

export function FileGrid({ items, owner, repo, currentPath, isLoading }: FileGridProps) {
  const router = useRouter();
  const [deleteItem, setDeleteItem] = useState<GitHubFile | null>(null);
  const [renameItem, setRenameItem] = useState<GitHubFile | null>(null);
  const [infoItem, setInfoItem] = useState<GitHubFile | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { config } = useDriveConfig(owner, repo);
  const { colors } = useFolderColors(owner, repo);
  const updateFolderColor = useUpdateFolderColor();

  const onSelectionChange = useCallback((paths: Set<string>) => {
    setSelected(paths);
  }, []);

  const { lassoRect, handleMouseDown } = useDragSelect({
    containerRef: gridRef,
    itemSelector: "[data-item-path]",
    onSelectionChange,
  });

  const handleItemSelect = useCallback(
    (path: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected((prev) => {
        const next = new Set(prev);
        if (e.metaKey || e.ctrlKey) {
          if (next.has(path)) next.delete(path);
          else next.add(path);
        } else {
          if (next.has(path) && next.size === 1) {
            next.clear();
          } else {
            next.clear();
            next.add(path);
          }
        }
        return next;
      });
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const visibleItems = items.filter((item) => {
    // Always hide .gitkeep and the config folder
    if (item.name === ".gitkeep") return false;
    if (item.name === CONFIG_FOLDER) return false;
    // Hide dotfiles unless showHiddenFiles is enabled
    if (!config.showHiddenFiles && item.name.startsWith(".")) return false;
    return true;
  });

  if (visibleItems.length === 0) {
    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground flex-1">
              <FolderOpen className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-base">Folder is Empty</p>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setFolderOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
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

  const sorted = [...visibleItems].sort((a, b) => {
    // Directories always come first
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;

    const dir = config.sortOrder === "desc" ? -1 : 1;
    switch (config.sortBy) {
      case "size":
        return (a.size - b.size) * dir;
      case "date":
        return a.name.localeCompare(b.name) * dir; // GitHub contents API doesn't return dates per-item; fallback to name
      case "name":
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });

  const handlePreview = (file: GitHubFile) => {
    if (isPreviewable(file.name)) {
      router.push(`/preview/${owner}/${repo}/${file.path}`);
    }
  };

  const handleDownload = async (file: GitHubFile) => {
    const params = new URLSearchParams({ owner, repo, path: file.path });
    const link = document.createElement("a");
    link.href = `/api/github/download?${params}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const folderCount = sorted.filter((i) => i.type === "dir").length;
  const fileCount = sorted.filter((i) => i.type !== "dir").length;

  const selectAll = () => {
    setSelected(new Set(sorted.map((item) => item.path)));
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={gridRef}
            onMouseDown={handleMouseDown}
            className="relative flex-1 bg-[hsl(var(--view))]"
          >
            <div className="grid grid-cols-3 gap-1 p-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {sorted.map((item) =>
                item.type === "dir" ? (
                  <FolderCard
                    key={item.path}
                    folder={item}
                    href={`/drive/${owner}/${repo}/tree/${item.path}`}
                    owner={owner}
                    repo={repo}
                    selected={selected.has(item.path)}
                    colorName={colors[item.path] || "blue"}
                    onSelect={(e) => handleItemSelect(item.path, e)}
                    onDelete={() => setDeleteItem(item)}
                    onColorChange={(color) =>
                      updateFolderColor.mutate({
                        owner,
                        repo,
                        path: item.path,
                        color,
                      })
                    }
                    onRename={() => setRenameItem(item)}
                    onGetInfo={() => setInfoItem(item)}
                  />
                ) : (
                  <FileCard
                    key={item.path}
                    file={item}
                    owner={owner}
                    repo={repo}
                    selected={selected.has(item.path)}
                    onSelect={(e) => handleItemSelect(item.path, e)}
                    onPreview={() => handlePreview(item)}
                    onDownload={() => handleDownload(item)}
                    onDelete={() => setDeleteItem(item)}
                    onRename={() => setRenameItem(item)}
                    onGetInfo={() => setInfoItem(item)}
                  />
                )
              )}
            </div>

            {/* Lasso selection rectangle */}
            {lassoRect && lassoRect.width > 3 && lassoRect.height > 3 && (
              <div
                className="absolute border border-primary/60 bg-primary/15 rounded pointer-events-none z-20"
                style={{
                  left: lassoRect.x,
                  top: lassoRect.y,
                  width: lassoRect.width,
                  height: lassoRect.height,
                }}
              />
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setFolderOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={selectAll}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Select All
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Nautilus-style item count bar */}
      <div className="flex h-7 items-center justify-center bg-[hsl(var(--view))] border-t border-white/[0.06] shrink-0">
        <span className="text-[11px] text-muted-foreground">
          {folderCount > 0 && `${folderCount} folder${folderCount !== 1 ? "s" : ""}`}
          {folderCount > 0 && fileCount > 0 && ", "}
          {fileCount > 0 && `${fileCount} item${fileCount !== 1 ? "s" : ""}`}
          {selected.size > 0 && ` (${selected.size} selected)`}
        </span>
      </div>

      <DeleteDialog
        item={deleteItem}
        owner={owner}
        repo={repo}
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      />
      <RenameDialog
        item={renameItem}
        owner={owner}
        repo={repo}
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
      />
      <InfoDialog
        item={infoItem}
        owner={owner}
        repo={repo}
        open={!!infoItem}
        onOpenChange={(open) => !open && setInfoItem(null)}
      />
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
