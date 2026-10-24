/** Subset of the public GitHub user payload used by the portfolio. */
export interface GithubProfile {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

/** Subset of the public GitHub repository payload used by the portfolio. */
export interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  fork: boolean
  archived: boolean
  /** Size in KB as reported by GitHub. 0 means the repository has no commits. */
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  default_branch: string
}

/** Where the data on screen came from. */
export type DataSource = 'api' | 'cache' | 'snapshot'

export type GithubErrorKind = 'rate-limit' | 'network' | 'not-found' | 'http' | 'invalid'

export interface GithubErrorInfo {
  kind: GithubErrorKind
  message: string
  /** When the rate limit resets, if GitHub told us. */
  resetAt?: Date
}
