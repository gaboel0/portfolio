<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, ExternalLink, Folder, Star } from 'lucide-vue-next'
import AeroWindow from './AeroWindow.vue'
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
</script>

<template>
  <AeroWindow
    as="article"
    flush
    class="project"
    :class="[`project--${variant}`, { 'project--lead': lead, 'project--split': split }]"
    :title="repo.name"
  >
    <template #icon><Folder /></template>
    <ProjectCover
      v-if="variant === 'feature'"
      class="project__cover"
      :name="repo.name"
      :language="repo.language"
      :stack="project.tags"
      :emblem="project.curation?.emblem"
      :index="index"
    />

    <div class="project__body">
      <div class="project__meta mono">
        <span v-if="variant !== 'feature'" class="lang"><i :style="{ background: languageColor(repo.language) }" />{{ repo.language ?? 'Sem linguagem' }}</span>
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

      <ul class="project__tags" role="list" aria-label="Tecnologias">
        <li v-for="tag in project.tags.slice(0, 3)" :key="tag" class="chip">{{ tag }}</li>
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
  </AeroWindow>
</template>

<style scoped>
.project {
  display: flex;
  flex-direction: column;
}

.project :deep(.client) {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.project:hover,
.project:focus-within {
  transform: translateY(-3px);
  box-shadow:
    inset 0 0 0 1px var(--glass-hi),
    0 0 0 1px var(--accent),
    0 0 26px -6px var(--accent),
    var(--win-shadow);
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
  font-size: var(--step-2);
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project__desc--empty {
  color: var(--ink-3);
  font-style: italic;
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
</style>
