"use client";

import { useMoveToTrash } from "@/hooks/use-trash";
import { GitHubFile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeleteDialogProps {
  item: GitHubFile | null;
  owner: string;
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({
  item,
  owner,
  repo,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const trashMutation = useMoveToTrash();

  const handleDelete = async () => {
    if (!item) return;

    try {
      await trashMutation.mutateAsync({
        owner,
        repo,
        path: item.path,
        type: item.type,
        name: item.name,
        sha: item.sha,
        size: item.size,
      });
      toast.success(`"${item.name}" moved to trash`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete {item?.type === "dir" ? "Folder" : "File"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to move <strong>{item?.name}</strong> to trash?
            {item?.type === "dir" && " This will move all files inside this folder."}
            {" "}You can restore it from the Trash page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={trashMutation.isPending}
          >
            {trashMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move to Trash"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
