import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { getFileContent } from "@/lib/github/contents";
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
    const file = await getFileContent(octokit, parsed.data.owner, parsed.data.repo, parsed.data.path);

    if (!("download_url" in file) || !file.download_url) {
      return NextResponse.json({ error: "No download URL" }, { status: 404 });
    }

    // Fetch the raw content from GitHub
    const response = await fetch(file.download_url, {
      headers: {
        Authorization: `token ${session.accessToken}`,
      },
    });

    const blob = await response.blob();
    const filename = parsed.data.path.split("/").pop() || "download";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: error.status || 500 }
    );
  }
}
