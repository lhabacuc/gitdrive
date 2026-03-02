"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { useDriveMetadata } from "@/hooks/use-drive-metadata";

export default function RecentPage() {
  const [repo, setRepo] = useState<{ owner: string; repo: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("gitdrive_default_repo");
    if (!stored) return;
    try {
      setRepo(JSON.parse(stored));
    } catch {
      // ignore invalid storage
    }
  }, []);

  const { scopedItems } = useDriveMetadata(repo?.owner, repo?.repo);
  const items = useMemo(
    () =>
      scopedItems
        .filter((item) => !!item.lastOpenedAt)
        .sort(
          (a, b) =>
            new Date(b.lastOpenedAt || 0).getTime() -
            new Date(a.lastOpenedAt || 0).getTime()
        )
        .slice(0, 200),
    [scopedItems]
  );

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Clock className="h-14 w-14 mb-3 opacity-30" />
        <p>Select a repository first</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-3">
      <h1 className="text-base sm:text-lg font-semibold">Recent</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent items yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const href =
              item.type === "dir"
                ? `/drive/${item.owner}/${item.repo}/tree/${item.path}`
                : `/preview/${item.owner}/${item.repo}/${item.path}`;
            return (
              <Link
                key={`${item.owner}-${item.repo}-${item.path}`}
                href={href}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-foreground/[0.04]"
              >
                <div className="min-w-0">
                  <p className="text-sm truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.path} · {new Date(item.lastOpenedAt || "").toLocaleString()}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
