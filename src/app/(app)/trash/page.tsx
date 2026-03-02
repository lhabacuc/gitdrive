"use client";

import { useEffect, useState } from "react";
import { TrashItem } from "@/types";
import { useTrashItems, useRestoreFromTrash, useDeleteForever } from "@/hooks/use-trash";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, RotateCcw, AlertTriangle, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TrashPage() {
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(null);
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gitdrive_default_repo");
    if (stored) {
      try {
        setRepo(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const { data: items, isLoading } = useTrashItems(repo?.owner, repo?.repo);
  const restoreMutation = useRestoreFromTrash();
  const deleteForever = useDeleteForever();

  const handleRestore = async (item: TrashItem) => {
    if (!repo) return;
    try {
      await restoreMutation.mutateAsync({
        owner: repo.owner,
        repo: repo.repo,
        trashItem: item,
      });
      toast.success(`"${item.name}" restored`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore");
    }
  };

  const handleDeleteForever = async (item: TrashItem) => {
    if (!repo) return;
    try {
      await deleteForever.mutateAsync({
        owner: repo.owner,
        repo: repo.repo,
        trashItem: item,
      });
      toast.success(`"${item.name}" permanently deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleEmptyTrash = async () => {
    if (!repo) return;
    try {
      await deleteForever.mutateAsync({
        owner: repo.owner,
        repo: repo.repo,
        emptyAll: true,
      });
      toast.success("Trash emptied");
      setEmptyConfirmOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to empty trash");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Trash2 className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-base">Select a repository first</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Trash</h1>
          <p className="text-xs text-muted-foreground">
            Items older than 30 days are automatically deleted
          </p>
        </div>
        {items && items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive gap-1.5"
            onClick={() => setEmptyConfirmOpen(true)}
          >
            <Trash className="h-3.5 w-3.5" />
            Empty Trash
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-3 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Trash2 className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-base">Trash is empty</p>
          </div>
        ) : (
          <div className="space-y-1 pb-6">
            {items.map((item) => (
              <div
                key={item.trashPath}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-foreground/[0.04] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.originalPath} &middot; Deleted {formatDate(item.deletedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleRestore(item)}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteForever(item)}
                    disabled={deleteForever.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty Trash Confirmation */}
      <Dialog open={emptyConfirmOpen} onOpenChange={setEmptyConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty Trash
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all {items?.length} items
              in trash? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEmptyConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmptyTrash}
              disabled={deleteForever.isPending}
            >
              {deleteForever.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Emptying...
                </>
              ) : (
                "Empty Trash"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
