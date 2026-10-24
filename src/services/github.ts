import type { GithubErrorInfo, GithubProfile, GithubRepo } from '@/types/github'

const API = 'https://api.github.com'
const CACHE_TTL_MS = 15 * 60 * 1000
const STORAGE_PREFIX = 'gh-cache:'

export class GithubError extends Error {
  readonly info: GithubErrorInfo

  constructor(info: GithubErrorInfo) {
    super(info.message)
    this.name = 'GithubError'
    this.info = info
  }
}

interface CacheEntry<T> {
  at: number
  data: T
}

/** Memory cache for the page lifetime, mirrored to sessionStorage to survive reloads. */
const memory = new Map<string, CacheEntry<unknown>>()

function readCache<T>(key: string): T | null {
  const hit = memory.get(key) as CacheEntry<T> | undefined
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.at >= CACHE_TTL_MS) return null
    memory.set(key, entry)
    return entry.data
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { at: Date.now(), data }
  memory.set(key, entry)
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Storage may be full or blocked; the memory cache is enough.
  }
}

/** Requests in flight, so simultaneous callers share one network call. */
const inflight = new Map<string, Promise<unknown>>()

async function request<T>(path: string, signal?: AbortSignal): Promise<{ data: T; cached: boolean }> {
  const cached = readCache<T>(path)
  if (cached) return { data: cached, cached: true }

  const pending = inflight.get(path) as Promise<T> | undefined
  if (pending) return { data: await pending, cached: false }

  const job = (async () => {
    let res: Response
    try {
      res = await fetch(API + path, {
        headers: { Accept: 'application/vnd.github+json' },
        signal,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err
      throw new GithubError({ kind: 'network', message: 'Não foi possível conectar à API do GitHub.' })
    }

    if (!res.ok) throw toError(res)

    let data: T
    try {
      data = (await res.json()) as T
    } catch {
      throw new GithubError({ kind: 'invalid', message: 'A API do GitHub retornou uma resposta inválida.' })
    }
    writeCache(path, data)
    return data
  })()

  inflight.set(path, job)
  try {
    return { data: await job, cached: false }
  } finally {
    inflight.delete(path)
  }
}

function toError(res: Response): GithubError {
  const remaining = res.headers.get('x-ratelimit-remaining')
  const reset = res.headers.get('x-ratelimit-reset')
  if ((res.status === 403 || res.status === 429) && (remaining === '0' || res.status === 429)) {
    return new GithubError({
      kind: 'rate-limit',
      message: 'O limite de requisições anônimas da API do GitHub foi atingido.',
      resetAt: reset ? new Date(Number(reset) * 1000) : undefined,
    })
  }
  if (res.status === 404) {
    return new GithubError({ kind: 'not-found', message: 'Perfil não encontrado no GitHub.' })
  }
  return new GithubError({ kind: 'http', message: `A API do GitHub respondeu com o status ${res.status}.` })
}

function isRepo(value: unknown): value is GithubRepo {
  const r = value as GithubRepo
  return typeof r?.id === 'number' && typeof r.name === 'string' && typeof r.html_url === 'string'
}

/** Normalizes fields the API may omit and removes duplicated ids. */
function normalizeRepos(list: unknown): GithubRepo[] {
  if (!Array.isArray(list)) {
    throw new GithubError({ kind: 'invalid', message: 'Formato inesperado na lista de repositórios.' })
  }
  const seen = new Set<number>()
  const out: GithubRepo[] = []
  for (const item of list) {
    if (!isRepo(item) || seen.has(item.id)) continue
    seen.add(item.id)
    out.push({
      ...item,
      description: item.description?.trim() || null,
      homepage: safeUrl(item.homepage),
      language: item.language || null,
      topics: Array.isArray(item.topics) ? item.topics : [],
      stargazers_count: item.stargazers_count ?? 0,
      forks_count: item.forks_count ?? 0,
      size: item.size ?? 0,
      fork: Boolean(item.fork),
      archived: Boolean(item.archived),
    })
  }
  return out
}

/** Only http(s) links are rendered; anything else is discarded. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export async function fetchProfile(user: string, signal?: AbortSignal) {
  const { data, cached } = await request<GithubProfile>(`/users/${encodeURIComponent(user)}`, signal)
  return { profile: data, cached }
}

export async function fetchRepos(user: string, signal?: AbortSignal) {
  const { data, cached } = await request<unknown>(
    `/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=100`,
    signal,
  )
  return { repos: normalizeRepos(data), cached }
}

/**
 * Commit count of one repository. With per_page=1 the number of the last
 * page equals the count, so a single tiny request is enough.
 */
export async function fetchCommitCount(user: string, repo: string, signal?: AbortSignal): Promise<number> {
  const path = `/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/commits?per_page=1`
  const cached = readCache<number>(`${path}#count`)
  if (cached !== null) return cached

  let res: Response
  try {
    res = await fetch(API + path, { headers: { Accept: 'application/vnd.github+json' }, signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new GithubError({ kind: 'network', message: 'Não foi possível conectar à API do GitHub.' })
  }
  let count: number
  if (res.status === 409) {
    count = 0 // GitHub answers 409 for an empty repository
  } else if (!res.ok) {
    throw toError(res)
  } else {
    const last = /[?&]page=(\d+)>;\s*rel="last"/.exec(res.headers.get('link') ?? '')
    count = last ? Number(last[1]) : ((await res.json()) as unknown[]).length
  }
  writeCache(`${path}#count`, count)
  return count
}

export function clearGithubCache() {
  memory.clear()
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(STORAGE_PREFIX)) sessionStorage.removeItem(key)
    }
  } catch {
    // ignore
  }
}
