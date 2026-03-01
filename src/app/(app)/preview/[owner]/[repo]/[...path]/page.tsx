"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isImageFile, isTextFile } from "@/lib/utils";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const pathSegments = params.path as string[];
  const filePath = pathSegments.join("/");
  const fileName = pathSegments[pathSegments.length - 1];

  const [content, setContent] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const downloadUrl = `/api/github/download?${new URLSearchParams({ owner, repo, path: filePath })}`;
  const isImage = isImageFile(fileName);
  const isText = isTextFile(fileName);

  useEffect(() => {
    let cancelled = false;

    async function fetchFile() {
      try {
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error(`Failed to load file (${res.status})`);

        if (isImage) {
          const blob = await res.blob();
          if (!cancelled) setBlobUrl(URL.createObjectURL(blob));
        } else if (isText) {
          const text = await res.text();
          if (!cancelled) setContent(text);
        } else {
          if (!cancelled) setError("This file type cannot be previewed.");
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFile();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadUrl, isImage, isText]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--view))]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-[hsl(var(--view))]">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.07] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium truncate flex-1">{fileName}</span>
        <a
          href={downloadUrl}
          download={fileName}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/[0.07] transition-colors"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && isImage && blobUrl && (
          <div className="flex items-center justify-center p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt={fileName}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
          </div>
        )}

        {!loading && !error && isText && content !== null && (
          <pre className="p-6 text-[13px] leading-relaxed text-foreground/90 overflow-auto font-mono whitespace-pre-wrap break-words">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
