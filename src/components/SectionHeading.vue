<script setup lang="ts">
defineProps<{ index: string; label: string; id?: string }>()
</script>

<template>
  <header class="heading">
    <div class="bar" aria-hidden="true">
      <span class="tag mono"><i />{{ label }}</span>
      <span class="rule" />
      <span class="index mono">{{ index }}</span>
    </div>
    <h2 :id="id" class="title" v-reveal>
      <slot />
    </h2>
    <div v-if="$slots.lead" class="lead" v-reveal="80">
      <slot name="lead" />
    </div>
  </header>
</template>

<style scoped>
.heading {
  display: grid;
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  font-size: 0.64rem;
  text-transform: uppercase;
  color: var(--ink-2);
}

.tag i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
}

.index {
  font-size: 0.64rem;
  color: var(--ink-3);
}

.title {
  font-size: clamp(1.7rem, 7.4vw, 4.8rem);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  max-width: 18ch;
}

.lead {
  max-width: 54ch;
  color: var(--ink-2);
  font-size: var(--step-1);
  line-height: 1.55;
}
</style>
