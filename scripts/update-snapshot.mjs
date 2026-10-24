// Regenerates src/data/github-snapshot.ts from the public GitHub API.
// The snapshot is only used as a fallback when the API is unreachable at runtime.
import { writeFile } from 'node:fs/promises'

const USER = 'gaboel0'
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-snapshot' }

async function get(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`)
  return res.json()
}

/** Commit count via the pagination trick: per_page=1 makes the last page number equal the count. */
async function countCommits(repo) {
  const res = await fetch(`https://api.github.com/repos/${USER}/${repo}/commits?per_page=1`, { headers })
  if (res.status === 409) return 0 // empty repository
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — commits of ${repo}`)
  const last = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get('link') ?? '')
  if (last) return Number(last[1])
  return (await res.json()).length
}

const profile = await get(`https://api.github.com/users/${USER}`)
const repos = await get(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`)

const pickProfile = ({ login, name, avatar_url, html_url, bio, company, location, blog, public_repos, followers, following, created_at }) =>
  ({ login, name, avatar_url, html_url, bio, company, location, blog, public_repos, followers, following, created_at })

const pickRepo = (r) => ({
  id: r.id,
  name: r.name,
  full_name: r.full_name,
  html_url: r.html_url,
  description: r.description,
  homepage: r.homepage,
  language: r.language,
  topics: r.topics ?? [],
  stargazers_count: r.stargazers_count,
  forks_count: r.forks_count,
  fork: r.fork,
  archived: r.archived,
  size: r.size,
  created_at: r.created_at,
  updated_at: r.updated_at,
  pushed_at: r.pushed_at,
  default_branch: r.default_branch,
})

const commitCounts = {}
for (const r of repos) commitCounts[r.name] = await countCommits(r.name)

const capturedAt = new Date().toISOString()
const body = `// Arquivo gerado por scripts/update-snapshot.mjs — não edite manualmente.
// Cópia fiel da API pública do GitHub, usada somente como fallback offline.
import type { GithubProfile, GithubRepo } from '@/types/github'

export const SNAPSHOT_CAPTURED_AT = ${JSON.stringify(capturedAt)}

export const profileSnapshot: GithubProfile = ${JSON.stringify(pickProfile(profile), null, 2)}

export const reposSnapshot: GithubRepo[] = ${JSON.stringify(repos.map(pickRepo), null, 2)}

/** Commit count per repository name, captured with the snapshot. */
export const commitCountsSnapshot: Record<string, number> = ${JSON.stringify(commitCounts, null, 2)}
`
await writeFile(new URL('../src/data/github-snapshot.ts', import.meta.url), body)
console.log(`Snapshot salvo: ${repos.length} repositórios (${capturedAt})`)
