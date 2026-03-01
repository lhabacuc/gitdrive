import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { searchFiles } from "@/lib/github/search";
import { getRepo } from "@/lib/github/repos";
import { searchSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    owner: searchParams.get("owner"),
    repo: searchParams.get("repo"),
    query: searchParams.get("query"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const octokit = createOctokit(session.accessToken);
    const repoData = await getRepo(octokit, parsed.data.owner, parsed.data.repo);
    const results = await searchFiles(
      octokit,
      parsed.data.owner,
      parsed.data.repo,
      parsed.data.query,
      repoData.default_branch
    );
    return NextResponse.json(results);
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: error.status || 500 }
    );
  }
}
