"use client";

import { useCallback, useRef } from "react";
import { GitHubFile, FolderColorName } from "@/types";
import { FolderOpen, Trash2, Link2, Pencil, Info } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { fetchContents } from "@/hooks/use-github-contents";
import { FOLDER_COLOR_PALETTES, FOLDER_COLOR_NAMES } from "@/lib/folder-colors";
import { toast } from "sonner";

interface FolderCardProps {
  folder: GitHubFile;
  href: string;
  owner: string;
  repo: string;
  selected?: boolean;
  colorName?: FolderColorName;
  onSelect?: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onColorChange?: (color: FolderColorName) => void;
  onRename?: () => void;
  onGetInfo?: () => void;
}

function AdwaitaFolderIcon({
  className,
  colorName = "blue",
}: {
  className?: string;
  colorName?: FolderColorName;
}) {
  const palette = FOLDER_COLOR_PALETTES[colorName];
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shadow */}
      <path
        d="M6 22C6 18.6863 8.68629 16 12 16H26L32 22H52C55.3137 22 58 24.6863 58 28V48C58 51.3137 55.3137 54 52 54H12C8.68629 54 6 51.3137 6 48V22Z"
        fill={palette.shadow}
      />
      {/* Back */}
      <path
        d="M6 20C6 16.6863 8.68629 14 12 14H26L32 20H52C55.3137 20 58 22.6863 58 26V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V20Z"
        fill={palette.back}
      />
      {/* Front */}
      <path
        d="M6 28C6 25.7909 7.79086 24 10 24H54C56.2091 24 58 25.7909 58 28V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V28Z"
        fill={palette.front}
      />
      {/* Top highlight */}
      <path
        d="M10 24H54C56.2091 24 58 25.7909 58 28V30H6V28C6 25.7909 7.79086 24 10 24Z"
        fill={palette.highlight}
        opacity="0.4"
      />
    </svg>
  );
}

export function FolderCard({
  folder,
  href,
  owner,
  repo,
  selected,
  colorName = "blue",
  onSelect,
  onDelete,
  onColorChange,
  onRename,
  onGetInfo,
}: FolderCardProps) {
  const queryClient = useQueryClient();
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ["contents", owner, repo, folder.path],
        queryFn: () => fetchContents(owner, repo, folder.path),
      });
    }, 150);
  }, [queryClient, owner, repo, folder.path]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/drive/${owner}/${repo}/tree/${folder.path}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-item-path={folder.path}
          onClick={onSelect}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            selected
              ? "bg-primary/20"
              : "hover:bg-white/[0.04]"
          }`}
        >
          <Link href={href} className="flex flex-col items-center gap-1.5 w-full">
            <AdwaitaFolderIcon className="h-16 w-16" colorName={colorName} />
            <span
              className={`text-xs leading-tight text-center w-full truncate px-1 rounded ${
                selected ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {folder.name}
            </span>
          </Link>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <Link href={href} className="flex items-center">
            <FolderOpen className="mr-2 h-4 w-4" />
            Open
          </Link>
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
        {onColorChange && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <div
                  className="mr-2 h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: FOLDER_COLOR_PALETTES[colorName].front }}
                />
                Colour
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="p-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {FOLDER_COLOR_NAMES.map((c) => (
                    <button
                      key={c}
                      onClick={() => onColorChange(c)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        c === colorName
                          ? "border-white"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: FOLDER_COLOR_PALETTES[c].front,
                      }}
                      title={c.charAt(0).toUpperCase() + c.slice(1)}
                    />
                  ))}
                </div>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
