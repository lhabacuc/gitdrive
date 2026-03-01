export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubTree {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubBlob {
  sha: string;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  url: string;
}

export interface GitHubRef {
  ref: string;
  object: {
    sha: string;
    type: string;
  };
}
