<script setup lang="ts">
/**
 * A Windows 7 "Aero" window: translucent glass frame, title bar with an icon
 * and caption buttons, and an opaque client area. By default the caption
 * buttons are decoration only (aria-hidden, not focusable); with `live` they
 * become real buttons that emit minimize, maximize and close.
 */
withDefaults(
  defineProps<{ title: string; as?: string; flush?: boolean; active?: boolean; live?: boolean; maximized?: boolean }>(),
  { as: 'section', flush: false, active: false, live: false, maximized: false },
)

defineEmits<{ minimize: []; maximize: []; close: [] }>()
</script>

<template>
  <component :is="as" class="window" :class="{ 'window--active': active }">
    <header class="titlebar">
      <span class="icon" aria-hidden="true"><slot name="icon" /></span>
      <span class="caption">{{ title }}</span>
      <span v-if="live" class="controls">
        <button type="button" class="cap cap--min" aria-label="Minimizar e voltar ao card" @click="$emit('minimize')"><b /></button>
        <button
          type="button"
          class="cap cap--max"
          :aria-label="maximized ? 'Restaurar tamanho' : 'Maximizar'"
          :aria-pressed="maximized"
          @click="$emit('maximize')"
        >
          <b />
        </button>
        <button type="button" class="cap cap--close" aria-label="Fechar" @click="$emit('close')"><b /></button>
      </span>
      <span v-else class="controls" aria-hidden="true">
        <i class="cap cap--min"><b /></i>
        <i class="cap cap--max"><b /></i>
        <i class="cap cap--close"><b /></i>
      </span>
    </header>
    <div class="client" :class="{ 'client--flush': flush }">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.window {
  --bg-elev: var(--win-body);
  position: relative;
  border: 1px solid var(--glass-edge);
  border-radius: var(--radius-l);
  padding: 0 6px 6px;
  background: var(--glass);
  background-image: var(--glass-sheen);
  background-repeat: no-repeat;
  background-size: 100% 120px;
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  box-shadow:
    inset 0 0 0 1px var(--glass-hi),
    var(--win-shadow);
  transition:
    box-shadow var(--dur) ease,
    transform var(--dur) var(--ease-out);
}

.titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 0 0 4px;
  color: var(--title-ink);
  text-shadow: var(--title-glow);
  user-select: none;
}

.icon {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
}

.icon :slotted(svg) {
  width: 15px;
  height: 15px;
}

.caption {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
}

.controls {
  display: inline-flex;
  align-self: flex-start;
  margin-top: -1px;
  border: 1px solid var(--glass-edge);
  border-top-color: transparent;
  border-radius: 0 0 5px 5px;
  overflow: hidden;
  box-shadow: 0 1px 2px var(--a-black-35);
}

.cap {
  position: relative;
  display: grid;
  place-items: center;
  width: 27px;
  height: 18px;
  background: linear-gradient(180deg, var(--btn-top), var(--btn-bot));
  border-left: 1px solid var(--glass-edge);
  box-shadow: inset 0 1px 0 var(--glass-hi);
}

button.cap {
  padding: 0;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  cursor: pointer;
}

button.cap:hover {
  filter: brightness(1.18);
}

button.cap:active {
  filter: brightness(0.85);
}

button.cap:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.cap:first-child {
  border-left: 0;
}

.cap b {
  display: block;
  position: relative;
  color: var(--btn-ink);
}

/* Glyphs drawn with borders so no icon font is needed. */
.cap--min b {
  width: 8px;
  height: 0;
  margin-top: 5px;
  border-top: 2px solid currentColor;
}

.cap--max b {
  width: 9px;
  height: 7px;
  border: 1px solid currentColor;
  border-top-width: 2px;
}

.cap--close {
  width: 42px;
  background: linear-gradient(180deg, var(--hex-e98a8a) 0%, var(--hex-d0414a) 48%, var(--hex-b3182a) 52%, var(--hex-d44a52) 100%);
}

.cap--close b {
  width: 10px;
  height: 10px;
  color: var(--hex-f6f4ff);
}

.cap--close b::before,
.cap--close b::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 11px;
  height: 2px;
  margin: -1px 0 0 -5.5px;
  background: currentColor;
  filter: drop-shadow(0 0 2px var(--a-80-0-20-70));
}

.cap--close b::before {
  transform: rotate(45deg);
}

.cap--close b::after {
  transform: rotate(-45deg);
}

.client {
  position: relative;
  border: 1px solid var(--glass-edge);
  border-radius: 2px;
  background: var(--win-body);
  color: var(--ink);
  box-shadow: inset 0 1px 2px var(--a-black-18);
}

.client:not(.client--flush) {
  padding: var(--space-5);
}

/* Touch: the real caption buttons grow to a finger-sized target. */
@media (pointer: coarse) {
  .window:has(button.cap) .titlebar {
    min-height: 44px;
  }

  .controls button.cap {
    width: 48px;
    height: 40px;
  }

  .controls button.cap--close {
    width: 64px;
  }
}

.window--active {
  box-shadow:
    inset 0 0 0 1px var(--glass-hi),
    0 0 0 1px var(--accent),
    var(--win-shadow);
}
</style>
