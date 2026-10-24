import { computed, readonly, ref, shallowRef } from 'vue'
import { person } from '@/data/profile'
import { SNAPSHOT_CAPTURED_AT, commitCountsSnapshot, profileSnapshot, reposSnapshot } from '@/data/github-snapshot'
import { GithubError, clearGithubCache, fetchCommitCount, fetchProfile, fetchRepos } from '@/services/github'
import type { DataSource, GithubErrorInfo, GithubProfile, GithubRepo } from '@/types/github'
import { pickFeatured, toProject } from '@/utils/projects'

type Status = 'idle' | 'loading' | 'ready'

/** Repositories with fewer commits than this are left out of the portfolio. */
export const MIN_COMMITS = 2
const MAX_LAZY_COUNTS = 20

// Module-level state: every component shares a single load.
const status = ref<Status>('idle')
const source = ref<DataSource | null>(null)
const error = shallowRef<GithubErrorInfo | null>(null)
const profile = shallowRef<GithubProfile | null>(null)
const repos = shallowRef<GithubRepo[]>([])
// Commit counts: bundled with the snapshot, refreshed only for repos the snapshot cannot vouch for.
const commits = shallowRef<Record<string, number>>({ ...commitCountsSnapshot })
let controller: AbortController | null = null

/** Counts commits for repos that are new or were pushed after the snapshot was captured. */
async function refreshCommitCounts(list: GithubRepo[], signal: AbortSignal) {
  const stale = list
    .filter((r) => !(r.name in commitCountsSnapshot) || r.pushed_at > SNAPSHOT_CAPTURED_AT)
    .slice(0, MAX_LAZY_COUNTS)
  if (!stale.length) return
  const results = await Promise.allSettled(stale.map((r) => fetchCommitCount(person.githubUser, r.name, signal)))
  const next = { ...commits.value }
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') next[stale[i]!.name] = res.value
  })
  commits.value = next
}

function toInfo(err: unknown): GithubErrorInfo {
  if (err instanceof GithubError) return err.info
  return { kind: 'network', message: 'Erro inesperado ao consultar o GitHub.' }
}

async function load(force = false) {
  if (status.value === 'loading') return
  if (status.value === 'ready' && !force) return
  if (force) clearGithubCache()

  controller?.abort()
  controller = new AbortController()
  status.value = 'loading'
  error.value = null

  const user = person.githubUser
  const [profileResult, reposResult] = await Promise.allSettled([
    fetchProfile(user, controller.signal),
    fetchRepos(user, controller.signal),
  ])

  // The profile is optional: a failure there should not hide the repositories.
  profile.value = profileResult.status === 'fulfilled' ? profileResult.value.profile : null

  if (reposResult.status === 'fulfilled') {
    repos.value = reposResult.value.repos
    source.value = reposResult.value.cached ? 'cache' : 'api'
    status.value = 'ready'
    void refreshCommitCounts(reposResult.value.repos, controller.signal).catch(() => {})
    return
  }

  if ((reposResult.reason as Error)?.name === 'AbortError') return
  // Keep the page useful: fall back to the verified snapshot and surface the error.
  error.value = toInfo(reposResult.reason)
  applySnapshot()
}

/** Switches to the verified snapshot bundled at build time. */
function applySnapshot() {
  repos.value = reposSnapshot
  profile.value = profile.value ?? profileSnapshot
  source.value = 'snapshot'
  status.value = 'ready'
}

/** A repository whose count is still unknown is kept until it can be counted. */
const visibleRepos = computed(() => repos.value.filter((r) => (commits.value[r.name] ?? Infinity) >= MIN_COMMITS))

/** Only repositories with at least MIN_COMMITS commits and a public description (GitHub or README summary). */
const projects = computed(() => {
  const now = Date.now()
  return visibleRepos.value
    .map((repo) => toProject(repo, person.githubUser, now))
    .filter((p) => p.description !== null)
})
const hiddenCount = computed(() => repos.value.length - projects.value.length)

const featured = computed(() => pickFeatured(projects.value, 4))

export function useGithub() {
  return {
    status: readonly(status),
    source: readonly(source),
    error,
    profile,
    repos,
    hiddenCount,
    projects,
    featured,
    snapshotDate: SNAPSHOT_CAPTURED_AT,
    load,
    retry: () => load(true),
  }
}
