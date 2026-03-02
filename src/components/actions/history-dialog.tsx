"use client";

import { GitHubFile } from "@/types";
import { useFileHistory } from "@/hooks/use-file-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, History } from "lucide-react";

interface HistoryDialogProps {
  item: GitHubFile | null;
  owner: string;
  repo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({
  item,
  owner,
  repo,
  open,
  onOpenChange,
}: HistoryDialogProps) {
  const { data: history, isLoading } = useFileHistory(
    owner,
    repo,
    item?.path || "",
    open && !!item
  );

  const handleDownloadVersion = (sha: string) => {
    if (!item) return;
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${item.path}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = item.name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
        </DialogHeader>
        {item && (
          <p className="text-xs text-muted-foreground truncate">{item.path}</p>
        )}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-1">
              {history.map((commit) => (
                <div
                  key={commit.sha}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-foreground/[0.04] transition-colors"
                >
                  {commit.author.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={commit.author.avatar_url}
                      alt={commit.author.name}
                      className="h-7 w-7 rounded-full shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {commit.message.split("\n")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {commit.author.name} &middot; {formatDate(commit.date)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {commit.sha.slice(0, 7)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleDownloadVersion(commit.sha)}
                    title="Download this version"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No history found
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
