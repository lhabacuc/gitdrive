"use client";

import { useState, useEffect } from "react";
import { useRename } from "@/hooks/use-rename";
import { GitHubFile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RenameDialogProps {
  item: GitHubFile | null;
  owner: string;
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameDialog({
  item,
  owner,
  repo,
  open,
  onOpenChange,
}: RenameDialogProps) {
  const [name, setName] = useState("");
  const renameMutation = useRename();

  useEffect(() => {
    if (item && open) {
      setName(item.name);
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !name.trim() || name.trim() === item.name) return;

    const dirPath = item.path.split("/").slice(0, -1).join("/");
    const newPath = dirPath ? `${dirPath}/${name.trim()}` : name.trim();

    try {
      await renameMutation.mutateAsync({
        owner,
        repo,
        oldPath: item.path,
        newPath,
        type: item.type,
        sha: item.sha,
      });
      toast.success(`Renamed to "${name.trim()}"`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename {item?.type === "dir" ? "Folder" : "File"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-input">Name</Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new name"
              autoFocus
              onFocus={(e) => {
                // Select name without extension for files
                if (item?.type === "file") {
                  const dotIndex = e.target.value.lastIndexOf(".");
                  if (dotIndex > 0) {
                    e.target.setSelectionRange(0, dotIndex);
                  } else {
                    e.target.select();
                  }
                } else {
                  e.target.select();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() ||
                name.trim() === item?.name ||
                renameMutation.isPending
              }
            >
              {renameMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
