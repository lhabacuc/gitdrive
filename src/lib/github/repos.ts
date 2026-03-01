import { Octokit } from "@octokit/rest";

export async function listRepos(octokit: Octokit) {
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    sort: "updated",
    per_page: 100,
    affiliation: "owner,collaborator,organization_member",
  });
  return repos;
}

export async function getRepo(octokit: Octokit, owner: string, repo: string) {
  const { data } = await octokit.repos.get({ owner, repo });
  return data;
}
