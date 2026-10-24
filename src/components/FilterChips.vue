<script setup lang="ts">
defineProps<{ options: { value: string; count: number }[]; label: string }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="chips" role="group" :aria-label="label">
    <button type="button" class="opt" :aria-pressed="model === ''" @click="model = ''">Todos</button>
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="opt"
      :aria-pressed="model === opt.value"
      @click="model = model === opt.value ? '' : opt.value"
    >
      {{ opt.value }}<span class="count mono">{{ opt.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.opt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
  background: transparent;
  font-size: 0.85rem;
  color: var(--ink-2);
  transition:
    border-color var(--dur-fast) ease,
    background-color var(--dur-fast) ease,
    color var(--dur-fast) ease;
}

.opt:hover {
  border-color: var(--ink-3);
  color: var(--ink);
}

.opt[aria-pressed='true'] {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}

.count {
  font-size: 0.68rem;
  opacity: 0.6;
}

@media (max-width: 639px) {
  .chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .chips::-webkit-scrollbar {
    display: none;
  }

  .opt {
    flex: none;
  }
}
</style>
