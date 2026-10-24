<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CoverStage } from '@/three/coverStage'

/**
 * One transparent canvas laid over the featured grid that draws a live 3D
 * emblem inside every `[data-cover]` element. `version` changes whenever the
 * set of covers changes (filters, data load) so emblems are rebuilt.
 */
const props = defineProps<{ version: string }>()
const emit = defineEmits<{ ready: [] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let stage: CoverStage | null = null
let observer: IntersectionObserver | null = null
let disposed = false

function onVisibility() {
  stage?.setPaused(document.hidden)
}

onMounted(async () => {
  const el = canvas.value
  const container = el?.parentElement
  if (!el || !container) return
  try {
    const test = document.createElement('canvas')
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return
    const { createCoverStage } = await import('@/three/coverStage')
    if (disposed) return
    stage = createCoverStage(el, container, window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    observer = new IntersectionObserver(([entry]) => stage?.setPaused(!entry?.isIntersecting))
    observer.observe(container)
    document.addEventListener('visibilitychange', onVisibility)
    el.addEventListener('webglcontextlost', () => el.classList.add('is-lost'))
    emit('ready')
  } catch {
    // No 3D: the CSS crescent covers stay visible.
  }
})

watch(
  () => props.version,
  async () => {
    await nextTick()
    stage?.refresh()
  },
)

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  stage?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="cover-stage" aria-hidden="true" />
</template>

<style scoped>
.cover-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.is-lost {
  display: none;
}
</style>
