"use client";

interface MediaPlayerProps {
  blobUrl: string;
  type: "video" | "audio";
  fileName: string;
}

export function MediaPlayer({ blobUrl, type, fileName }: MediaPlayerProps) {
  if (type === "video") {
    return (
      <div className="flex items-center justify-center p-3 sm:p-8">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={blobUrl}
          controls
          className="max-w-full max-h-[75vh] rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 sm:p-16">
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <p className="text-sm text-muted-foreground">{fileName}</p>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={blobUrl} controls className="w-full">
          Your browser does not support the audio tag.
        </audio>
      </div>
    </div>
  );
}
