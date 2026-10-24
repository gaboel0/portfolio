<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useAssistant } from '@/composables/useAssistant'

/**
 * Easter egg: an original paperclip assistant (a homage, drawn from scratch)
 * that floats over the page with a speech bubble and three actions.
 */
const { visible, hide } = useAssistant()

function go(hash: string) {
  hide()
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}

watch(visible, (value) => {
  if (value) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="pop">
    <aside v-if="visible" class="assistant" role="dialog" aria-label="Assistente" aria-live="polite">
      <div class="bubble">
        <p>Parece que você está avaliando um desenvolvedor front-end. Quer uma ajuda?</p>
        <div class="actions">
          <button type="button" class="btn" @click="go('#projetos')">Ver projetos</button>
          <button type="button" class="btn" @click="go('#contato')">Falar com o Gabriel</button>
          <button type="button" class="btn btn--ghost" @click="hide">Dispensar</button>
        </div>
      </div>

      <svg class="clip" viewBox="0 0 100 190" width="110" height="209" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#c9cbe0" />
            <stop offset="0.45" stop-color="#8d90b3" />
            <stop offset="1" stop-color="#5b5e82" />
          </linearGradient>
          <radialGradient id="eyeball" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset="1" stop-color="#d9dbea" />
          </radialGradient>
        </defs>
        <path
          class="wire-shadow"
          d="M36 54 A17 17 0 0 1 70 54 V158 A27 27 0 0 1 16 158 V86 A13 13 0 0 1 42 86 V148"
        />
        <path
          class="wire"
          d="M36 54 A17 17 0 0 1 70 54 V158 A27 27 0 0 1 16 158 V86 A13 13 0 0 1 42 86 V148"
        />
        <g class="eyes">
          <ellipse class="eye" cx="33" cy="62" rx="14" ry="15" />
          <ellipse class="eye" cx="64" cy="70" rx="14" ry="15" />
          <g class="pupils">
            <circle class="pupil" cx="35" cy="64" r="7.5" />
            <circle class="pupil" cx="66" cy="72" r="7.5" />
          </g>
        </g>
        <path class="brow" d="M14 40 Q26 30 42 38" />
        <path class="brow" d="M52 46 Q64 36 80 50" />
      </svg>
    </aside>
  </Transition>
</template>

<style scoped>
.assistant {
  position: fixed;
  right: 22px;
  bottom: calc(var(--taskbar-h) + 14px);
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  max-width: min(290px, calc(100vw - 32px));
  pointer-events: none;
}

.assistant > * {
  pointer-events: auto;
}

/* Speech bubble with a tail pointing at the clip. */
.bubble {
  position: relative;
  padding: 12px 14px;
  border: 1px solid var(--glass-edge);
  border-radius: var(--radius-l);
  background: color-mix(in srgb, var(--win-body) 70%, transparent);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    inset 0 0 0 1px var(--glass-hi),
    var(--win-shadow);
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--ink);
}

.bubble::after {
  content: '';
  position: absolute;
  right: 30px;
  bottom: -8px;
  width: 14px;
  height: 14px;
  border: solid var(--glass-edge);
  border-width: 0 1px 1px 0;
  background: color-mix(in srgb, var(--win-body) 70%, transparent);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  transform: rotate(45deg);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.actions .btn {
  min-height: 44px;
  padding-inline: 0.8em;
  font-size: 0.8rem;
}

.clip {
  margin-right: 14px;
  overflow: visible;
  filter: drop-shadow(0 6px 10px var(--a-black-35));
  transform: rotate(-14deg);
  animation: float 3.6s ease-in-out infinite;
}

.wire,
.wire-shadow {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Thin dark outline only: the clip's inside stays see-through. */
.wire-shadow {
  stroke: var(--hex-25254a);
  stroke-width: 8;
}

.wire {
  stroke: url(#wire);
  stroke-width: 5;
}

.eye {
  fill: url(#eyeball);
  stroke: var(--hex-25254a);
  stroke-width: 1.6;
}

.pupil {
  fill: var(--hex-0d0b1e);
}

.eyes {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 5s infinite;
}

.pupils {
  animation: look 6s ease-in-out infinite;
}

.brow {
  fill: none;
  stroke: var(--hex-0d0b1e);
  stroke-width: 3.6;
  stroke-linecap: round;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-14deg);
  }
  50% {
    transform: translateY(-8px) rotate(-9deg);
  }
}

@keyframes blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes look {
  0%,
  100% {
    transform: translateX(0);
  }
  40% {
    transform: translate(-2.5px, 1px);
  }
  70% {
    transform: translate(2.5px, -1px);
  }
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity var(--dur) ease,
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
}


@media (max-width: 480px) {
  .assistant {
    right: var(--space-3);
    max-width: calc(100vw - var(--space-5));
  }

  .clip {
    width: 72px;
    height: auto;
    margin-right: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .clip,
  .eyes,
  .pupils {
    animation: none;
  }
}
</style>
