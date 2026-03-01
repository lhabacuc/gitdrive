import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { uploadLargeFile } from "@/lib/github/git-data";
import { getRepo } from "@/lib/github/repos";
import { uploadSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, path, content, message } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    const repoData = await getRepo(octokit, owner, repo);
    const branch = repoData.default_branch;

    const data = await uploadLargeFile(
      octokit,
      owner,
      repo,
      path,
      content,
      message || `Upload ${path.split("/").pop()}`,
      branch
    );

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: error.status || 500 }
    );
  }
}
