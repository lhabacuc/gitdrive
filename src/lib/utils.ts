import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const iconMap: Record<string, string> = {
    // Images
    png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image", webp: "image", ico: "image", bmp: "image",
    // Documents
    pdf: "file-text", doc: "file-text", docx: "file-text", txt: "file-text", rtf: "file-text",
    // Code
    js: "file-code", ts: "file-code", jsx: "file-code", tsx: "file-code", py: "file-code",
    rb: "file-code", go: "file-code", rs: "file-code", java: "file-code", c: "file-code",
    cpp: "file-code", h: "file-code", css: "file-code", scss: "file-code", html: "file-code",
    xml: "file-code", json: "file-code", yaml: "file-code", yml: "file-code", toml: "file-code",
    md: "file-code", sh: "file-code", bash: "file-code", zsh: "file-code",
    // Archives
    zip: "archive", tar: "archive", gz: "archive", rar: "archive", "7z": "archive",
    // Media
    mp3: "music", wav: "music", flac: "music", mp4: "video", mkv: "video", avi: "video", mov: "video",
  };
  return iconMap[ext] || "file";
}

export function isPreviewable(filename: string): boolean {
  const ext = getFileExtension(filename);
  const previewable = [
    "png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico",
    "txt", "md", "json", "js", "ts", "jsx", "tsx", "py", "rb",
    "go", "rs", "java", "c", "cpp", "h", "css", "scss", "html",
    "xml", "yaml", "yml", "toml", "sh", "bash", "zsh", "sql",
    "env", "gitignore", "dockerignore", "makefile", "dockerfile",
    "csv", "log", "cfg", "ini", "conf",
    "pdf",
    "mp4", "webm", "mov",
    "mp3", "wav", "ogg", "flac", "aac",
  ];
  return previewable.includes(ext) || filename.toLowerCase() === "makefile" || filename.toLowerCase() === "dockerfile";
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(ext);
}

export function isTextFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const textExts = [
    "txt", "md", "json", "js", "ts", "jsx", "tsx", "py", "rb",
    "go", "rs", "java", "c", "cpp", "h", "css", "scss", "html",
    "xml", "yaml", "yml", "toml", "sh", "bash", "zsh", "sql",
    "env", "gitignore", "dockerignore", "csv", "log", "cfg", "ini", "conf",
  ];
  return textExts.includes(ext) || filename.toLowerCase() === "makefile" || filename.toLowerCase() === "dockerfile";
}

export function isMarkdownFile(filename: string): boolean {
  return getFileExtension(filename) === "md";
}

export function isCodeFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  const codeExts = [
    "js", "ts", "jsx", "tsx", "py", "rb", "go", "rs", "java",
    "c", "cpp", "h", "css", "scss", "html", "xml", "json",
    "yaml", "yml", "toml", "sh", "bash", "zsh", "sql",
  ];
  return codeExts.includes(ext);
}

export function getLanguageFromExtension(filename: string): string {
  const ext = getFileExtension(filename);
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    css: "css",
    scss: "scss",
    html: "html",
    xml: "xml",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    sql: "sql",
  };
  return langMap[ext] || "text";
}

export function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["mp4", "webm", "mov"].includes(ext);
}

export function isAudioFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["mp3", "wav", "ogg", "flac", "aac"].includes(ext);
}

export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === "pdf";
}
