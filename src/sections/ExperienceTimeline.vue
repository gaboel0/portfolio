<script setup lang="ts">
import { Briefcase } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { experience } from '@/data/profile'
import { formatDuration, formatMonth } from '@/utils/format'
</script>

<template>
  <section id="experiencia" class="section" aria-labelledby="experiencia-title">
    <div class="container">
      <SectionHeading id="experiencia-title">
        Trajetória <em>profissional</em>
      </SectionHeading>

      <ol role="list" class="timeline">
        <li v-for="(role, i) in experience" :key="role.title" v-reveal="i * 80" class="role" :class="{ 'role--current': role.current }">
          <div class="when">
            <p class="period mono">
              <time :datetime="role.start">{{ formatMonth(role.start) }}</time>
              —
              <time v-if="role.end" :datetime="role.end">{{ formatMonth(role.end) }}</time>
              <span v-else>presente</span>
            </p>
            <p class="duration mono">{{ formatDuration(role.start, role.end) }}</p>
            <span v-if="role.current" class="badge mono">Atual</span>
          </div>

          <span class="node" aria-hidden="true" />

          <AeroWindow as="div" class="card" :title="`${role.company} — ${role.title}`" :active="role.current">
            <template #icon><Briefcase /></template>
            <div class="card__body">
            <header>
              <h3>{{ role.title }}</h3>
              <p class="company">{{ role.company }}</p>
            </header>
            <p class="summary">{{ role.summary }}</p>
            <ul role="list" class="duties">
              <li v-for="item in role.responsibilities" :key="item">{{ item }}</li>
            </ul>
            </div>
          </AeroWindow>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  gap: var(--space-7);
}

.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 5px;
  width: 1px;
  background: var(--line-strong);
}

.role {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  padding-left: var(--space-6);
}

.node {
  position: absolute;
  top: 6px;
  left: 0;
  width: 11px;
  height: 11px;
  border: 1px solid var(--ink-3);
  background: var(--bg);
}

.role--current .node {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 0 5px var(--accent-soft);
}

.when {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
}

.period {
  font-size: 0.8rem;
  color: var(--ink);
  text-transform: capitalize;
}

.duration {
  font-size: 0.75rem;
  color: var(--ink-3);
}

.badge {
  padding: 0.1em 0.55em;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: var(--radius-s);
}

.card__body {
  display: grid;
  gap: var(--space-3);
}

.card h3 {
  font-size: var(--step-2);
  letter-spacing: -0.03em;
}

.role--current .card h3 {
  font-size: var(--step-3);
}

.company {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--accent-ink);
}

.summary {
  max-width: 60ch;
  color: var(--ink-2);
}

.duties {
  display: grid;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--ink-2);
}

.duties li {
  display: flex;
  gap: 12px;
}

.duties li::before {
  content: '';
  flex: none;
  width: 12px;
  height: 1px;
  margin-top: 0.8em;
  background: var(--ink-3);
}

.role--current .duties li::before {
  background: var(--accent);
}

@media (min-width: 900px) {
  .timeline::before {
    left: calc(220px + var(--space-8) / 2);
  }

  .role {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: var(--space-8);
    padding-left: 0;
  }

  .when {
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    padding-top: 2px;
  }

  .node {
    left: calc(220px + var(--space-8) / 2 - 5px);
  }

    .role--current .duties {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-6);
  }
}
</style>
