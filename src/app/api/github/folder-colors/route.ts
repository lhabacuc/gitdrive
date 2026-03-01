import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getFileContent, uploadFile } from "@/lib/github/contents";
import { FOLDER_COLORS_PATH } from "@/lib/constants";
import { repoParamsSchema, folderColorsUpdateSchema, folderColorsConfigSchema } from "@/lib/validators";
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
    const file = await getFileContent(octokit, parsed.data.owner, parsed.data.repo, FOLDER_COLORS_PATH);

    if (!("content" in file) || !file.content) {
      return NextResponse.json({ colors: {}, sha: null });
    }

    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const raw = JSON.parse(content);
    const colors = folderColorsConfigSchema.parse(raw);

    return NextResponse.json({ colors, sha: file.sha });
  } catch (err) {
    const error = err as Error & { status?: number };
    if (error.status === 404) {
      return NextResponse.json({ colors: {}, sha: null });
    }
    return NextResponse.json(
      { error: error.message || "Failed to read folder colors" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = folderColorsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, colors } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    let sha: string | undefined;
    try {
      const existing = await getFileContent(octokit, owner, repo, FOLDER_COLORS_PATH);
      if ("sha" in existing) {
        sha = existing.sha;
      }
    } catch {
      // File doesn't exist yet
    }

    const content = Buffer.from(JSON.stringify(colors, null, 2)).toString("base64");
    const data = await uploadFile(
      octokit,
      owner,
      repo,
      FOLDER_COLORS_PATH,
      content,
      "Update folder colors",
      sha
    );

    return NextResponse.json({ colors, sha: data.content?.sha });
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to save folder colors" },
      { status: error.status || 500 }
    );
  }
}
