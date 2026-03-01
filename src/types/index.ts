export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
  html_url: string;
  content?: string;
  encoding?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  default_branch: string;
  size: number;
  updated_at: string;
  pushed_at: string;
}

export interface UploadFile {
  file: File;
  path: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface DriveConfig {
  defaultRepo: { owner: string; repo: string } | null;
  displayName: string;
  viewMode: "grid" | "list";
  sortBy: "name" | "size" | "date";
  sortOrder: "asc" | "desc";
  showHiddenFiles: boolean;
  uploadLimitMB: number;
}
