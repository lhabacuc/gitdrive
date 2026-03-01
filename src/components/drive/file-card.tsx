"use client";

import { GitHubFile } from "@/types";
import { formatBytes, getFileIcon } from "@/lib/utils";
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
import { Download, Eye, Trash2, Copy, Scissors } from "lucide-react";

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
}

export function FileCard({
  file,
  selected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
}: FileCardProps) {
  const iconType = getFileIcon(file.name);
  const IconComponent = iconComponents[iconType] || File;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-item-path={file.path}
          onClick={onSelect}
          onDoubleClick={onPreview}
          className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            selected
              ? "bg-primary/20"
              : "hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center">
            <IconComponent className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <span
            className={`text-xs leading-tight text-center w-full truncate px-1 rounded ${
              selected ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            {file.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Scissors className="mr-2 h-4 w-4" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </ContextMenuItem>
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
