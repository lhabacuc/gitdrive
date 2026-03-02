"use client";

import { GitHubFile } from "@/types";
import { FileCard } from "./file-card";
import { FolderCard } from "./folder-card";
import { FileList } from "./file-list";
import { SelectionToolbar } from "./selection-toolbar";
import { getFileExtension, isPreviewable } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2, FolderOpen } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { DeleteDialog } from "@/components/actions/delete-dialog";
import { BulkDeleteDialog } from "@/components/actions/bulk-delete-dialog";
import { UploadDialog } from "@/components/actions/upload-dialog";
import { CreateFolderDialog } from "@/components/actions/create-folder-dialog";
import { RenameDialog } from "@/components/actions/rename-dialog";
import { InfoDialog } from "@/components/actions/info-dialog";
import { HistoryDialog } from "@/components/actions/history-dialog";
import { useDragSelect } from "@/hooks/use-drag-select";
import { useDriveConfig } from "@/hooks/use-drive-config";
import { useFolderColors, useUpdateFolderColor } from "@/hooks/use-folder-colors";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMove } from "@/hooks/use-move";
import { useMoveToTrash } from "@/hooks/use-trash";
import { useDriveMetadata } from "@/hooks/use-drive-metadata";
import { CONFIG_FOLDER, TRASH_FOLDER } from "@/lib/constants";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Upload, FolderPlus, CheckSquare, Scissors, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

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
  const [historyItem, setHistoryItem] = useState<GitHubFile | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkMoving, setBulkMoving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const { config } = useDriveConfig(owner, repo);
  const { colors } = useFolderColors(owner, repo);
  const updateFolderColor = useUpdateFolderColor();
  const { clipboard, cut, clearClipboard } = useClipboard();
  const moveMutation = useMove();
  const trashMutation = useMoveToTrash();
  const { addRecent, isStarred, getTags, toggleStar, setTags } = useDriveMetadata(owner, repo);

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

  const visibleItems = items.filter((item) => {
    if (item.name === ".gitkeep") return false;
    if (item.name === CONFIG_FOLDER) return false;
    if (item.name === TRASH_FOLDER) return false;
    if (!config.showHiddenFiles && item.name.startsWith(".")) return false;
    return true;
  });

  const sorted = [...visibleItems].sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    const dir = config.sortOrder === "desc" ? -1 : 1;
    switch (config.sortBy) {
      case "size":
        return (a.size - b.size) * dir;
      case "date":
        return a.name.localeCompare(b.name) * dir;
      case "name":
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });

  const handleOpenItem = (item: GitHubFile) => {
    addRecent({
      owner,
      repo,
      path: item.path,
      name: item.name,
      type: item.type,
    });
    if (item.type === "dir") {
      router.push(`/drive/${owner}/${repo}/tree/${item.path}`);
      return;
    }
    if (isPreviewable(item.name)) {
      router.push(`/preview/${owner}/${repo}/${item.path}`);
    }
  };

  const handlePreview = (file: GitHubFile) => {
    handleOpenItem(file);
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

  const handleBulkDownload = async () => {
    const selectedItems = sorted.filter(
      (i) => selected.has(i.path) && i.type === "file"
    );
    if (selectedItems.length === 0) {
      toast.error("No files selected for download");
      return;
    }
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const item of selectedItems) {
        const params = new URLSearchParams({ owner, repo, path: item.path });
        const res = await fetch(`/api/github/download?${params}`);
        if (res.ok) {
          const blob = await res.blob();
          zip.file(item.name, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "download.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${selectedItems.length} files`);
    } catch {
      toast.error("Failed to create ZIP");
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    const selectedItems = sorted.filter((i) => selected.has(i.path));
    setBulkDeleting(true);
    try {
      for (const item of selectedItems) {
        await trashMutation.mutateAsync({
          owner,
          repo,
          path: item.path,
          type: item.type,
          name: item.name,
          sha: item.sha,
          size: item.size,
        });
      }
      toast.success(`${selectedItems.length} items moved to trash`);
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleCutSelected = () => {
    const selectedItems = sorted.filter((i) => selected.has(i.path));
    if (selectedItems.length === 0) return;
    cut(selectedItems, currentPath);
    toast.success(`${selectedItems.length} item(s) cut`);
  };

  const handleCutSingle = (item: GitHubFile) => {
    cut([item], currentPath);
    toast.success(`"${item.name}" cut`);
  };

  const handlePaste = async (destinationDir = currentPath) => {
    if (!clipboard) return;
    try {
      await moveMutation.mutateAsync({
        owner,
        repo,
        items: clipboard.items.map((i) => ({
          path: i.path,
          type: i.type,
          sha: i.sha,
        })),
        destinationDir,
      });
      toast.success(`${clipboard.items.length} item(s) moved`);
      clearClipboard();
      setSelected(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed");
    }
  };

  const handleMoveSelected = async () => {
    const selectedItems = sorted.filter((i) => selected.has(i.path));
    if (selectedItems.length === 0) return;
    const destination = window.prompt(
      'Move selected items to directory (relative path, empty = root):',
      currentPath
    );
    if (destination === null) return;
    setBulkMoving(true);
    try {
      await moveMutation.mutateAsync({
        owner,
        repo,
        items: selectedItems.map((i) => ({
          path: i.path,
          type: i.type,
          sha: i.sha,
        })),
        destinationDir: destination.trim(),
      });
      setSelected(new Set());
      toast.success(`${selectedItems.length} item(s) moved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed");
    } finally {
      setBulkMoving(false);
    }
  };

  const handleToggleStar = (item: GitHubFile) => {
    const starred = toggleStar({
      owner,
      repo,
      path: item.path,
      name: item.name,
      type: item.type,
    });
    toast.success(starred ? "Added to Starred" : "Removed from Starred");
  };

  const handleEditTags = (item: GitHubFile) => {
    const existing = getTags(item.path);
    const input = window.prompt(
      "Tags (comma-separated, max 8):",
      existing.join(", ")
    );
    if (input === null) return;
    const tags = setTags(
      {
        owner,
        repo,
        path: item.path,
        name: item.name,
        type: item.type,
      },
      input.split(",")
    );
    toast.success(tags.length ? "Tags updated" : "Tags cleared");
  };

  const dataTransferType = "application/x-gitdrive-items";
  const handleItemDragStart = (e: React.DragEvent, draggedItem: GitHubFile) => {
    const selectedItems =
      selected.has(draggedItem.path) && selected.size > 1
        ? sorted.filter((item) => selected.has(item.path))
        : [draggedItem];
    const payload = selectedItems.map((item) => ({
      path: item.path,
      type: item.type,
      sha: item.sha,
    }));
    e.dataTransfer.setData(dataTransferType, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const moveDroppedItems = async (e: React.DragEvent, destinationPath: string) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(dataTransferType);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as { path: string; type: "file" | "dir"; sha?: string }[];
      const sourceParentPaths = new Set(
        payload.map((item) => item.path.split("/").slice(0, -1).join("/"))
      );
      if (payload.some((item) => item.path === destinationPath)) return;
      if (sourceParentPaths.size === 1 && sourceParentPaths.has(destinationPath)) return;
      await moveMutation.mutateAsync({
        owner,
        repo,
        items: payload,
        destinationDir: destinationPath,
      });
      toast.success(`${payload.length} item(s) moved`);
      setSelected(new Set());
      clearClipboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Move failed");
    }
  };

  const handleExtractZip = async () => {
    const zipItems = sorted.filter(
      (item) =>
        selected.has(item.path) &&
        item.type === "file" &&
        getFileExtension(item.name) === "zip"
    );
    if (zipItems.length === 0) {
      toast.error("Select at least one .zip file");
      return;
    }
    setExtracting(true);
    try {
      let uploaded = 0;
      for (const zipItem of zipItems) {
        const params = new URLSearchParams({ owner, repo, path: zipItem.path });
        const res = await fetch(`/api/github/download?${params}`);
        if (!res.ok) continue;
        const blob = await res.blob();
        const zip = await JSZip.loadAsync(blob);
        const baseName = zipItem.name.replace(/\.zip$/i, "");
        const destinationRoot = currentPath
          ? `${currentPath}/${baseName}`
          : baseName;
        // Upload each unzipped file back to the current directory.
        // Directories are implied by file paths in Git.
        const uploadTasks = Object.values(zip.files)
          .filter((entry) => !entry.dir)
          .map(async (entry) => {
            const data = await entry.async("base64");
            const normalized = entry.name.replace(/^\/+/, "");
            const path = `${destinationRoot}/${normalized}`;
            const uploadRes = await fetch("/api/github/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                owner,
                repo,
                path,
                content: data,
                message: `Extract ${zipItem.name}: ${normalized}`,
              }),
            });
            if (uploadRes.ok) uploaded += 1;
          });
        await Promise.all(uploadTasks);
      }
      toast.success(`Extracted ${uploaded} file(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to extract ZIP");
    } finally {
      setExtracting(false);
    }
  };

  const cutPaths = new Set(clipboard?.items.map((i) => i.path) ?? []);

  const selectAll = () => {
    setSelected(new Set(sorted.map((item) => item.path)));
  };

  const folderCount = sorted.filter((i) => i.type === "dir").length;
  const fileCount = sorted.filter((i) => i.type !== "dir").length;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSelectAll: selectAll,
    onCopy: handleCutSelected,
    onCut: handleCutSelected,
    onPaste: () => handlePaste(currentPath),
    onDelete: () => {
      if (selected.size > 0) {
        if (selected.size === 1) {
          const item = sorted.find((i) => selected.has(i.path));
          if (item) setDeleteItem(item);
        } else {
          setBulkDeleteOpen(true);
        }
      }
    },
    onDeselect: () => setSelected(new Set()),
    onOpen: () => {
      if (selected.size === 1) {
        const item = sorted.find((i) => selected.has(i.path));
        if (item) {
          handleOpenItem(item);
        }
      }
    },
    onNavigate: (direction) => {
      if (sorted.length === 0) return;
      let next = focusedIndex;
      if (direction === "right") next = Math.min(focusedIndex + 1, sorted.length - 1);
      else if (direction === "left") next = Math.max(focusedIndex - 1, 0);
      else if (direction === "down") next = Math.min(focusedIndex + 1, sorted.length - 1);
      else if (direction === "up") next = Math.max(focusedIndex - 1, 0);
      if (next < 0) next = 0;
      setFocusedIndex(next);
      const item = sorted[next];
      if (item) setSelected(new Set([item.path]));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {clipboard && clipboard.items.length > 0 && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handlePaste()}>
                  <ClipboardPaste className="mr-2 h-4 w-4" />
                  Paste {clipboard.items.length} item(s)
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} owner={owner} repo={repo} currentPath={currentPath} />
        <CreateFolderDialog open={folderOpen} onOpenChange={setFolderOpen} owner={owner} repo={repo} currentPath={currentPath} />
      </>
    );
  }

  const isListView = config.viewMode === "list";

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={gridRef}
            onMouseDown={handleMouseDown}
            className="relative flex-1 bg-[hsl(var(--view))]"
          >
            {isListView ? (
              <FileList
                items={sorted}
                owner={owner}
                repo={repo}
                selected={selected}
                colors={colors}
                onSelect={handleItemSelect}
                onDelete={setDeleteItem}
                onRename={setRenameItem}
                onGetInfo={setInfoItem}
                onDownload={handleDownload}
                onHistory={setHistoryItem}
                onCut={handleCutSingle}
                onToggleStar={handleToggleStar}
                onEditTags={handleEditTags}
                isStarred={isStarred}
                getTags={getTags}
                onDropToFolder={moveDroppedItems}
                onItemDragStart={handleItemDragStart}
                onOpenItem={handleOpenItem}
                cutPaths={cutPaths}
              />
            ) : (
              <div className="grid grid-cols-2 gap-1.5 p-2 sm:grid-cols-3 sm:gap-1 sm:p-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">
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
                      onCut={() => handleCutSingle(item)}
                      onPaste={
                        clipboard && clipboard.items.length > 0
                          ? () => handlePaste(item.path)
                          : undefined
                      }
                      onToggleStar={() => handleToggleStar(item)}
                      onEditTags={() => handleEditTags(item)}
                      starred={isStarred(item.path)}
                      tags={getTags(item.path)}
                      onOpen={() => addRecent({
                        owner,
                        repo,
                        path: item.path,
                        name: item.name,
                        type: item.type,
                      })}
                      onItemDragStart={handleItemDragStart}
                      onDropToFolder={moveDroppedItems}
                      isCut={cutPaths.has(item.path)}
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
                      onHistory={() => setHistoryItem(item)}
                      onCut={() => handleCutSingle(item)}
                      onToggleStar={() => handleToggleStar(item)}
                      onEditTags={() => handleEditTags(item)}
                      starred={isStarred(item.path)}
                      tags={getTags(item.path)}
                      onItemDragStart={handleItemDragStart}
                      isCut={cutPaths.has(item.path)}
                    />
                  )
                )}
              </div>
            )}

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
          {selected.size > 0 && (
            <ContextMenuItem onClick={handleCutSelected}>
              <Scissors className="mr-2 h-4 w-4" />
              Cut {selected.size} item(s)
            </ContextMenuItem>
          )}
          {clipboard && clipboard.items.length > 0 && (
            <ContextMenuItem onClick={() => handlePaste()}>
              <ClipboardPaste className="mr-2 h-4 w-4" />
              Paste {clipboard.items.length} item(s)
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* Bottom bar: selection toolbar or item count */}
      {selected.size > 0 ? (
        <SelectionToolbar
          count={selected.size}
          onDownload={handleBulkDownload}
          onMove={handleMoveSelected}
          onExtract={handleExtractZip}
          canExtract={
            !extracting &&
            sorted.some(
              (item) =>
                selected.has(item.path) &&
                item.type === "file" &&
                getFileExtension(item.name) === "zip"
            )
          }
          onDelete={() => {
            if (selected.size === 1) {
              const item = sorted.find((i) => selected.has(i.path));
              if (item) setDeleteItem(item);
            } else {
              setBulkDeleteOpen(true);
            }
          }}
          onDeselect={() => setSelected(new Set())}
          downloading={downloading || bulkMoving || extracting}
        />
      ) : (
        <div className="flex h-7 items-center justify-center bg-[hsl(var(--view))] border-t border-foreground/[0.06] shrink-0">
          <span className="text-[11px] text-muted-foreground">
            {folderCount > 0 && `${folderCount} folder${folderCount !== 1 ? "s" : ""}`}
            {folderCount > 0 && fileCount > 0 && ", "}
            {fileCount > 0 && `${fileCount} item${fileCount !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      <DeleteDialog item={deleteItem} owner={owner} repo={repo} open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)} />
      <BulkDeleteDialog count={selected.size} open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen} onConfirm={handleBulkDelete} isPending={bulkDeleting} />
      <RenameDialog item={renameItem} owner={owner} repo={repo} open={!!renameItem} onOpenChange={(open) => !open && setRenameItem(null)} />
      <InfoDialog item={infoItem} owner={owner} repo={repo} open={!!infoItem} onOpenChange={(open) => !open && setInfoItem(null)} />
      <HistoryDialog item={historyItem} owner={owner} repo={repo} open={!!historyItem} onOpenChange={(open) => !open && setHistoryItem(null)} />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} owner={owner} repo={repo} currentPath={currentPath} />
      <CreateFolderDialog open={folderOpen} onOpenChange={setFolderOpen} owner={owner} repo={repo} currentPath={currentPath} />
    </>
  );
}
