"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageThumbnail({ src, alt, className }: ImageThumbnailProps) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("loading");
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`flex items-center justify-center ${className || ""}`}>
      {state === "idle" && (
        <Skeleton className="h-full w-full rounded" />
      )}
      {state === "loading" && (
        <>
          <Skeleton className="absolute h-full w-full rounded" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover rounded"
            onLoad={() => setState("loaded")}
            onError={() => setState("error")}
          />
        </>
      )}
      {state === "loaded" && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover rounded"
        />
      )}
      {state === "error" && (
        <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60" />
      )}
    </div>
  );
}
