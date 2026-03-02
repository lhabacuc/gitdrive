import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { repoParamsSchema } from "@/lib/validators";
import {
  getTrashManifest,
  moveToTrash,
  restoreFromTrash,
  deleteFromTrash,
} from "@/lib/github/trash";

// GET: List trash items
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
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { owner, repo } = parsed.data;
  const octokit = createOctokit(session.accessToken);

  try {
    const { manifest } = await getTrashManifest(octokit, owner, repo);
    return NextResponse.json(manifest.items);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch trash" },
      { status: 500 }
    );
  }
}

// POST: Move to trash
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { owner, repo, path, type, name, sha, size, branch } = body;

  if (!owner || !repo || !path || !type || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const octokit = createOctokit(session.accessToken);

  try {
    await moveToTrash(octokit, owner, repo, { path, type, name, sha, size }, branch || "main");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to move to trash" },
      { status: 500 }
    );
  }
}

// PUT: Restore from trash
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { owner, repo, trashItem, branch } = body;

  if (!owner || !repo || !trashItem) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const octokit = createOctokit(session.accessToken);

  try {
    await restoreFromTrash(octokit, owner, repo, trashItem, branch || "main");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to restore" },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete or empty trash
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { owner, repo, trashItem, emptyAll, branch } = body;

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const octokit = createOctokit(session.accessToken);

  try {
    if (emptyAll) {
      const { getTrashManifest: getManifest } = await import("@/lib/github/trash");
      const { manifest } = await getManifest(octokit, owner, repo);
      for (const item of manifest.items) {
        try {
          await deleteFromTrash(octokit, owner, repo, item, branch || "main");
        } catch {
          // Continue
        }
      }
      return NextResponse.json({ success: true, deleted: manifest.items.length });
    }

    if (!trashItem) {
      return NextResponse.json({ error: "Missing trashItem" }, { status: 400 });
    }

    await deleteFromTrash(octokit, owner, repo, trashItem, branch || "main");
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
