import { shallowRef } from 'vue'
import type { Project } from '@/types/portfolio'

/** Which project window is open, and the card it grew from (for the expand animation). */
export interface OpenProject {
  project: Project
  /** Viewport rectangle of the card at the moment of the click. */
  origin: DOMRect
}

const current = shallowRef<OpenProject | null>(null)

export function useProjectModal() {
  return {
    current,
    open: (project: Project, origin: DOMRect) => (current.value = { project, origin }),
    close: () => (current.value = null),
  }
}
