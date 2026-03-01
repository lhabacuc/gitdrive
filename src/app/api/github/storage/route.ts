import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getRepo } from "@/lib/github/repos";
import { repoParamsSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = repoParamsSchema.safeParse({
    owner: searchParams.get("owner"),
    repo: searchParams.get("repo"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const octokit = createOctokit(session.accessToken);
    const repo = await getRepo(octokit, parsed.data.owner, parsed.data.repo);
    return NextResponse.json({
      size: repo.size * 1024, // GitHub returns size in KB
      sizeFormatted: `${(repo.size / 1024).toFixed(1)} MB`,
    });
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to get storage info" },
      { status: error.status || 500 }
    );
  }
}
