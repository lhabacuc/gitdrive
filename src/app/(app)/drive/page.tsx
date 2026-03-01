"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RepoSelector } from "@/components/drive/repo-selector";
import { Loader2 } from "lucide-react";

export default function DrivePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function resolveDefaultRepo() {
      // 1. Check localStorage first (fastest)
      const stored = localStorage.getItem("gitdrive_default_repo");
      if (stored) {
        try {
          const { owner, repo } = JSON.parse(stored);
          if (owner && repo) {
            router.replace(`/drive/${owner}/${repo}`);
            return;
          }
        } catch {
          // invalid stored value, continue to server check
        }
      }

      // 2. No localStorage — try to discover from saved configs in GitHub repos
      try {
        const res = await fetch("/api/github/default-repo");
        if (res.ok) {
          const data = await res.json();
          if (data.defaultRepo) {
            const { owner, repo } = data.defaultRepo;
            // Restore to localStorage for next time
            localStorage.setItem(
              "gitdrive_default_repo",
              JSON.stringify({ owner, repo })
            );
            router.replace(`/drive/${owner}/${repo}`);
            return;
          }
        }
      } catch {
        // API failed, show repo selector
      }

      setChecking(false);
    }

    resolveDefaultRepo();
  }, [router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading your drive...</p>
      </div>
    );
  }

  return <RepoSelector />;
}
