"use client";

import { Button } from "@/components/ui/button";
import { Archive, Download, MoveRight, Trash2, X } from "lucide-react";

interface SelectionToolbarProps {
  count: number;
  onDownload: () => void;
  onMove: () => void;
  onExtract?: () => void;
  canExtract?: boolean;
  onDelete: () => void;
  onDeselect: () => void;
  downloading?: boolean;
}

export function SelectionToolbar({
  count,
  onDownload,
  onMove,
  onExtract,
  canExtract,
  onDelete,
  onDeselect,
  downloading,
}: SelectionToolbarProps) {
  return (
    <div className="flex h-9 items-center justify-between bg-primary/10 border-t border-primary/20 px-3 shrink-0">
      <span className="text-xs font-medium text-primary">
        {count} selected
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={onDownload}
          disabled={downloading}
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Zipping..." : "Download"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={onMove}
        >
          <MoveRight className="h-3.5 w-3.5" />
          Move
        </Button>
        {canExtract && onExtract && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onExtract}
          >
            <Archive className="h-3.5 w-3.5" />
            Extract ZIP
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDeselect}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
