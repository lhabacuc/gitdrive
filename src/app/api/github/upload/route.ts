import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { uploadFile } from "@/lib/github/contents";
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

    const { owner, repo, path, content, message, sha } = parsed.data;
    const octokit = createOctokit(session.accessToken);
    const data = await uploadFile(
      octokit,
      owner,
      repo,
      path,
      content,
      message || `Upload ${path.split("/").pop()}`,
      sha
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
