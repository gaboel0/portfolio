<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, ExternalLink, Star } from 'lucide-vue-next'
import ProjectCover from './ProjectCover.vue'
import type { Project } from '@/types/portfolio'
import { formatRelative } from '@/utils/format'
import { languageColor } from '@/utils/languages'

const props = withDefaults(
  defineProps<{ project: Project; variant?: 'feature' | 'compact'; index?: number; lead?: boolean; split?: boolean }>(),
  { variant: 'compact', index: 0, lead: false, split: false },
)

const repo = computed(() => props.project.repo)
const title = computed(() => repo.value.name)
const highlights = computed(() => (props.lead || props.split ? props.project.curation?.highlights ?? [] : []))
</script>

<template>
  <article class="project hud" :class="[`project--${variant}`, { 'project--lead': lead, 'project--split': split }]">
    <ProjectCover
      v-if="variant === 'feature'"
      class="project__cover"
      :name="repo.name"
      :language="repo.language"
      :stack="project.tags"
      :emblem="project.curation?.emblem"
      :index="index"
:size="lead || split ? 'l' : 'm'"
    />

    <div class="project__body">
      <div class="project__meta mono">
        <span v-if="variant === 'feature'" class="badge">Destaque</span>
        <span v-else class="lang"><i :style="{ background: languageColor(repo.language) }" />{{ repo.language ?? 'Sem linguagem' }}</span>
        <span v-if="project.curation?.context" class="context">{{ project.curation.context }}</span>
      </div>

      <h3 class="project__title">
        <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="project__link">
          {{ title }}
          <span class="sr-only">(abre o repositório no GitHub em nova aba)</span>
        </a>
        <ArrowUpRight class="project__arrow" aria-hidden="true" />
      </h3>

      <p v-if="project.description" class="project__desc">{{ project.description }}</p>
      <p v-else class="project__desc project__desc--empty">Repositório sem descrição pública.</p>
      <p v-if="project.descriptionSource === 'readme'" class="project__source mono">Resumo do README</p>

      <ul v-if="highlights.length" class="project__highlights" role="list">
        <li v-for="item in highlights" :key="item">{{ item }}</li>
      </ul>

      <ul class="project__tags" role="list" aria-label="Tecnologias">
        <li v-for="tag in project.tags.slice(0, variant === 'feature' ? 6 : 4)" :key="tag" class="chip">{{ tag }}</li>
      </ul>

      <footer class="project__footer mono">
        <span>
          Atualizado
          <time :datetime="repo.pushed_at">{{ formatRelative(repo.pushed_at) }}</time>
        </span>
        <span v-if="repo.stargazers_count > 0" class="stars" :aria-label="`${repo.stargazers_count} estrelas`">
          <Star aria-hidden="true" />{{ repo.stargazers_count }}
        </span>
        <a
          v-if="project.homepage"
          class="demo"
          :href="project.homepage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink aria-hidden="true" />Demo
        </a>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.project {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
  overflow: hidden;
  transition:
    border-color var(--dur) ease,
    transform var(--dur) var(--ease-out),
    box-shadow var(--dur) ease;
}

.project:hover,
.project:focus-within {
  border-color: var(--line-strong);
  box-shadow: var(--shadow), 0 0 40px -18px var(--accent);
  transform: translateY(-3px);
}

.project:hover :deep(.block),
.project:focus-within :deep(.block) {
  transform: rotate(calc(var(--tilt) + 40deg)) scale(1.06);
}

.project__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  padding: var(--space-5);
}

.project__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.72rem;
  color: var(--ink-3);
}

.badge {
  padding: 0.15em 0.55em;
  background: var(--accent-soft);
  color: var(--accent-ink);
  border-radius: var(--radius-s);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.lang i {
  width: 8px;
  height: 8px;
}

.project__title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--step-2);
}

.project__title {
  letter-spacing: -0.03em;
}

.project--compact .project__title {
  font-size: var(--step-1);
}

.project--lead .project__title,
.project--split .project__title {
  font-size: var(--step-3);
}

/* The title link covers the whole card; secondary links sit above it. */
.project__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
}

.project__link:focus-visible {
  outline: none;
}

.project:has(.project__link:focus-visible) {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}

.project__arrow {
  flex: none;
  width: 1.1em;
  height: 1.1em;
  margin-top: 0.05em;
  color: var(--ink-3);
  transition:
    transform var(--dur) var(--ease-out),
    color var(--dur) ease;
}

.project:hover .project__arrow {
  color: var(--accent-ink);
  transform: translate(3px, -3px);
}

.project__desc {
  color: var(--ink-2);
  max-width: 62ch;
}

.project__desc--empty {
  color: var(--ink-3);
  font-style: italic;
}

.project__source {
  margin-top: calc(var(--space-2) * -1);
  font-size: 0.68rem;
  color: var(--ink-3);
}

.project__highlights {
  display: grid;
  gap: 6px;
  padding-top: var(--space-2);
  font-size: 0.92rem;
  color: var(--ink-2);
}

.project__highlights li {
  display: flex;
  gap: 10px;
}

.project__highlights li::before {
  content: '';
  flex: none;
  width: 10px;
  height: 1px;
  margin-top: 0.8em;
  background: var(--accent);
}

.project__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: var(--space-3);
}

.project__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--line);
  font-size: 0.72rem;
  color: var(--ink-3);
}

.project__footer svg {
  width: 13px;
  height: 13px;
}

.stars,
.demo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.demo {
  position: relative;
  z-index: 2;
  margin-left: auto;
  color: var(--accent-ink);
}

@media (min-width: 1024px) {
  .project--lead .project__cover {
    flex: 1;
    aspect-ratio: auto;
    min-height: 340px;
  }

  .project--lead .project__body {
    flex: none;
    padding: var(--space-6);
  }

  .project--split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  }

  .project--split .project__cover {
    order: 2;
    aspect-ratio: auto;
    min-height: 100%;
  }

  .project--split .project__body {
    padding: var(--space-6);
  }
}
</style>
