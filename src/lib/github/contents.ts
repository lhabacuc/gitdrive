import { Octokit } from "@octokit/rest";

export async function getContents(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string = ""
) {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });
  return data;
}

export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
) {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (Array.isArray(data)) {
    throw new Error("Path is a directory, not a file");
  }

  return data;
}

export async function uploadFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
) {
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content,
    sha,
  });
  return data;
}

export async function deleteFile(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string
) {
  const { data } = await octokit.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha,
  });
  return data;
}
