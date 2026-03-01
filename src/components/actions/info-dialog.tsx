"use client";

import { GitHubFile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface InfoDialogProps {
  item: GitHubFile | null;
  owner: string;
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ label, value, copyable, href }: {
  label: string;
  value: string;
  copyable?: boolean;
  href?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-[13px] text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-primary hover:underline truncate"
          >
            {value}
          </a>
        ) : (
          <span className="text-[13px] text-foreground truncate">{value}</span>
        )}
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={() => {
              navigator.clipboard.writeText(href || value);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        )}
      </div>
    </div>
  );
}

export function InfoDialog({
  item,
  owner,
  repo,
  open,
  onOpenChange,
}: InfoDialogProps) {
  if (!item) return null;

  const shareLink = typeof window !== "undefined"
    ? item.type === "dir"
      ? `${window.location.origin}/drive/${owner}/${repo}/tree/${item.path}`
      : `${window.location.origin}/preview/${owner}/${repo}/${item.path}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Info</DialogTitle>
        </DialogHeader>
        <div className="divide-y divide-white/[0.06]">
          <InfoRow label="Name" value={item.name} />
          <InfoRow label="Type" value={item.type === "dir" ? "Folder" : "File"} />
          <InfoRow label="Path" value={item.path} copyable />
          {item.type === "file" && (
            <InfoRow label="Size" value={formatBytes(item.size)} />
          )}
          <InfoRow
            label="SHA"
            value={item.sha.slice(0, 12)}
            copyable
          />
          <InfoRow
            label="GitHub"
            value="Open on GitHub"
            href={item.html_url}
          />
          {shareLink && (
            <InfoRow
              label="Share Link"
              value={shareLink}
              copyable
              href={shareLink}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
