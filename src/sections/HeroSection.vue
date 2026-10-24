<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, ArrowUpRight, Folder, Mail, MapPin } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import BrandIcon from '@/components/BrandIcon.vue'
import HeroCanvas from '@/components/HeroCanvas.vue'
import { useAssistant } from '@/composables/useAssistant'
import { useDraggableWindow } from '@/composables/useDraggableWindow'
import { person } from '@/data/profile'

const stage = ref<InstanceType<typeof HeroCanvas> | null>(null)
const welcome = ref<InstanceType<typeof AeroWindow> | null>(null)

// Only this window can be moved around the desktop.
useDraggableWindow(welcome)

const { show } = useAssistant()
const MOON_CLICKS = 5
const CLICK_GAP_MS = 1500
let moonClicks = 0
let lastMoonClick = 0

/** Clicking empty desktop releases lightning; five quick clicks on the moon wake the assistant. */
function onSkyClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a, button, .window')) return
  stage.value?.burst()

  if (!stage.value?.isMoon(e)) {
    moonClicks = 0
    return
  }
  const now = performance.now()
  moonClicks = now - lastMoonClick > CLICK_GAP_MS ? 1 : moonClicks + 1
  lastMoonClick = now
  if (moonClicks >= MOON_CLICKS) {
    moonClicks = 0
    show()
  }
}
</script>

<template>
  <section id="inicio" class="hero" aria-labelledby="hero-title" @click="onSkyClick">
    <HeroCanvas ref="stage" />
    <div class="veil" aria-hidden="true" />

    <div class="container content">
      <ul class="icons" role="list" aria-label="Atalhos">
        <li>
          <a href="#projetos" class="icon">
            <span class="tile"><Folder aria-hidden="true" /></span>
            <span class="label">Projetos</span>
          </a>
        </li>
        <li>
          <a :href="person.github" target="_blank" rel="noopener noreferrer" class="icon">
            <span class="tile"><BrandIcon name="github" :size="26" /></span>
            <span class="label">GitHub</span>
          </a>
        </li>
        <li>
          <a :href="person.linkedin" target="_blank" rel="noopener noreferrer" class="icon">
            <span class="tile"><BrandIcon name="linkedin" :size="26" /></span>
            <span class="label">LinkedIn</span>
          </a>
        </li>
        <li>
          <a :href="`mailto:${person.email}`" class="icon">
            <span class="tile"><Mail aria-hidden="true" /></span>
            <span class="label">E-mail</span>
          </a>
        </li>
      </ul>

      <AeroWindow ref="welcome" as="div" class="welcome" title="Gabriel Figueiredo: Portfólio" active>
        <template #icon><span class="mini-orb" /></template>

        <div class="body">
          <h1 id="hero-title" class="name">
            Gabriel Figueiredo
            <span class="sr-only">dos Santos</span>
          </h1>
          <p class="role">Desenvolvedor de software, front-end</p>

          <p class="lead">
            Resolvo <strong>problemas de interface</strong> em plataformas web e mobile na Unipac, levando cada tela do
            protótipo até o código em produção.
          </p>

          <div class="cta">
            <a href="#projetos" class="btn btn--primary">Ver projetos<ArrowDown class="arrow" aria-hidden="true" /></a>
            <a href="#contato" class="btn">Contato<ArrowUpRight class="arrow" aria-hidden="true" /></a>
          </div>

          <p class="where"><MapPin aria-hidden="true" />{{ person.location }}</p>
        </div>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: max(calc(100svh - var(--taskbar-h)), 560px);
  overflow: hidden;
  isolation: isolate;
  cursor: crosshair;
}

.veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgb(var(--hero-veil) / 0.7) 0%, rgb(var(--hero-veil) / 0.2) 55%, transparent 80%);
}

/* Like a real desktop: icons and window hug the left edge instead of a centred column. */
.hero .content {
  max-width: none;
  margin-inline: 0;
  padding-inline: clamp(10px, 1.6vw, 24px);
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: space-between;
  gap: var(--space-6);
  padding-block: var(--space-6);
  pointer-events: none;
}

.content a,
.content .window {
  pointer-events: auto;
  cursor: default;
}

/* Desktop icons ------------------------------------------------------------ */
.icons {
  display: flex;
  gap: var(--space-2);
}

.icon {
  display: grid;
  justify-items: center;
  gap: 4px;
  width: 84px;
  padding: 8px 4px 6px;
  border: 1px solid transparent;
  border-radius: 3px;
  color: var(--ink);
  transition:
    background-color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.icon:hover,
.icon:focus-visible {
  border-color: var(--glass-edge);
  background: linear-gradient(180deg, var(--glass-hi), var(--glass));
  box-shadow: inset 0 0 0 1px var(--glass-hi);
}

.tile {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid var(--glass-edge);
  border-radius: 8px;
  background: linear-gradient(180deg, var(--btn-top), var(--btn-bot));
  box-shadow:
    inset 0 1px 0 var(--glass-hi),
    0 3px 8px var(--a-black-35);
  color: var(--btn-ink);
}

.tile svg {
  width: 26px;
  height: 26px;
}

.label {
  font-size: 0.78rem;
  text-align: center;
  text-shadow: var(--title-glow);
}

/* Welcome window ----------------------------------------------------------- */
.welcome {
  width: min(100%, 640px);
  justify-self: start;
}

.welcome :deep(.drag-handle) {
  cursor: grab;
  touch-action: none;
}

.welcome :deep(.drag-handle:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.welcome.is-dragging {
  z-index: 5;
  box-shadow:
    inset 0 0 0 1px var(--glass-hi),
    0 0 0 1px var(--accent),
    0 22px 48px -10px var(--a-black-70);
}

.welcome.is-dragging :deep(.drag-handle) {
  cursor: grabbing;
}

.mini-orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 63% 38%, var(--hex-05040a) 50%, var(--orb-ring) 58%);
  box-shadow: 0 0 6px var(--orb-ring);
}

.body {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-2);
}

.name {
  font-size: clamp(2.2rem, 5.6vw, 3.8rem);
  font-weight: 600;
  overflow-wrap: break-word;
  min-width: 0;
  line-height: 1;
}

.role {
  color: var(--ink-3);
  font-size: var(--step-1);
}

.lead {
  max-width: 48ch;
  color: var(--ink-2);
  font-size: var(--step-1);
  line-height: 1.5;
}

.lead strong {
  color: var(--ink);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.where {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: var(--space-3);
  border-top: 1px solid var(--line);
  font-size: 0.85rem;
  color: var(--ink-3);
}

.where svg {
  width: 15px;
  height: 15px;
}

@media (min-width: 1024px) {
  .content {
    grid-template-columns: 92px minmax(0, 1fr);
    align-content: stretch;
    align-items: end;
    column-gap: var(--space-4);
  }

  .icons {
    flex-direction: column;
    align-self: start;
  }

  .welcome {
    margin-bottom: var(--space-6);
  }
}

@media (max-width: 1023px) {
  .veil {
    background: linear-gradient(0deg, rgb(var(--hero-veil) / 0.8) 0%, rgb(var(--hero-veil) / 0.3) 60%, transparent 90%);
  }

  .icons {
    flex-wrap: wrap;
  }
}
</style>
