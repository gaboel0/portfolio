<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <header class="heading">
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
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, var(--glass-edge), transparent 70%) 1;
}

.title {
  max-width: 24ch;
  font-size: clamp(1.7rem, 3.6vw, 2.6rem);
  font-weight: 300;
  line-height: 1.1;
  text-shadow: var(--title-glow);
}

.title :deep(em) {
  font-weight: 600;
}

.lead {
  max-width: 54ch;
  color: var(--ink-2);
  font-size: var(--step-0);
  line-height: 1.55;
}

@media (min-width: 1000px) {
  .heading {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: end;
    column-gap: var(--space-8);
  }

}
</style>
