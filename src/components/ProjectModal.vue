<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowUpRight, Folder, LoaderCircle } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import { useProjectModal } from '@/composables/useProjectModal'
import { useTheme } from '@/composables/useTheme'
import { getMicroFrontend, microFrontendUrl, type MicroFrontendView } from '@/data/microfrontends'

/**
 * Host of the project micro-frontends. The window grows out of the card that
 * was clicked and shows one of two views of the project in an iframe:
 *  - "app": the project's own build, running (same origin, so its router and
 *    storage work; the code is the owner's own);
 *  - "about": a presentation mini-app, kept in a stricter sandbox, that talks to
 *    this host through postMessage (see public/mfe/shared/bridge.js).
 */
const { current, close } = useProjectModal()
const { theme } = useTheme()

const dialog = ref<HTMLDialogElement | null>(null)
const frame = ref<HTMLIFrameElement | null>(null)
const ready = ref(false)
const failed = ref(false)
const maximized = ref(false)
const view = ref<MicroFrontendView>('app')
const src = ref('')

const mfe = computed(() => (current.value ? getMicroFrontend(current.value.project.repo.name) : null))
const repo = computed(() => current.value?.project.repo ?? null)
const hasApp = computed(() => Boolean(mfe.value?.app))

/** The running app needs its own origin powers; the presentation needs none. */
const sandbox = computed(() =>
  view.value === 'app'
    ? 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
    : 'allow-scripts',
)

const tabs: { id: MicroFrontendView; label: string }[] = [
  { id: 'app', label: 'Projeto rodando' },
  { id: 'about', label: 'Apresentação' },
]
const visibleTabs = computed(() => tabs.filter((t) => t.id === 'about' || hasApp.value))

const LOAD_TIMEOUT_MS = 12000
const EXPAND_MS = 420
let timer: number | undefined
let closing = false

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Transform that makes the dialog look exactly like the origin card. */
function fromOrigin(origin: DOMRect, target: DOMRect) {
  const dx = origin.left - target.left
  const dy = origin.top - target.top
  const sx = origin.width / target.width
  const sy = origin.height / target.height
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
}

function post(message: unknown) {
  frame.value?.contentWindow?.postMessage(message, '*')
}

/** Starts loading a view and arms the "could not load" timer. */
function load(next: MicroFrontendView) {
  if (!mfe.value) return
  window.clearTimeout(timer)
  view.value = next
  ready.value = false
  failed.value = false
  src.value = microFrontendUrl(mfe.value, next, theme.value)
  timer = window.setTimeout(() => (failed.value = true), LOAD_TIMEOUT_MS)
}

function onFrameLoad() {
  if (!src.value) return
  ready.value = true
  window.clearTimeout(timer)
  if (view.value === 'about') post({ type: 'theme', theme: theme.value })
}

function onMessage(event: MessageEvent) {
  if (!frame.value || event.source !== frame.value.contentWindow) return
  const data = event.data as { source?: string; type?: string; href?: string } | null
  if (data?.source !== 'mfe') return
  if (data.type === 'ready') {
    ready.value = true
    window.clearTimeout(timer)
    post({ type: 'theme', theme: theme.value })
  } else if (data.type === 'open' && data.href) {
    try {
      const url = new URL(data.href)
      if (url.protocol === 'https:' || url.protocol === 'http:') window.open(url.href, '_blank', 'noopener,noreferrer')
    } catch {
      // Not a URL: ignore.
    }
  }
}

/** Arrow keys move between the tabs, like any tablist. */
function onTabKey(event: KeyboardEvent) {
  const list = visibleTabs.value
  const i = list.findIndex((t) => t.id === view.value)
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[event.key as string]
  if (next === undefined) return
  event.preventDefault()
  const target = list[(next + list.length) % list.length]
  if (target) {
    load(target.id)
    nextTick(() => document.getElementById(`pm-tab-${target.id}`)?.focus())
  }
}

async function open() {
  const entry = current.value
  if (!entry || !mfe.value) return
  closing = false
  maximized.value = false
  load(hasApp.value ? 'app' : 'about')
  await nextTick()
  const el = dialog.value
  if (!el) return

  // A closing animation holds its last frame (opacity 0): drop it before showing again.
  el.getAnimations().forEach((animation) => animation.cancel())
  window.addEventListener('message', onMessage)
  document.documentElement.style.overflow = 'hidden'
  el.showModal()

  if (!reducedMotion()) {
    // The window expands out of the card the visitor clicked.
    el.animate(
      [
        { transformOrigin: 'top left', transform: fromOrigin(entry.origin, el.getBoundingClientRect()), opacity: 0.35 },
        { transformOrigin: 'top left', transform: 'none', opacity: 1 },
      ],
      { duration: EXPAND_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    )
  }
}

function finish() {
  window.clearTimeout(timer)
  window.removeEventListener('message', onMessage)
  document.documentElement.style.overflow = ''
  dialog.value?.close()
  dialog.value?.getAnimations().forEach((animation) => animation.cancel())
  src.value = ''
  closing = false
  close()
}

/** Collapses back into the card, then closes. */
async function requestClose() {
  const el = dialog.value
  const entry = current.value
  if (!el || !entry || closing) return
  closing = true
  if (!reducedMotion() && el.open) {
    const animation = el.animate(
      [
        { transformOrigin: 'top left', transform: 'none', opacity: 1 },
        { transformOrigin: 'top left', transform: fromOrigin(entry.origin, el.getBoundingClientRect()), opacity: 0 },
      ],
      { duration: 300, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
    )
    await animation.finished.catch(() => undefined)
  }
  finish()
}

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) requestClose()
}

watch(current, (value) => {
  if (value) open()
})

watch(theme, (value) => {
  if (ready.value && view.value === 'about') post({ type: 'theme', theme: value })
})

onBeforeUnmount(() => {
  window.clearTimeout(timer)
  window.removeEventListener('message', onMessage)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <dialog
    ref="dialog"
    class="project-dialog"
    :class="{ 'is-max': maximized }"
    :aria-label="mfe ? `Projeto ${mfe.title}` : 'Projeto'"
    @cancel.prevent="requestClose"
    @click="onBackdrop"
  >
    <AeroWindow
      v-if="current && mfe && repo"
      as="div"
      class="modal"
      flush
      active
      live
      :maximized="maximized"
      :title="`${mfe.title}: ${view === 'app' ? 'rodando' : 'apresentação'}`"
      @close="requestClose"
      @minimize="requestClose"
      @maximize="maximized = !maximized"
    >
      <template #icon><Folder /></template>

      <div class="address">
        <div class="tabs" role="tablist" aria-label="Visões do projeto" @keydown="onTabKey">
          <button
            v-for="t in visibleTabs"
            :id="`pm-tab-${t.id}`"
            :key="t.id"
            type="button"
            role="tab"
            class="tab"
            :aria-selected="view === t.id"
            :tabindex="view === t.id ? 0 : -1"
            @click="load(t.id)"
          >
            {{ t.label }}
          </button>
        </div>
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="btn">
          Abrir no GitHub<ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <p v-if="view === 'app' && mfe.app?.hint" class="hint">{{ mfe.app.hint }}</p>

      <div class="stage">
        <iframe
          :key="src"
          ref="frame"
          :src="src"
          :title="`${mfe.title}: ${view === 'app' ? 'projeto rodando' : 'apresentação do projeto'}`"
          :sandbox="sandbox"
          referrerpolicy="no-referrer"
          @load="onFrameLoad"
        />
        <div v-if="!ready && !failed" class="status" role="status">
          <LoaderCircle class="spin" aria-hidden="true" />Carregando o micro-frontend…
        </div>
        <div v-else-if="failed && !ready" class="status" role="alert">
          Não foi possível carregar agora. Você ainda pode
          <a :href="repo.html_url" target="_blank" rel="noopener noreferrer">abrir o repositório no GitHub</a>.
        </div>
      </div>
    </AeroWindow>
  </dialog>
</template>

<style scoped>
.project-dialog {
  width: min(1100px, 94vw);
  height: min(780px, 88vh);
  max-width: none;
  max-height: none;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  color: var(--ink);
}

.project-dialog.is-max {
  width: calc(100% - var(--space-3));
  height: calc(100% - var(--space-3));
}

.project-dialog::backdrop {
  background: var(--a-black-55);
  backdrop-filter: blur(6px);
}

.project-dialog :deep(.modal) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.project-dialog :deep(.modal .client) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--line);
  background: var(--bg-sunken);
}

.tabs {
  display: flex;
  gap: var(--space-1);
  min-width: 0;
}

.tab {
  min-height: 44px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-m);
  background: transparent;
  color: var(--ink-2);
  font: inherit;
  font-size: 0.88rem;
  white-space: nowrap;
  cursor: pointer;
}

.tab:hover {
  border-color: var(--glass-edge);
  color: var(--ink);
}

.tab[aria-selected='true'] {
  border-color: var(--glass-edge);
  background: linear-gradient(180deg, var(--btn-top), var(--btn-bot));
  box-shadow: inset 0 1px 0 var(--glass-hi);
  color: var(--btn-ink);
  font-weight: 600;
}

.tab:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.hint {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--line);
  background: var(--accent-soft);
  color: var(--ink-2);
  font-size: 0.85rem;
}

.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  background: var(--win-body);
}

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--win-body);
}

.status {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--win-body);
  color: var(--ink-2);
  text-align: center;
}

.status svg {
  width: 24px;
  height: 24px;
  color: var(--accent-ink);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  /* On a phone the window fills the screen: every pixel goes to the project. */
  .project-dialog,
  .project-dialog.is-max {
    width: 100%;
    height: 100%;
    max-height: 100dvh;
  }

  .project-dialog :deep(.window) {
    border-radius: 0;
    padding: 0 var(--space-1) var(--space-1);
  }

  .address {
    flex-wrap: wrap;
    padding: var(--space-1) var(--space-2);
  }

  .tabs {
    flex: 1 1 100%;
  }

  .tab {
    flex: 1;
    padding-inline: var(--space-2);
  }

  .address .btn {
    flex: 1 1 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>
