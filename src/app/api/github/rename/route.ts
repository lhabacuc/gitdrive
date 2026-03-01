import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getFileContent, uploadFile, deleteFile } from "@/lib/github/contents";
import { renameFolder } from "@/lib/github/git-data";
import { getRepo } from "@/lib/github/repos";
import { renameSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = renameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, oldPath, newPath, type, sha } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    if (type === "dir") {
      const repoData = await getRepo(octokit, owner, repo);
      const result = await renameFolder(
        octokit,
        owner,
        repo,
        oldPath,
        newPath,
        `Rename ${oldPath} to ${newPath}`,
        repoData.default_branch
      );
      return NextResponse.json(result);
    } else {
      // For files: get content, upload to new path, delete old
      const file = await getFileContent(octokit, owner, repo, oldPath);
      if (!("content" in file) || !file.content) {
        return NextResponse.json({ error: "Cannot read file content" }, { status: 400 });
      }

      await uploadFile(
        octokit,
        owner,
        repo,
        newPath,
        file.content,
        `Rename ${oldPath} to ${newPath}`,
      );

      await deleteFile(
        octokit,
        owner,
        repo,
        oldPath,
        sha || file.sha,
        `Remove old file ${oldPath} (renamed to ${newPath})`
      );

      return NextResponse.json({ success: true });
    }
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Rename failed" },
      { status: error.status || 500 }
    );
  }
}
