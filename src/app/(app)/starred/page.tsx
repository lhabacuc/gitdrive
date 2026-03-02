"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { useDriveMetadata } from "@/hooks/use-drive-metadata";

export default function StarredPage() {
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
        .filter((item) => !!item.starred)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 500),
    [scopedItems]
  );

  if (!repo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Star className="h-14 w-14 mb-3 opacity-30" />
        <p>Select a repository first</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-3">
      <h1 className="text-base sm:text-lg font-semibold">Starred</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No starred items yet.</p>
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
                    {item.path}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
