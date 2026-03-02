"use client";

interface PdfViewerProps {
  blobUrl: string;
}

export function PdfViewer({ blobUrl }: PdfViewerProps) {
  return (
    <iframe
      src={blobUrl}
      className="w-full h-full border-0"
      title="PDF Preview"
    />
  );
}
