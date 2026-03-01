"use client";

import { useDelete } from "@/hooks/use-delete";
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
  const deleteMutation = useDelete();

  const handleDelete = async () => {
    if (!item) return;

    try {
      await deleteMutation.mutateAsync({
        owner,
        repo,
        path: item.path,
        sha: item.sha,
        type: item.type,
      });
      toast.success(`"${item.name}" deleted`);
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
            Are you sure you want to delete <strong>{item?.name}</strong>?
            {item?.type === "dir" && " This will delete all files inside this folder."}
            {" "}This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
