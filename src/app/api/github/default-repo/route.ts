import { auth } from "@/lib/auth";
import { createOctokit } from "@/lib/github/client";
import { CONFIG_PATH } from "@/lib/constants";
import { driveConfigSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const octokit = createOctokit(session.accessToken);

    // Fetch user's most recently updated repos (limit to 20 for speed)
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 20,
      affiliation: "owner,collaborator,organization_member",
    });

    // Check each repo for a saved config with defaultRepo
    for (const repo of repos) {
      try {
        const { data: file } = await octokit.repos.getContent({
          owner: repo.owner.login,
          repo: repo.name,
          path: CONFIG_PATH,
        });

        if (!Array.isArray(file) && "content" in file && file.content) {
          const content = Buffer.from(file.content, "base64").toString("utf-8");
          const raw = JSON.parse(content);
          const config = driveConfigSchema.parse(raw);

          if (config.defaultRepo) {
            return NextResponse.json({
              defaultRepo: config.defaultRepo,
              config,
            });
          }
        }
      } catch {
        // Config doesn't exist in this repo, skip
        continue;
      }
    }

    return NextResponse.json({ defaultRepo: null });
  } catch (err) {
    const error = err as Error & { status?: number };
    return NextResponse.json(
      { error: error.message || "Failed to find default repo" },
      { status: error.status || 500 }
    );
  }
}
