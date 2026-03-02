"use client";

import { GitHubFile, FolderColorName } from "@/types";
import { formatBytes, getFileIcon, isPreviewable } from "@/lib/utils";
import {
  File, FileText, FileCode, Image, Music, Video, Archive, Folder,
  type LucideIcon,
  MoreHorizontal, Eye, Download, Trash2, Link2, Pencil, Info, History, Scissors, Star, Tag,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FOLDER_COLOR_PALETTES } from "@/lib/folder-colors";
import { Badge } from "@/components/ui/badge";

const iconComponents: Record<string, LucideIcon> = {
  file: File,
  "file-text": FileText,
  "file-code": FileCode,
  image: Image,
  music: Music,
  video: Video,
  archive: Archive,
};

interface FileListProps {
  items: GitHubFile[];
  owner: string;
  repo: string;
  selected: Set<string>;
  colors: Record<string, FolderColorName>;
  onSelect: (path: string, e: React.MouseEvent) => void;
  onDelete: (item: GitHubFile) => void;
  onRename: (item: GitHubFile) => void;
  onGetInfo: (item: GitHubFile) => void;
  onDownload: (item: GitHubFile) => void;
  onHistory?: (item: GitHubFile) => void;
  onCut?: (item: GitHubFile) => void;
  onToggleStar?: (item: GitHubFile) => void;
  onEditTags?: (item: GitHubFile) => void;
  isStarred?: (path: string) => boolean;
  getTags?: (path: string) => string[];
  onDropToFolder?: (e: React.DragEvent, destinationPath: string) => void;
  onItemDragStart?: (e: React.DragEvent, item: GitHubFile) => void;
  onOpenItem?: (item: GitHubFile) => void;
  cutPaths?: Set<string>;
}

export function FileList({
  items,
  owner,
  repo,
  selected,
  colors,
  onSelect,
  onDelete,
  onRename,
  onGetInfo,
  onDownload,
  onHistory,
  onCut,
  onToggleStar,
  onEditTags,
  isStarred,
  getTags,
  onDropToFolder,
  onItemDragStart,
  onOpenItem,
  cutPaths,
}: FileListProps) {
  const router = useRouter();

  const handleOpen = (item: GitHubFile) => {
    onOpenItem?.(item);
    if (item.type === "dir") {
      router.push(`/drive/${owner}/${repo}/tree/${item.path}`);
    } else if (isPreviewable(item.name)) {
      router.push(`/preview/${owner}/${repo}/${item.path}`);
    }
  };

  const handleCopyLink = (item: GitHubFile) => {
    const link = item.type === "dir"
      ? `${window.location.origin}/drive/${owner}/${repo}/tree/${item.path}`
      : `${window.location.origin}/preview/${owner}/${repo}/${item.path}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const isCut = (path: string) => cutPaths?.has(path) ?? false;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-foreground/[0.06] text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
        <span className="w-6" />
        <span className="flex-1">Name</span>
        <span className="w-20 text-right hidden sm:block">Size</span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {items.map((item) => {
        const isDir = item.type === "dir";
        const iconType = isDir ? "folder" : getFileIcon(item.name);
        const IconComponent = isDir ? Folder : (iconComponents[iconType] || File);
        const isSelected = selected.has(item.path);
        const starred = isStarred?.(item.path) ?? false;
        const tags = getTags?.(item.path) ?? [];

        return (
          <ContextMenu key={item.path}>
            <ContextMenuTrigger asChild>
              <div
                data-item-path={item.path}
                onClick={(e) => onSelect(item.path, e)}
                onDoubleClick={() => handleOpen(item)}
                draggable
                onDragStart={(e) => onItemDragStart?.(e, item)}
                onDragOver={(e) => {
                  if (!isDir) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (!isDir) return;
                  onDropToFolder?.(e, item.path);
                }}
                className={`flex items-center gap-2 px-3 h-9 transition-colors cursor-default ${
                  isSelected
                    ? "bg-primary/20"
                  : "hover:bg-foreground/[0.04]"
                } ${isCut(item.path) ? "opacity-40" : ""}`}
              >
                <div className="w-6 flex items-center justify-center shrink-0">
                  {isDir ? (
                    <Folder
                      className="h-4 w-4"
                      style={{ color: FOLDER_COLOR_PALETTES[colors[item.path] || "blue"].front }}
                    />
                  ) : (
                    <IconComponent className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </div>
                <span className={`flex-1 text-xs truncate ${
                  isSelected ? "text-foreground font-medium" : "text-foreground"
                }`}>
                  {item.name}
                </span>
                {tags.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                    {tags[0]}
                  </Badge>
                )}
                {starred && (
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                )}
                <span className="w-20 text-right text-[11px] text-muted-foreground hidden sm:block">
                  {!isDir ? formatBytes(item.size) : "—"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpen(item)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCopyLink(item)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRename(item)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onGetInfo(item)}>
                      <Info className="mr-2 h-4 w-4" />
                      Get Info
                    </DropdownMenuItem>
                    {!isDir && onHistory && (
                      <DropdownMenuItem onClick={() => onHistory(item)}>
                        <History className="mr-2 h-4 w-4" />
                        Version History
                      </DropdownMenuItem>
                    )}
                    {onCut && (
                      <DropdownMenuItem onClick={() => onCut(item)}>
                        <Scissors className="mr-2 h-4 w-4" />
                        Cut
                      </DropdownMenuItem>
                    )}
                    {onToggleStar && (
                      <DropdownMenuItem onClick={() => onToggleStar(item)}>
                        <Star className={`mr-2 h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
                        {starred ? "Unstar" : "Star"}
                      </DropdownMenuItem>
                    )}
                    {onEditTags && (
                      <DropdownMenuItem onClick={() => onEditTags(item)}>
                        <Tag className="mr-2 h-4 w-4" />
                        Edit Tags
                      </DropdownMenuItem>
                    )}
                    {!isDir && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDownload(item)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Move to Trash
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleOpen(item)}>
                <Eye className="mr-2 h-4 w-4" />
                Open
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleCopyLink(item)}>
                <Link2 className="mr-2 h-4 w-4" />
                Copy Link
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onRename(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onGetInfo(item)}>
                <Info className="mr-2 h-4 w-4" />
                Get Info
              </ContextMenuItem>
              {!isDir && onHistory && (
                <ContextMenuItem onClick={() => onHistory(item)}>
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </ContextMenuItem>
              )}
              {onCut && (
                <ContextMenuItem onClick={() => onCut(item)}>
                  <Scissors className="mr-2 h-4 w-4" />
                  Cut
                </ContextMenuItem>
              )}
              {onToggleStar && (
                <ContextMenuItem onClick={() => onToggleStar(item)}>
                  <Star className={`mr-2 h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
                  {starred ? "Unstar" : "Star"}
                </ContextMenuItem>
              )}
              {onEditTags && (
                <ContextMenuItem onClick={() => onEditTags(item)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Edit Tags
                </ContextMenuItem>
              )}
              {!isDir && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onDownload(item)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </ContextMenuItem>
                </>
              )}
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onDelete(item)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
