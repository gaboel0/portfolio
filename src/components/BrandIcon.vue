<script setup lang="ts">
import { computed } from 'vue'
import {
  siAdonisjs,
  siAngular,
  siClaude,
  siFigma,
  siFlutter,
  siGit,
  siGithub,
  siGithubcopilot,
  siGitlab,
  siIonic,
  siMysql,
  siTypescript,
  siVuedotjs,
} from 'simple-icons'

/**
 * Official brand marks from Simple Icons. Brands without an available mark
 * (C#, Codex, LinkedIn) fall back to a typographic monogram or a glyph.
 */
const props = withDefaults(defineProps<{ name: string; size?: number; colored?: boolean }>(), {
  size: 22,
  colored: false,
})

const icons: Record<string, { path: string; hex: string }> = {
  vue: siVuedotjs,
  angular: siAngular,
  ionic: siIonic,
  flutter: siFlutter,
  typescript: siTypescript,
  adonis: siAdonisjs,
  mysql: siMysql,
  git: siGit,
  github: siGithub,
  gitlab: siGitlab,
  figma: siFigma,
  claude: siClaude,
  copilot: siGithubcopilot,
}

const linkedinPath =
  'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z'

const monograms: Record<string, string> = { csharp: 'C#', codex: '>_' }

const icon = computed(() => (props.name === 'linkedin' ? { path: linkedinPath, hex: '0A66C2' } : icons[props.name]))
const monogram = computed(() => monograms[props.name])
</script>

<template>
  <svg
    v-if="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    :fill="colored ? `#${icon.hex}` : 'currentColor'"
  >
    <path :d="icon.path" />
  </svg>
  <span v-else class="monogram" :style="{ '--size': `${size}px` }" aria-hidden="true">{{ monogram ?? '·' }}</span>
</template>

<style scoped>
.monogram {
  display: inline-grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: calc(var(--size) * 0.56);
  line-height: 1;
  letter-spacing: -0.04em;
}
</style>
