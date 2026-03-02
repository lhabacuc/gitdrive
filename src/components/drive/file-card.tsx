"use client";

import { GitHubFile } from "@/types";
import { formatBytes, getFileIcon, isImageFile } from "@/lib/utils";
import {
  File, FileText, FileCode, Image, Music, Video, Archive,
  type LucideIcon,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Download,
  Eye,
  Trash2,
  Link2,
  Pencil,
  Info,
  History,
  Scissors,
  Star,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { ImageThumbnail } from "./image-thumbnail";
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

interface FileCardProps {
  file: GitHubFile;
  owner: string;
  repo: string;
  selected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onRename?: () => void;
  onGetInfo?: () => void;
  onHistory?: () => void;
  onCut?: () => void;
  onToggleStar?: () => void;
  onEditTags?: () => void;
  starred?: boolean;
  tags?: string[];
  onItemDragStart?: (e: React.DragEvent, file: GitHubFile) => void;
  isCut?: boolean;
}

export function FileCard({
  file,
  owner,
  repo,
  selected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  onRename,
  onGetInfo,
  onHistory,
  onCut,
  onToggleStar,
  onEditTags,
  starred,
  tags = [],
  onItemDragStart,
  isCut,
}: FileCardProps) {
  const iconType = getFileIcon(file.name);
  const IconComponent = iconComponents[iconType] || File;
  const showThumbnail = isImageFile(file.name) && file.download_url;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/preview/${owner}/${repo}/${file.path}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-item-path={file.path}
          onClick={onSelect}
          onDoubleClick={onPreview}
          draggable
          onDragStart={(e) => onItemDragStart?.(e, file)}
          className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            selected
              ? "bg-primary/20"
              : "hover:bg-foreground/[0.04] active:bg-foreground/[0.08]"
          } ${isCut ? "opacity-40" : ""}`}
        >
          {starred && (
            <Star className="absolute right-1 top-1 h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          )}
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center relative overflow-hidden rounded">
            {showThumbnail ? (
              <ImageThumbnail
                src={file.download_url!}
                alt={file.name}
                className="h-12 w-12 sm:h-16 sm:w-16"
              />
            ) : (
              <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60" />
            )}
          </div>
          <span
            className={`text-[11px] sm:text-xs leading-tight text-center w-full truncate px-1 rounded ${
              selected ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            {file.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatBytes(file.size)}
          </span>
          {tags.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              {tags[0]}
            </Badge>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleCopyLink}>
          <Link2 className="mr-2 h-4 w-4" />
          Copy Link
        </ContextMenuItem>
        {onRename && (
          <ContextMenuItem onClick={onRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
        )}
        {onGetInfo && (
          <ContextMenuItem onClick={onGetInfo}>
            <Info className="mr-2 h-4 w-4" />
            Get Info
          </ContextMenuItem>
        )}
        {onHistory && (
          <ContextMenuItem onClick={onHistory}>
            <History className="mr-2 h-4 w-4" />
            Version History
          </ContextMenuItem>
        )}
        {onCut && (
          <ContextMenuItem onClick={onCut}>
            <Scissors className="mr-2 h-4 w-4" />
            Cut
          </ContextMenuItem>
        )}
        {onToggleStar && (
          <ContextMenuItem onClick={onToggleStar}>
            <Star className={`mr-2 h-4 w-4 ${starred ? "fill-amber-400 text-amber-400" : ""}`} />
            {starred ? "Unstar" : "Star"}
          </ContextMenuItem>
        )}
        {onEditTags && (
          <ContextMenuItem onClick={onEditTags}>
            <Tag className="mr-2 h-4 w-4" />
            Edit Tags
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
