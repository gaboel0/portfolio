<script setup lang="ts">
import { GraduationCap, Languages } from 'lucide-vue-next'
import { education, languages } from '@/data/profile'
import { formatMonth } from '@/utils/format'
</script>

<template>
  <section id="formacao" class="section" aria-labelledby="formacao-title">
    <div class="container layout">
      <header class="intro">
        <p class="meta mono"><i aria-hidden="true" />Formação e idiomas <span class="idx">06</span></p>
        <h2 id="formacao-title">Base <em>acadêmica</em></h2>
      </header>

      <article class="block hud" v-reveal aria-labelledby="edu-course">
        <GraduationCap class="icon" aria-hidden="true" />
        <p class="eyebrow">Graduação</p>
        <h3 id="edu-course">{{ education.course }}</h3>
        <p class="inst">{{ education.institution }}</p>
        <ul role="list" class="periods mono">
          <li v-for="p in education.periods" :key="p.start">
            <time :datetime="p.start">{{ formatMonth(p.start) }}</time> — <time :datetime="p.end">{{ formatMonth(p.end) }}</time>
          </li>
        </ul>
      </article>

      <article v-for="lang in languages" :key="lang.name" v-reveal="80" class="block hud" :aria-labelledby="`lang-${lang.name}`">
        <Languages class="icon" aria-hidden="true" />
        <p class="eyebrow">Idioma</p>
        <h3 :id="`lang-${lang.name}`">{{ lang.name }}</h3>
        <dl class="levels">
          <div v-for="l in lang.levels" :key="l.skill">
            <dt>{{ l.skill }}</dt>
            <dd class="mono">{{ l.level }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--space-5);
}

.meta {
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

.meta i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.meta .idx {
  color: var(--ink-3);
}

.intro h2 {
  max-width: 100%;
  overflow-wrap: anywhere;
  margin-top: var(--space-3);
  font-size: clamp(1.7rem, 7vw, 3rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

.block {
  position: relative;
  display: grid;
  align-content: start;
  gap: 6px;
  padding: var(--space-5);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
  background: var(--bg-elev);
}

.icon {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  width: 20px;
  height: 20px;
  color: var(--ink-3);
}

.block h3 {
  font-size: var(--step-1);
  padding-right: 32px;
}

.inst {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--accent-ink);
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
