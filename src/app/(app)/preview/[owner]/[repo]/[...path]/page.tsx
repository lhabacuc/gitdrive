"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const isVideo = isVideoFile(fileName);
  const isAudio = isAudioFile(fileName);
  const isPdf = isPdfFile(fileName);
  const isText = isTextFile(fileName);
  const needsBlob = isImage || isVideo || isAudio || isPdf;

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

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const isPdfView = isPdf && blobUrl;

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
          <div className="flex items-center justify-center p-3 sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blobUrl}
              alt={fileName}
              className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg"
            />
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
