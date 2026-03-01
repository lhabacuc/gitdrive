import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getContents } from "@/lib/github/contents";
import { contentsParamsSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const octokit = createOctokit(session.accessToken);
    const data = await getContents(octokit, parsed.data.owner, parsed.data.repo, parsed.data.path);
    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to fetch contents" },
      { status: error.status || 500 }
    );
  }
}
