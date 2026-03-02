import { Octokit } from "@octokit/rest";
import { TrashItem } from "@/types";
import { TRASH_FOLDER, TRASH_MANIFEST_PATH, TRASH_RETENTION_DAYS } from "@/lib/constants";
import { getFileContent, uploadFile } from "./contents";
import { renameFolder } from "./git-data";

interface TrashManifest {
  items: TrashItem[];
}

function getBase64ContentOrThrow(
  file: Awaited<ReturnType<typeof getFileContent>>,
  path: string
): string {
  if (file.type !== "file") {
    throw new Error(`Expected file at ${path}, got ${file.type}`);
  }
  return file.content || "";
}

export async function getTrashManifest(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ manifest: TrashManifest; sha: string | null }> {
  try {
    const file = await getFileContent(octokit, owner, repo, TRASH_MANIFEST_PATH);
    const content = Buffer.from(
      getBase64ContentOrThrow(file, TRASH_MANIFEST_PATH),
      "base64"
    ).toString("utf-8");
    return { manifest: JSON.parse(content), sha: file.sha };
  } catch {
    return { manifest: { items: [] }, sha: null };
  }
}

export async function updateTrashManifest(
  octokit: Octokit,
  owner: string,
  repo: string,
  manifest: TrashManifest,
  sha: string | null
): Promise<string> {
  const content = Buffer.from(JSON.stringify(manifest, null, 2)).toString("base64");
  const result = await uploadFile(
    octokit,
    owner,
    repo,
    TRASH_MANIFEST_PATH,
    content,
    "Update trash manifest",
    sha || undefined
  );
  return result.content?.sha || "";
}

export async function moveToTrash(
  octokit: Octokit,
  owner: string,
  repo: string,
  item: { path: string; type: "file" | "dir"; name: string; sha?: string; size?: number },
  branch: string = "main"
): Promise<void> {
  const timestamp = Date.now();
  const trashPath = `${TRASH_FOLDER}/${timestamp}_${item.name}`;

  // Get current manifest
  const { manifest } = await getTrashManifest(octokit, owner, repo);

  if (item.type === "dir") {
    // Rename folder to trash location
    await renameFolder(octokit, owner, repo, item.path, trashPath, `Move ${item.path} to trash`, branch);
  } else {
    // For files: get content then upload to trash, delete original
    const file = await getFileContent(octokit, owner, repo, item.path);
    await uploadFile(
      octokit,
      owner,
      repo,
      trashPath,
      getBase64ContentOrThrow(file, item.path),
      `Move ${item.path} to trash`,
      undefined
    );
    // Delete original by deleting file
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: item.path,
      message: `Move ${item.path} to trash`,
      sha: file.sha,
    });
  }

  // Update manifest
  manifest.items.push({
    originalPath: item.path,
    trashPath,
    deletedAt: new Date().toISOString(),
    type: item.type,
    name: item.name,
    sha: item.sha,
    size: item.size,
  });

  // Re-fetch manifest sha since the tree changed
  const { sha: updatedSha } = await getTrashManifest(octokit, owner, repo);
  await updateTrashManifest(octokit, owner, repo, manifest, updatedSha);
}

export async function restoreFromTrash(
  octokit: Octokit,
  owner: string,
  repo: string,
  trashItem: TrashItem,
  branch: string = "main"
): Promise<void> {
  if (trashItem.type === "dir") {
    await renameFolder(octokit, owner, repo, trashItem.trashPath, trashItem.originalPath, `Restore ${trashItem.name} from trash`, branch);
  } else {
    const file = await getFileContent(octokit, owner, repo, trashItem.trashPath);
    await uploadFile(
      octokit,
      owner,
      repo,
      trashItem.originalPath,
      getBase64ContentOrThrow(file, trashItem.trashPath),
      `Restore ${trashItem.name} from trash`,
      undefined
    );
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: trashItem.trashPath,
      message: `Restore ${trashItem.name} from trash`,
      sha: file.sha,
    });
  }

  // Remove from manifest
  const { manifest, sha: manifestSha } = await getTrashManifest(octokit, owner, repo);
  manifest.items = manifest.items.filter((i) => i.trashPath !== trashItem.trashPath);
  await updateTrashManifest(octokit, owner, repo, manifest, manifestSha);
}

export async function deleteFromTrash(
  octokit: Octokit,
  owner: string,
  repo: string,
  trashItem: TrashItem,
  branch: string = "main"
): Promise<void> {
  const { deleteFolder } = await import("./git-data");

  if (trashItem.type === "dir") {
    await deleteFolder(octokit, owner, repo, trashItem.trashPath, `Permanently delete ${trashItem.name}`, branch);
  } else {
    try {
      const file = await getFileContent(octokit, owner, repo, trashItem.trashPath);
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: trashItem.trashPath,
        message: `Permanently delete ${trashItem.name}`,
        sha: file.sha,
      });
    } catch {
      // File might already be deleted
    }
  }

  // Remove from manifest
  const { manifest, sha: manifestSha } = await getTrashManifest(octokit, owner, repo);
  manifest.items = manifest.items.filter((i) => i.trashPath !== trashItem.trashPath);
  await updateTrashManifest(octokit, owner, repo, manifest, manifestSha);
}

export async function purgeExpiredTrash(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<number> {
  const { manifest } = await getTrashManifest(octokit, owner, repo);
  const cutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const expired = manifest.items.filter((i) => new Date(i.deletedAt).getTime() < cutoff);

  for (const item of expired) {
    try {
      await deleteFromTrash(octokit, owner, repo, item, branch);
    } catch {
      // Continue with next item
    }
  }

  return expired.length;
}
