"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUpload } from "@/hooks/use-upload";
import { UPLOAD_LIMIT_MAX } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: string;
  repo: string;
  currentPath: string;
}

interface QueuedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function UploadDialog({
  open,
  onOpenChange,
  owner,
  repo,
  currentPath,
}: UploadDialogProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const upload = useUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter((f) => f.size <= UPLOAD_LIMIT_MAX)
      .map((file) => ({ file, status: "pending" as const }));

    const rejected = acceptedFiles.filter((f) => f.size > UPLOAD_LIMIT_MAX);
    if (rejected.length > 0) {
      toast.error(`${rejected.length} file(s) exceed the 100MB limit`);
    }

    setQueue((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
  });

  const handleUpload = async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== "pending") continue;

      setQueue((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const filePath = currentPath
          ? `${currentPath}/${queue[i].file.name}`
          : queue[i].file.name;

        await upload.mutateAsync({
          owner,
          repo,
          path: filePath,
          file: queue[i].file,
        });

        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "done" } : item
          )
        );
      } catch (err) {
        const error = err instanceof Error ? err.message : "Upload failed";
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: "error", error }
              : item
          )
        );
      }
    }
    toast.success("Upload complete");
  };

  const removeFile = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setQueue([]);
    onOpenChange(false);
  };

  const pendingCount = queue.filter((f) => f.status === "pending").length;
  const isUploading = queue.some((f) => f.status === "uploading");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-foreground font-medium">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse (max 100MB per file)
          </p>
        </div>

        {/* File queue */}
        {queue.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-auto scrollbar-thin">
            {queue.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
              >
                {item.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : item.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                ) : item.status === "uploading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                ) : (
                  <File className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(item.file.size)}
                    {item.error && (
                      <span className="text-destructive ml-2">{item.error}</span>
                    )}
                  </p>
                </div>
                {item.status === "pending" && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={pendingCount === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
