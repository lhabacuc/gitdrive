import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { uploadFile } from "@/lib/github/contents";
import { folderSchema } from "@/lib/validators";
import { GITKEEP_FILENAME } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = folderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { owner, repo, path, message } = parsed.data;
    const octokit = createOctokit(session.accessToken);

    const gitkeepPath = `${path}/${GITKEEP_FILENAME}`;
    const data = await uploadFile(
      octokit,
      owner,
      repo,
      gitkeepPath,
      "",
      message || `Create folder ${path}`
    );

    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to create folder" },
      { status: error.status || 500 }
    );
  }
}
