"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RepoSelector } from "@/components/drive/repo-selector";
import { Loader2 } from "lucide-react";

export default function DrivePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gitdrive_default_repo");
    if (stored) {
      try {
        const { owner, repo } = JSON.parse(stored);
        if (owner && repo) {
          router.replace(`/drive/${owner}/${repo}`);
          return;
        }
      } catch {
        // invalid stored value, fall through
      }
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <RepoSelector />;
}
