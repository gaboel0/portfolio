<script setup lang="ts">
import { GraduationCap, Languages } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import { education, languages } from '@/data/profile'
import { formatMonth } from '@/utils/format'
</script>

<template>
  <section id="formacao" class="section" aria-labelledby="formacao-title">
    <div class="container layout">
      <header class="intro">
        <h2 id="formacao-title">Base <em>acadêmica</em></h2>
      </header>

      <AeroWindow as="article" class="block" v-reveal title="Graduação" aria-labelledby="edu-course">
        <template #icon><GraduationCap /></template>
        <h3 id="edu-course">{{ education.course }}</h3>
        <p class="inst">{{ education.institution }}</p>
        <ul role="list" class="periods mono">
          <li v-for="p in education.periods" :key="p.start">
            <time :datetime="p.start">{{ formatMonth(p.start) }}</time> — <time :datetime="p.end">{{ formatMonth(p.end) }}</time>
          </li>
        </ul>
      </AeroWindow>

      <AeroWindow
        v-for="lang in languages"
        :key="lang.name"
        as="article"
        v-reveal="80"
        class="block"
        title="Idioma"
        :aria-labelledby="`lang-${lang.name}`"
      >
        <template #icon><Languages /></template>
        <h3 :id="`lang-${lang.name}`">{{ lang.name }}</h3>
        <dl class="levels">
          <div v-for="l in lang.levels" :key="l.skill">
            <dt>{{ l.skill }}</dt>
            <dd class="mono">{{ l.level }}</dd>
          </div>
        </dl>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--space-5);
}

.intro h2 {
  max-width: 100%;
  font-size: clamp(1.7rem, 3.6vw, 2.6rem);
  font-weight: 300;
  text-shadow: var(--title-glow);
}

.block h3 {
  font-size: var(--step-1);
}

.inst {
  color: var(--accent-ink);
  font-size: 0.9rem;
}

.periods {
  display: grid;
  gap: 4px;
  margin-top: var(--space-3);
  font-size: 0.78rem;
  color: var(--ink-2);
}

.levels {
  display: grid;
  margin-top: var(--space-2);
}

.levels div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 8px 0;
  border-bottom: 1px dashed var(--line);
}

.levels div:last-child {
  border-bottom: 0;
}

.levels dt {
  color: var(--ink-2);
}

.levels dd {
  font-size: 0.8rem;
}

@media (min-width: 720px) {
  .layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .intro {
    grid-column: 1 / -1;
  }
}

/* The heading keeps its own row so the outlined word is never clipped by the cards. */
@media (min-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: var(--space-6);
    align-items: stretch;
  }
}
</style>
