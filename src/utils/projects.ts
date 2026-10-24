import { curation } from '@/data/curation'
import { safeUrl } from '@/services/github'
import type { GithubRepo } from '@/types/github'
import type { Project, RepoStatus } from '@/types/portfolio'

const DAY = 86_400_000

function statusOf(repo: GithubRepo, login: string): RepoStatus {
  if (repo.name.toLowerCase() === login.toLowerCase()) return 'profile'
  if (repo.archived) return 'archived'
  if (repo.fork) return 'fork'
  if (repo.size === 0) return 'empty'
  return 'active'
}

/**
 * Relevance score. Stars count, but only a little: documentation, recent
 * activity, real code and manual curation weigh more.
 */
function scoreOf(repo: GithubRepo, status: RepoStatus, now: number): number {
  if (status !== 'active') return -100
  const notes = curation[repo.name]
  const ageDays = (now - new Date(repo.pushed_at).getTime()) / DAY
  let score = 0
  if (notes) score += 3 + (notes.highlights?.length ?? 0) * 0.5
  if (repo.description) score += 1.5
  if (repo.homepage) score += 1.5
  score += Math.min(repo.stargazers_count, 3) * 0.5
  score += Math.min(Math.log10(repo.size + 1), 3) * 0.6
  if (ageDays < 365) score += 2
  else if (ageDays < 730) score += 1
  score += notes?.weight ?? 0
  return Math.round(score * 100) / 100
}

export function toProject(repo: GithubRepo, login: string, now = Date.now()): Project {
  const notes = curation[repo.name] ?? null
  const status = statusOf(repo, login)
  const description = repo.description ?? notes?.summary ?? null
  const tags = [...new Set([...(repo.language ? [repo.language] : []), ...(notes?.stack ?? [])])]
  return {
    repo,
    curation: notes,
    status,
    description,
    descriptionSource: repo.description ? 'github' : notes ? 'readme' : null,
    tags,
    homepage: safeUrl(repo.homepage),
    score: scoreOf(repo, status, now),
  }
}

/** Main framework when documented, otherwise the primary language. */
function familyOf(project: Project): string {
  return project.curation?.stack[0] ?? project.repo.language ?? '—'
}

/**
 * Picks featured projects greedily: highest score first, with a penalty for
 * repeating a stack family so the selection shows technical range.
 */
export function pickFeatured(projects: Project[], count = 4): Project[] {
  const pool = projects.filter((p) => p.status === 'active' && !p.curation?.relatedTo)
  const picked: Project[] = []
  const usedFamilies = new Map<string, number>()
  while (picked.length < count && pool.length) {
    let bestIndex = 0
    let bestValue = -Infinity
    pool.forEach((p, i) => {
      const value = p.score - (usedFamilies.get(familyOf(p)) ?? 0) * 2.5
      if (value > bestValue) {
        bestValue = value
        bestIndex = i
      }
    })
    const [chosen] = pool.splice(bestIndex, 1)
    if (!chosen || chosen.score <= 0) break
    picked.push(chosen)
    const family = familyOf(chosen)
    usedFamilies.set(family, (usedFamilies.get(family) ?? 0) + 1)
  }
  return picked
}

/** Only programming languages and frameworks are offered as project filters. */
const FILTERABLE = new Set([
  // languages
  'TypeScript',
  'JavaScript',
  'C',
  'C#',
  'Python',
  'PHP',
  'HTML',
  'CSS',
  'SCSS',
  'Blade',
  'Dart',
  // frameworks
  'Vue',
  'Angular',
  'Ionic',
  'Flutter',
  'Tailwind CSS',
  'AdonisJS',
])

export const isFilterable = (tag: string) => FILTERABLE.has(tag)

export type SortKey = 'updated' | 'stars' | 'name' | 'created'

export function sortProjects(list: Project[], key: SortKey): Project[] {
  const copy = [...list]
  const byDate = (field: 'pushed_at' | 'created_at') => (a: Project, b: Project) =>
    new Date(b.repo[field]).getTime() - new Date(a.repo[field]).getTime()
  switch (key) {
    case 'stars':
      return copy.sort(
        (a, b) =>
          b.repo.stargazers_count - a.repo.stargazers_count ||
          b.repo.forks_count - a.repo.forks_count ||
          byDate('pushed_at')(a, b),
      )
    case 'name':
      return copy.sort((a, b) => a.repo.name.localeCompare(b.repo.name, 'pt-BR', { sensitivity: 'base' }))
    case 'created':
      return copy.sort(byDate('created_at'))
    default:
      return copy.sort(byDate('pushed_at'))
  }
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function matchesQuery(project: Project, query: string): boolean {
  const q = normalizeText(query.trim())
  if (!q) return true
  const haystack = normalizeText(
    [project.repo.name, project.description ?? '', project.tags.join(' '), project.repo.topics.join(' ')].join(' '),
  )
  return q.split(/\s+/).every((term) => haystack.includes(term))
}
