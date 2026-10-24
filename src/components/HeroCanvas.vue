<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type { ChidoriScene } from '@/three/chidoriScene'

/**
 * Wraps the Three.js hero scene. three.js is loaded lazily so the rest of the
 * page renders first; without WebGL a CSS eclipse is shown instead.
 */
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)
const failed = ref(false)

const { theme } = useTheme()
let scene: ChidoriScene | null = null

// Follows the page theme; runs before render so view-transition snapshots match.
watch(theme, (value) => scene?.setTheme(value))

/** If the GPU drops the context, show the CSS eclipse instead of a blank sky. */
function onContextLost(e: Event) {
  e.preventDefault()
  ready.value = false
  failed.value = true
}

let observer: IntersectionObserver | null = null
let disposed = false

function onVisibility() {
  scene?.setPaused(document.hidden)
}

function hasWebGL() {
  try {
    const test = document.createElement('canvas')
    return Boolean(test.getContext('webgl2') || test.getContext('webgl'))
  } catch {
    return false
  }
}

onMounted(async () => {
  if (!canvas.value || !hasWebGL()) {
    failed.value = true
    return
  }
  try {
    const { createChidoriScene } = await import('@/three/chidoriScene')
    if (disposed || !canvas.value) return
    scene = createChidoriScene(canvas.value, {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      theme: theme.value,
      onReady: () => (ready.value = true),
    })
    observer = new IntersectionObserver(([entry]) => scene?.setPaused(!entry?.isIntersecting))
    observer.observe(canvas.value)
    canvas.value.addEventListener('webglcontextlost', onContextLost)
    document.addEventListener('visibilitychange', onVisibility)
  } catch {
    failed.value = true
  }
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  canvas.value?.removeEventListener('webglcontextlost', onContextLost)
  document.removeEventListener('visibilitychange', onVisibility)
  scene?.dispose()
})

/** Whether a click landed on the moon: the 3D disc, or the CSS one when WebGL is unavailable. */
function isMoon(e: MouseEvent) {
  if (scene && !failed.value) return scene.hitMoon(e.clientX, e.clientY)
  const moon = document.querySelector<HTMLElement>('.stage .moon')
  if (!moon) return false
  const r = moon.getBoundingClientRect()
  return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) <= r.width / 2
}

defineExpose({ burst: () => scene?.burst(), isMoon })
</script>

<template>
  <div class="stage" :class="{ 'is-ready': ready, 'is-fallback': failed }" aria-hidden="true">
    <canvas ref="canvas" />
    <div class="fallback"><span class="moon" /></div>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--hero-sky);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.2s ease;
}

.is-ready canvas {
  opacity: 1;
}

.fallback {
  position: absolute;
  inset: 0;
  transition: opacity 1.2s ease;
}

.is-ready .fallback {
  opacity: 0;
}

.moon {
  position: absolute;
  top: 22%;
  right: 14%;
  width: clamp(140px, 22vw, 300px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 64% 36%, var(--hero-disc) 56%, var(--accent) 58%, transparent 66%);
  box-shadow: 0 0 120px -10px var(--accent);
}

@media (max-width: 760px) {
  .moon {
    top: 12%;
    right: 50%;
    transform: translateX(50%);
  }
}
</style>
