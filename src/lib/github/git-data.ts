import { Octokit } from "@octokit/rest";

export async function createBlob(
  octokit: Octokit,
  owner: string,
  repo: string,
  content: string,
  encoding: "base64" | "utf-8" = "base64"
) {
  const { data } = await octokit.git.createBlob({
    owner,
    repo,
    content,
    encoding,
  });
  return data;
}

export async function getTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  treeSha: string,
  recursive = false
) {
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: recursive ? "1" : undefined,
  });
  return data;
}

export async function createTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  tree: Array<{
    path: string;
    mode: "100644" | "100755" | "040000" | "160000" | "120000";
    type: "blob" | "tree" | "commit";
    sha: string | null;
  }>,
  baseTree?: string
) {
  const { data } = await octokit.git.createTree({
    owner,
    repo,
    tree,
    base_tree: baseTree,
  });
  return data;
}

export async function createCommit(
  octokit: Octokit,
  owner: string,
  repo: string,
  message: string,
  treeSha: string,
  parentSha: string
) {
  const { data } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: treeSha,
    parents: [parentSha],
  });
  return data;
}

export async function updateRef(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  sha: string
) {
  const { data } = await octokit.git.updateRef({
    owner,
    repo,
    ref,
    sha,
  });
  return data;
}

export async function uploadLargeFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = "main"
) {
  // 1. Create blob
  const blob = await createBlob(octokit, owner, repo, content, "base64");

  // 2. Get current ref
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestCommitSha = refData.object.sha;

  // 3. Get current commit's tree
  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });
  const baseTreeSha = commitData.tree.sha;

  // 4. Create new tree with the file
  const newTree = await createTree(
    octokit,
    owner,
    repo,
    [
      {
        path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      },
    ],
    baseTreeSha
  );

  // 5. Create commit
  const newCommit = await createCommit(
    octokit,
    owner,
    repo,
    message,
    newTree.sha,
    latestCommitSha
  );

  // 6. Update ref
  await updateRef(octokit, owner, repo, `heads/${branch}`, newCommit.sha);

  return { sha: blob.sha, commit: newCommit.sha };
}

export async function renameFolder(
  octokit: Octokit,
  owner: string,
  repo: string,
  oldPath: string,
  newPath: string,
  message: string,
  branch: string = "main"
) {
  // 1. Get current ref
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestCommitSha = refData.object.sha;

  // 2. Get full tree
  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });

  const fullTree = await getTree(octokit, owner, repo, commitData.tree.sha, true);

  // 3. Remap paths: items under oldPath get new prefix
  const normalizedOld = oldPath.endsWith("/") ? oldPath : oldPath + "/";
  const newTreeItems = fullTree.tree
    .filter((item) => item.type === "blob")
    .map((item) => {
      let path = item.path!;
      if (path.startsWith(normalizedOld)) {
        path = newPath + "/" + path.slice(normalizedOld.length);
      }
      return {
        path,
        mode: item.mode as "100644",
        type: "blob" as const,
        sha: item.sha!,
      };
    });

  // 4. Create new tree (rebuild from scratch)
  const newTree = await createTree(octokit, owner, repo, newTreeItems);

  // 5. Create commit
  const newCommit = await createCommit(
    octokit,
    owner,
    repo,
    message,
    newTree.sha,
    latestCommitSha
  );

  // 6. Update ref
  await updateRef(octokit, owner, repo, `heads/${branch}`, newCommit.sha);

  return { commit: newCommit.sha };
}

export async function deleteFolder(
  octokit: Octokit,
  owner: string,
  repo: string,
  folderPath: string,
  message: string,
  branch: string = "main"
) {
  // 1. Get current ref
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const latestCommitSha = refData.object.sha;

  // 2. Get full tree
  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });

  const fullTree = await getTree(octokit, owner, repo, commitData.tree.sha, true);

  // 3. Filter out items under the folder
  const normalizedPath = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  const newTreeItems = fullTree.tree
    .filter((item) => {
      return item.path !== folderPath && !item.path.startsWith(normalizedPath);
    })
    .filter((item) => item.type === "blob")
    .map((item) => ({
      path: item.path!,
      mode: item.mode as "100644",
      type: "blob" as const,
      sha: item.sha!,
    }));

  // 4. Create new tree (without base_tree to rebuild from scratch)
  const newTree = await createTree(octokit, owner, repo, newTreeItems);

  // 5. Create commit
  const newCommit = await createCommit(
    octokit,
    owner,
    repo,
    message,
    newTree.sha,
    latestCommitSha
  );

  // 6. Update ref
  await updateRef(octokit, owner, repo, `heads/${branch}`, newCommit.sha);

  return { commit: newCommit.sha };
}
