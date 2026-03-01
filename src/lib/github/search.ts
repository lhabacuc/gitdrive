import { Octokit } from "@octokit/rest";
import { getTree } from "./git-data";

export async function searchFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  query: string,
  branch: string = "main"
) {
  // Get the full tree recursively
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: refData.object.sha,
  });

  const tree = await getTree(octokit, owner, repo, commitData.tree.sha, true);

  // Filter items matching the query
  const lowerQuery = query.toLowerCase();
  const results = tree.tree
    .filter((item) => {
      const name = item.path?.split("/").pop() || "";
      return (
        item.type === "blob" &&
        (name.toLowerCase().includes(lowerQuery) ||
          item.path?.toLowerCase().includes(lowerQuery))
      );
    })
    .slice(0, 50)
    .map((item) => ({
      name: item.path?.split("/").pop() || "",
      path: item.path || "",
      sha: item.sha,
      size: item.size || 0,
      type: "file" as const,
      download_url: null,
      html_url: `https://github.com/${owner}/${repo}/blob/${branch}/${item.path}`,
    }));

  return results;
}
