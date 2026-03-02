import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { moveSchema } from "@/lib/validators";
import { moveItems } from "@/lib/github/git-data";
import { getRepo } from "@/lib/github/repos";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = moveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { owner, repo, items, destinationDir } = parsed.data;
  const octokit = createOctokit(session.accessToken);

  try {
    const repoData = await getRepo(octokit, owner, repo);
    const branch = repoData.default_branch;

    // Build moves array
    const moves = items.map((item) => {
      const name = item.path.split("/").pop()!;
      const newPath = destinationDir ? `${destinationDir}/${name}` : name;
      return { oldPath: item.path, newPath };
    });

    const names = items.map((i) => i.path.split("/").pop()).join(", ");
    const result = await moveItems(
      octokit,
      owner,
      repo,
      moves,
      `Move ${names} to ${destinationDir || "root"}`,
      branch
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Move failed" },
      { status: 500 }
    );
  }
}
