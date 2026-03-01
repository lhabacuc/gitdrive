import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { deleteFile } from "@/lib/github/contents";
import { deleteFolder } from "@/lib/github/git-data";
import { getRepo } from "@/lib/github/repos";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deleteParamsSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  path: z.string().min(1),
  sha: z.string().optional(),
  type: z.enum(["file", "dir"]),
  message: z.string().optional(),
});

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
   
  try {
    const body = await request.json();
    const parsed = deleteParamsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, path, sha, type, message } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    if (type === "dir") {
      const repoData = await getRepo(octokit, owner, repo);
      const result = await deleteFolder(
        octokit,
        owner,
        repo,
        path,
        message || `Delete folder ${path}`,
        repoData.default_branch
      );
      return NextResponse.json(result);
    } else {
      if (!sha) {
        return NextResponse.json({ error: "SHA required for file deletion" }, { status: 400 });
      }
      const result = await deleteFile(
        octokit,
        owner,
        repo,
        path,
        sha,
        message || `Delete ${path}`
      );
      return NextResponse.json(result);
    }
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: error.status || 500 }
    );
  }
}
