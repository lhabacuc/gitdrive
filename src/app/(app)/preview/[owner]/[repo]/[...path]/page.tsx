"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  isImageFile,
  isTextFile,
  isMarkdownFile,
  isCodeFile,
  getLanguageFromExtension,
  isVideoFile,
  isAudioFile,
  isPdfFile,
} from "@/lib/utils";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/preview/markdown-renderer";
import { CodeRenderer } from "@/components/preview/code-renderer";
import { MediaPlayer } from "@/components/preview/media-player";
import { PdfViewer } from "@/components/preview/pdf-viewer";
import { useDriveMetadata } from "@/hooks/use-drive-metadata";

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
  const [siblingImages, setSiblingImages] = useState<string[]>([]);
  const { addRecent } = useDriveMetadata(owner, repo);

  const downloadUrl = `/api/github/download?${new URLSearchParams({ owner, repo, path: filePath })}`;
  const isImage = isImageFile(fileName);
  const isVideo = isVideoFile(fileName);
  const isAudio = isAudioFile(fileName);
  const isPdf = isPdfFile(fileName);
  const isText = isTextFile(fileName);
  const needsBlob = isImage || isVideo || isAudio || isPdf;
  const parentDir = filePath.includes("/") ? filePath.split("/").slice(0, -1).join("/") : "";

  useEffect(() => {
    let cancelled = false;

    async function fetchFile() {
      try {
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error(`Failed to load file (${res.status})`);

        if (needsBlob) {
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadUrl, needsBlob, isText]);

  useEffect(() => {
    addRecent({
      owner,
      repo,
      path: filePath,
      name: fileName,
      type: "file",
    });
  }, [addRecent, fileName, filePath, owner, repo]);

  useEffect(() => {
    if (!isImage) return;
    let cancelled = false;
    async function loadSiblingImages() {
      try {
        const params = new URLSearchParams({ owner, repo, path: parentDir });
        const res = await fetch(`/api/github/contents?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        const files = Array.isArray(data) ? data : [data];
        const images = files
          .filter((f: { type: string; name: string; path: string }) => f.type === "file" && isImageFile(f.name))
          .map((f: { path: string }) => f.path)
          .sort();
        if (!cancelled) setSiblingImages(images);
      } catch {
        // ignore gallery loading errors
      }
    }
    loadSiblingImages();
    return () => {
      cancelled = true;
    };
  }, [isImage, owner, repo, parentDir]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const isPdfView = isPdf && blobUrl;
  const imageIndex = siblingImages.findIndex((p) => p === filePath);
  const prevImage = imageIndex > 0 ? siblingImages[imageIndex - 1] : null;
  const nextImage =
    imageIndex >= 0 && imageIndex < siblingImages.length - 1
      ? siblingImages[imageIndex + 1]
      : null;

  const openImage = useCallback((path: string | null) => {
    if (!path) return;
    router.push(`/preview/${owner}/${repo}/${path}`);
  }, [owner, repo, router]);

  useEffect(() => {
    if (!isImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") openImage(prevImage);
      if (e.key === "ArrowRight") openImage(nextImage);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isImage, prevImage, nextImage, openImage]);

  return (
    <div className={`flex flex-col h-full bg-[hsl(var(--view))] ${isPdfView ? "overflow-hidden" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border-b border-foreground/[0.06] bg-[hsl(var(--view))] shrink-0">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/[0.07] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <span className="text-xs sm:text-sm font-medium truncate flex-1 min-w-0">{fileName}</span>
        <a
          href={downloadUrl}
          download={fileName}
          className="rounded-lg p-2 text-muted-foreground hover:bg-foreground/[0.07] transition-colors"
        >
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
      </div>

      {/* Content */}
      <div className={isPdfView ? "flex-1 overflow-hidden" : "flex-1 overflow-auto"}>
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-24 text-muted-foreground px-4">
            <p className="text-sm text-center">{error}</p>
          </div>
        )}

        {!loading && !error && isImage && blobUrl && (
          <div className="relative flex items-center justify-center p-3 sm:p-8">
            <button
              onClick={() => openImage(prevImage)}
              disabled={!prevImage}
              className="absolute left-2 sm:left-4 rounded-lg bg-background/70 px-2 py-1 text-sm disabled:opacity-30"
            >
              ←
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg"
            />
            <button
              onClick={() => openImage(nextImage)}
              disabled={!nextImage}
              className="absolute right-2 sm:right-4 rounded-lg bg-background/70 px-2 py-1 text-sm disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        {!loading && !error && isPdf && blobUrl && (
          <PdfViewer blobUrl={blobUrl} />
        )}

        {!loading && !error && (isVideo || isAudio) && blobUrl && (
          <MediaPlayer
            blobUrl={blobUrl}
            type={isVideo ? "video" : "audio"}
            fileName={fileName}
          />
        )}

        {!loading && !error && isText && content !== null && (
          isMarkdownFile(fileName) ? (
            <MarkdownRenderer content={content} />
          ) : isCodeFile(fileName) ? (
            <CodeRenderer
              content={content}
              language={getLanguageFromExtension(fileName)}
            />
          ) : (
            <pre className="p-3 sm:p-6 text-xs sm:text-[13px] leading-relaxed text-foreground/90 overflow-auto font-mono whitespace-pre-wrap break-words">
              {content}
            </pre>
          )
        )}
      </div>
    </div>
  );
}
