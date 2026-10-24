<script setup lang="ts">
import { computed } from 'vue'
import { languageColor } from '@/utils/languages'
import { prettifyRepoName } from '@/utils/format'

/**
 * Typographic cover generated from the repository's own data — used because
 * none of the public repositories ship screenshots.
 */
const props = withDefaults(
  defineProps<{
    name: string
    language: string | null
    stack: string[]
    index?: number
    size?: 'l' | 'm'
    emblem?: string
  }>(),
  { index: 0, size: 'm' },
)

function hash(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const seed = computed(() => hash(props.name))
const title = computed(() => prettifyRepoName(props.name))
const words = computed(() => title.value.split(' '))
const color = computed(() => languageColor(props.language))

/** Deterministic layout knobs so each cover is distinct but stable. */
const layout = computed(() => {
  const s = seed.value
  return {
    // The moon stays in the upper-right area so it never sits under the title.
    blockX: 50 + (s % 5) * 6, // %
    blockY: 8 + ((s >>> 3) % 4) * 4, // %
    blockW: 18 + ((s >>> 6) % 3) * 5, // % of width
    columns: 6 + ((s >>> 9) % 4) * 2,
    tilt: 20 + ((s >>> 12) % 6) * 25, // crescent orientation
  }
})

const lines = computed(() => props.stack.slice(0, props.size === 'l' ? 4 : 3))

/** Which 3D emblem the cover stage draws, by stack family. */
const kind = computed(() => {
  if (props.emblem) return props.emblem
  const family = ` ${[props.language ?? '', ...props.stack].join(' ')} `.toLowerCase()
  if (family.includes('vue')) return 'knot'
  if (family.includes('ionic')) return 'rings'
  if (family.includes('angular')) return 'ico'
  if (/\sc\s|esp|mqtt/.test(family)) return 'orbit'
  if (family.includes('python')) return 'dodeca'
  if (/php|blade/.test(family)) return 'box'
  if (/css|html/.test(family)) return 'sphere'
  return 'ico'
})
</script>

<template>
  <div
    class="cover"
    :class="`cover--${size}`"
    data-cover
    :data-kind="kind"
    :data-seed="seed"
    role="img"
    :aria-label="`Capa tipográfica do projeto ${title}${language ? `, linguagem principal ${language}` : ''}`"
    :style="{
      '--lang': color,
      '--cols': layout.columns,
      '--bx': `${layout.blockX}%`,
      '--by': `${layout.blockY}%`,
      '--bw': `${layout.blockW}%`,
      '--tilt': `${layout.tilt}deg`,
    }"
  >
    <div class="grid" aria-hidden="true" />
    <div class="block" aria-hidden="true" />
    <div class="top mono" aria-hidden="true">
      <span>~/{{ name }}</span>
      <span>{{ String(index + 1).padStart(2, '0') }}</span>
    </div>
    <p class="word" aria-hidden="true">
      <span v-for="(w, i) in words.slice(0, 3)" :key="i" :class="{ hollow: i % 2 === 1 }">{{ w }}</span>
    </p>
    <ul class="imports mono" role="list" aria-hidden="true">
      <li v-for="item in lines" :key="item">
        <span class="kw">import</span> {{ item.toLowerCase().replace(/\s+/g, '-') }}
      </li>
    </ul>
    <span class="lang mono" aria-hidden="true"><i />{{ language ?? 'sem linguagem' }}</span>
  </div>
</template>

<style scoped>
.cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  --accent: var(--panel-accent);
  background: var(--panel-bg);
  color: var(--panel-ink);
  isolation: isolate;
  container-type: inline-size;
}

.grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--panel-ink) 9%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--panel-ink) 9%, transparent) 1px, transparent 1px);
  background-size: calc(100% / var(--cols)) calc(100% / (var(--cols) * 0.625));
  mask-image: linear-gradient(160deg, #000 30%, transparent 95%);
}

/* Crescent moon: a disc minus an offset disc, plus a thin crimson slash. */
.block {
  position: absolute;
  left: var(--bx);
  top: var(--by);
  width: var(--bw);
  aspect-ratio: 1;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle at 68% 32%, transparent 54%, var(--accent) 55%);
  box-shadow: 0 0 60px -10px var(--accent);
  transform: rotate(var(--tilt));
  transition: transform var(--dur-slow) var(--ease-out);
}

.block::after {
  content: '';
  position: absolute;
  left: -30%;
  top: 50%;
  width: 160%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--crimson) 30%, var(--crimson) 70%, transparent);
  transform: rotate(-60deg);
}

.top {
  position: absolute;
  inset: 14px 16px auto;
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  opacity: 0.7;
}

.word {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 22%;
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.25em;
  font-size: clamp(1.3rem, 7.4cqi, 3.6rem);
  font-weight: 600;
  line-height: 0.92;
  letter-spacing: -0.04em;
}

.word {
  font-family: var(--font-display);
  font-weight: 800;
  text-transform: uppercase;
}

.word .hollow {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--panel-ink);
}

.imports {
  position: absolute;
  left: 16px;
  bottom: 14px;
  font-size: 0.66rem;
  line-height: 1.55;
  opacity: 0.62;
}

.cover--m .imports {
  display: none;
}

@container (max-width: 560px) {
  .imports {
    display: none;
  }
}

.kw {
  color: var(--accent);
}

.lang {
  position: absolute;
  right: 16px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  opacity: 0.8;
}

.lang i {
  width: 8px;
  height: 8px;
  background: var(--lang);
}
</style>
