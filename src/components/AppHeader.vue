<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Mail, Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

/** A Windows 7 style taskbar: start orb, one pinned item, tray with theme switch and clock. */
const { theme, toggle } = useTheme()

const now = ref(new Date())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date()), 15_000)
})
onBeforeUnmount(() => window.clearInterval(timer))

const time = () => now.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const date = () => now.value.toLocaleDateString('pt-BR')
</script>

<template>
  <header class="taskbar">
    <div class="bar">
      <a href="#inicio" class="signature" aria-label="Gabriel Figueiredo, voltar ao início">
        <span class="orb" aria-hidden="true" />
      </a>

      <a href="#contato" class="task contact">
        <Mail aria-hidden="true" />
        <span>Contato</span>
      </a>

      <div class="tray">
        <button
          type="button"
          class="tray-btn theme-btn"
          :aria-label="theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'"
          @click="toggle"
        >
          <Transition name="swap" mode="out-in">
            <Sun v-if="theme === 'dark'" key="sun" aria-hidden="true" />
            <Moon v-else key="moon" aria-hidden="true" />
          </Transition>
        </button>

        <time class="clock" :datetime="now.toISOString()">
          <span>{{ time() }}</span>
          <span>{{ date() }}</span>
        </time>

        <a href="#inicio" class="peek" aria-label="Voltar ao topo" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.taskbar {
  --bar-bg: var(--a-18-16-48-78);
  --bar-ink: var(--hex-f1efff);
  position: fixed;
  inset: auto 0 0;
  z-index: 50;
  height: var(--taskbar-h);
  border-top: 1px solid var(--a-190-178-255-45);
  background:
    linear-gradient(180deg, var(--a-white-30) 0%, var(--a-white-7) 48%, var(--a-white-0) 50%, var(--a-143-128-255-12) 100%),
    var(--bar-bg);
  backdrop-filter: blur(16px) saturate(1.6);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
  box-shadow:
    inset 0 1px 0 var(--a-white-35);
  color: var(--bar-ink);
}

:global(:root[data-theme='light']) .taskbar {
  --bar-bg: var(--a-66-58-150-70);
}

.bar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding-inline: 6px 0;
}

/* Start orb ---------------------------------------------------------------- */
.signature {
  display: grid;
  place-items: center;
  width: 54px;
  height: 100%;
  border-radius: 4px;
  transition: background-color var(--dur-fast) ease;
}

.signature:hover {
  background: var(--a-white-14);
}

.orb {
  position: relative;
  display: block;
  width: 38px;
  height: 38px;
  margin-top: -6px;
  border-radius: 50%;
  border: 2px solid var(--a-white-60);
  background:
    radial-gradient(ellipse at 50% 18%, var(--a-white-70) 0%, var(--a-white-0) 45%),
    radial-gradient(circle at 63% 38%, var(--hex-05040a) 50%, var(--orb-ring) 55%, var(--hex-3a2d9c) 100%);
  box-shadow:
    0 0 14px var(--a-143-128-255-85),
    inset 0 -7px 10px var(--a-black-55),
    inset 0 1px 1px var(--a-white-80);
  transition:
    box-shadow var(--dur) ease,
    transform var(--dur) var(--ease-out);
}

/* Crimson slash across the eclipse — the one detail that is pure Sasuke. */
.orb::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -4px;
  bottom: -4px;
  width: 1.5px;
  background: linear-gradient(180deg, transparent, var(--crimson) 25%, var(--crimson) 75%, transparent);
  transform: rotate(32deg);
}

.signature:hover .orb {
  box-shadow:
    0 0 22px var(--a-179-169-255-100),
    inset 0 -7px 10px var(--a-black-45),
    inset 0 1px 1px var(--a-white-90);
}

/* Pinned item -------------------------------------------------------------- */
.task {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--a-white-28);
  border-radius: 3px;
  background: linear-gradient(180deg, var(--a-white-28), var(--a-white-6) 50%, var(--a-white-12));
  box-shadow: inset 0 1px 0 var(--a-white-40);
  font-size: 0.85rem;
  transition:
    box-shadow var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.task:hover {
  border-color: var(--a-214-205-255-80);
  box-shadow:
    inset 0 1px 0 var(--a-white-50),
    0 0 12px var(--a-143-128-255-60);
}

.task svg {
  width: 16px;
  height: 16px;
}

/* Tray --------------------------------------------------------------------- */
.tray {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  margin-left: auto;
}

.tray-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  overflow: hidden;
  transition:
    background-color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.tray-btn:hover {
  border-color: var(--a-white-35);
  background: linear-gradient(180deg, var(--a-white-28), var(--a-white-5));
}

.tray-btn svg {
  width: 18px;
  height: 18px;
}

.clock {
  display: grid;
  justify-items: center;
  padding: 0 8px;
  font-size: 0.72rem;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 1px var(--a-black-50);
}

/* "Show desktop" sliver at the far right. */
.peek {
  align-self: stretch;
  width: 12px;
  margin-left: 4px;
  border-left: 1px solid var(--a-white-40);
  background: linear-gradient(180deg, var(--a-white-28), var(--a-white-5));
  transition: background-color var(--dur-fast) ease;
}

.peek:hover {
  background: var(--a-white-40);
}

.signature:focus-visible,
.task:focus-visible,
.tray-btn:focus-visible,
.peek:focus-visible {
  outline: 2px solid var(--hex-f6f4ff);
  outline-offset: -3px;
}

/* Sun rises from below, moon drops in from above. */
.swap-enter-active,
.swap-leave-active {
  transition:
    transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 220ms ease;
}


@media (max-width: 480px) {
  .task span {
    display: none;
  }

  .task {
    padding: 0 10px;
  }

  .clock span:last-child {
    display: none;
  }
}
</style>
