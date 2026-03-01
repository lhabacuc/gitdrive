import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getFileContent, uploadFile } from "@/lib/github/contents";
import { CONFIG_PATH } from "@/lib/constants";
import { repoParamsSchema, configUpdateSchema, driveConfigSchema } from "@/lib/validators";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CONFIG = driveConfigSchema.parse({});

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
    const file = await getFileContent(octokit, parsed.data.owner, parsed.data.repo, CONFIG_PATH);

    if (!("content" in file) || !file.content) {
      return NextResponse.json({ config: DEFAULT_CONFIG, sha: null });
    }

    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const raw = JSON.parse(content);
    const config = driveConfigSchema.parse(raw);

    return NextResponse.json({ config, sha: file.sha });
  } catch (err) {
    const error = err as Error & { status?: number };
    // File not found — return defaults
    if (error.status === 404) {
      return NextResponse.json({ config: DEFAULT_CONFIG, sha: null });
    }
    return NextResponse.json(
      { error: error.message || "Failed to read config" },
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
    const parsed = configUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, config } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    // Try to get existing file sha for update
    let sha: string | undefined;
    try {
      const existing = await getFileContent(octokit, owner, repo, CONFIG_PATH);
      if ("sha" in existing) {
        sha = existing.sha;
      }
    } catch {
      // File doesn't exist yet — will create
    }

    const content = Buffer.from(JSON.stringify(config, null, 2)).toString("base64");
    const data = await uploadFile(
      octokit,
      owner,
      repo,
      CONFIG_PATH,
      content,
      "Update GitDrive config",
      sha
    );

    return NextResponse.json({ config, sha: data.content?.sha });
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to save config" },
      { status: error.status || 500 }
    );
  }
}
