"use client";

import { GitHubFile } from "@/types";
import { Trash2, FolderOpen } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import Link from "next/link";

interface FolderCardProps {
  folder: GitHubFile;
  href: string;
  selected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

function AdwaitaFolderIcon({ className }: { className?: string }) {
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
        fill="#1a5fb4"
      />
      {/* Back */}
      <path
        d="M6 20C6 16.6863 8.68629 14 12 14H26L32 20H52C55.3137 20 58 22.6863 58 26V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V20Z"
        fill="#3584e4"
      />
      {/* Front */}
      <path
        d="M6 28C6 25.7909 7.79086 24 10 24H54C56.2091 24 58 25.7909 58 28V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V28Z"
        fill="#62a0ea"
      />
      {/* Top highlight */}
      <path
        d="M10 24H54C56.2091 24 58 25.7909 58 28V30H6V28C6 25.7909 7.79086 24 10 24Z"
        fill="#99c1f1"
        opacity="0.4"
      />
    </svg>
  );
}

export function FolderCard({ folder, href, selected, onSelect, onDelete }: FolderCardProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-item-path={folder.path}
          onClick={onSelect}
          className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            selected
              ? "bg-primary/20"
              : "hover:bg-white/[0.04]"
          }`}
        >
          <Link href={href} className="flex flex-col items-center gap-1.5 w-full">
            <AdwaitaFolderIcon className="h-16 w-16" />
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
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
