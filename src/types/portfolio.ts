import type { GithubRepo } from './github'

/**
 * Editorial notes written from each repository's own README / manifest files.
 * Kept separate from the API payload so verified API data is never overwritten.
 */
export interface RepoCuration {
  /** Short summary derived from the repository README. */
  summary: string
  /** Stack confirmed in README badges or package manifests. */
  stack: string[]
  /** Concrete features documented in the README. */
  highlights?: string[]
  /** Context, e.g. academic project. */
  context?: string
  /** Name of a repository with the same code base. */
  relatedTo?: string
  /** Manual nudge for featured ranking (documentation quality, scope). */
  weight?: number
  /** Overrides the 3D cover emblem picked from the stack. */
  emblem?: 'd20'
}

export type RepoStatus = 'active' | 'empty' | 'profile' | 'fork' | 'archived'

/** Repository enriched with derived, presentation-ready fields. */
export interface Project {
  repo: GithubRepo
  curation: RepoCuration | null
  status: RepoStatus
  /** Best description available, or null when nothing was published. */
  description: string | null
  descriptionSource: 'github' | 'readme' | null
  /** Primary language + curated stack, deduplicated. */
  tags: string[]
  homepage: string | null
  score: number
}

export interface Role {
  title: string
  company: string
  start: string
  end: string | null
  current: boolean
  summary: string
  responsibilities: string[]
  stack: string[]
}

export interface SkillItem {
  name: string
  note: string
  icon: string
}

export interface SkillGroup {
  id: string
  title: string
  description: string
  items: SkillItem[]
}
