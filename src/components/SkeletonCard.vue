<script setup lang="ts">
withDefaults(defineProps<{ cover?: boolean }>(), { cover: false })
</script>

<template>
  <div class="skeleton" aria-hidden="true">
    <div v-if="cover" class="bar cover" />
    <div class="pad">
      <div class="bar" style="width: 30%" />
      <div class="bar title" style="width: 65%" />
      <div class="bar" />
      <div class="bar" style="width: 80%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  border: 1px solid var(--line);
  border-radius: var(--radius-m);
  overflow: hidden;
  background: var(--bg-elev);
}

.pad {
  display: grid;
  gap: 12px;
  padding: var(--space-5);
}

.bar {
  height: 10px;
  border-radius: var(--radius-s);
  background: linear-gradient(90deg, var(--bg-sunken) 0%, var(--line) 50%, var(--bg-sunken) 100%) 0 0 / 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.bar.title {
  height: 22px;
}

.bar.cover {
  height: auto;
  aspect-ratio: 16 / 10;
  border-radius: 0;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
</style>
