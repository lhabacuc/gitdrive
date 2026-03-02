import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { contentsParamsSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = contentsParamsSchema.safeParse({
    owner: searchParams.get("owner"),
    repo: searchParams.get("repo"),
    path: searchParams.get("path") || "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { owner, repo, path } = parsed.data;
  const octokit = createOctokit(session.accessToken);

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      path,
      per_page: 50,
    });

    const history = commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.committer?.date || commit.commit.author?.date || "",
      author: {
        name: commit.commit.author?.name || "Unknown",
        avatar_url: commit.author?.avatar_url || "",
        login: commit.author?.login || "",
      },
    }));

    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch history" },
      { status: 500 }
    );
  }
}
