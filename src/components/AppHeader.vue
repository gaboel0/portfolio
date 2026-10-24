<script setup lang="ts">
import { ArrowUpRight, Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <header class="header">
    <div class="container bar">
      <a href="#inicio" class="glass signature" aria-label="Gabriel Figueiredo — voltar ao início">
        <span class="sig-mark" aria-hidden="true" />
        <span class="sig-name">Gabriel F<span class="accent">.</span></span>
      </a>

      <div class="actions">
        <button
          type="button"
          class="glass icon-btn theme-btn"
          :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
          @click="toggle"
        >
          <Transition name="swap" mode="out-in">
            <Sun v-if="theme === 'dark'" key="sun" aria-hidden="true" />
            <Moon v-else key="moon" aria-hidden="true" />
          </Transition>
        </button>
        <a href="#contato" class="btn btn--primary contact">Contato<ArrowUpRight class="arrow" aria-hidden="true" /></a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  padding-top: 14px;
  pointer-events: none;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: 52px;
}

.bar > * {
  pointer-events: auto;
}

.glass {
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-elev) 72%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  color: var(--ink);
  transition:
    background-color var(--dur) ease,
    border-color var(--dur) ease,
    color var(--dur) ease;
}

.signature {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 18px 0 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.sig-mark {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 62% 38%, #05040a 54%, var(--accent) 57%, transparent 70%);
  box-shadow: 0 0 16px -2px var(--accent);
}

.sig-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background: var(--crimson);
  transform: rotate(32deg);
}

.signature .accent {
  color: var(--crimson);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
}

.icon-btn:hover {
  border-color: var(--ink-2);
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.theme-btn {
  overflow: hidden;
}

.theme-btn:hover svg {
  transform: rotate(25deg);
}

.theme-btn svg {
  transition: transform var(--dur) var(--ease-out);
}

/* Sun rises from below, moon drops in from above. */
.swap-enter-active,
.swap-leave-active {
  transition:
    transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 220ms ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(18px) rotate(-90deg) scale(0.5);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-18px) rotate(90deg) scale(0.5);
}

.contact {
  min-height: 48px;
}

@media (max-width: 420px) {
  .signature .sig-name {
    display: none;
  }

  .signature {
    padding-right: 8px;
  }
}
</style>
