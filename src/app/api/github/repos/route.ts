import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { listRepos } from "@/lib/github/repos";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const octokit = createOctokit(session.accessToken);
    const repos = await listRepos(octokit);
    return NextResponse.json(repos);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Failed to fetch repos" },
      { status: 500 }
    );
  }
}
