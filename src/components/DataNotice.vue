<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'
import { useGithub } from '@/composables/useGithub'
import { formatDate, formatTime } from '@/utils/format'

const { source, error, status, retry, snapshotDate } = useGithub()

const resetLabel = computed(() => (error.value?.resetAt ? formatTime(error.value.resetAt) : null))
</script>

<template>
  <div v-if="source === 'snapshot' && error" class="notice" role="status">
    <AlertTriangle class="icon" aria-hidden="true" />
    <p>
      <strong>{{ error.message }}</strong>
      Exibindo uma cópia dos dados públicos capturada em {{ formatDate(snapshotDate) }}.
      <template v-if="resetLabel"> O limite é renovado às {{ resetLabel }}.</template>
    </p>
    <button type="button" class="btn btn--ghost" :disabled="status === 'loading'" @click="retry">
      <RefreshCw aria-hidden="true" />Tentar de novo
    </button>
  </div>
</template>

<style scoped>
.notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--line-strong);
  border-left: 3px solid var(--accent);
  background: var(--bg-elev);
  font-size: 0.92rem;
  color: var(--ink-2);
}

.notice p {
  flex: 1 1 320px;
}

.notice strong {
  color: var(--ink);
  font-weight: 600;
}

.icon {
  width: 18px;
  height: 18px;
  color: var(--accent-ink);
}
</style>
