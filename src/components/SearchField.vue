<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

defineProps<{ label: string; placeholder?: string; id: string }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="field">
    <label :for="id" class="sr-only">{{ label }}</label>
    <Search class="icon" aria-hidden="true" />
    <input
      :id="id"
      v-model="model"
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @keydown.esc="model = ''"
    />
    <button v-if="model" type="button" class="clear" aria-label="Limpar busca" @click="model = ''">
      <X aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.field {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

.icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: var(--ink-3);
  pointer-events: none;
}

input {
  width: 100%;
  min-height: 46px;
  padding: 0 44px 0 42px;
  border: 1px solid var(--ink-3);
  border-radius: var(--radius-m);
  background: var(--bg-elev);
  transition: border-color var(--dur-fast) ease;
}

input::placeholder {
  color: var(--ink-3);
}

input:hover {
  border-color: var(--ink-2);
}

input:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 1px;
  border-color: transparent;
}

input::-webkit-search-cancel-button {
  display: none;
}

.clear {
  position: absolute;
  right: 6px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  color: var(--ink-3);
}

.clear:hover {
  color: var(--ink);
}

.clear svg {
  width: 16px;
  height: 16px;
}
</style>
