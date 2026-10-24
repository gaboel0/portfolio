/// <reference types="vite/client" />

import type { vReveal } from './composables/reveal'

declare module 'vue' {
  interface GlobalDirectives {
    vReveal: typeof vReveal
  }
}

export {}
