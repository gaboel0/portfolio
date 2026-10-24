<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, SearchX } from 'lucide-vue-next'
import BrandIcon from '@/components/BrandIcon.vue'
import CoverStage from '@/components/CoverStage.vue'
import DataNotice from '@/components/DataNotice.vue'
import FilterChips from '@/components/FilterChips.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import SearchField from '@/components/SearchField.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useGithub } from '@/composables/useGithub'
import { person } from '@/data/profile'
import { formatRelative, pad } from '@/utils/format'
import { languageColor } from '@/utils/languages'
import { isFilterable, matchesQuery } from '@/utils/projects'
import type { Project } from '@/types/portfolio'

const { status, projects, featured } = useGithub()

const query = ref('')
const tag = ref('')

const featuredIds = computed(() => new Set(featured.value.map((p) => p.repo.id)))

/** Secondary projects: real code, not featured, ranked by the same score. */
const others = computed(() =>
  projects.value
    .filter((p) => p.status === 'active' && !featuredIds.value.has(p.repo.id))
    .sort((a, b) => b.score - a.score),
)

const pool = computed(() => [...featured.value, ...others.value])

const tagOptions = computed(() => {
  const counts = new Map<string, number>()
  for (const p of pool.value) for (const t of p.tags) if (isFilterable(t)) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }))
})

const matches = (p: Project) => (!tag.value || p.tags.includes(tag.value)) && matchesQuery(p, query.value)
const featuredView = computed(() => featured.value.filter(matches))
const othersView = computed(() => others.value.filter(matches))
const total = computed(() => featuredView.value.length + othersView.value.length)
const filtering = computed(() => Boolean(query.value.trim() || tag.value))
const loading = computed(() => status.value !== 'ready')

/** Changes whenever the visible covers change, so the 3D stage rebuilds its emblems. */
const coverVersion = computed(() => `${filtering.value}:${featuredView.value.map((p) => p.repo.id).join(',')}`)
const has3d = ref(false)

function reset() {
  query.value = ''
  tag.value = ''
}
</script>

<template>
  <section id="projetos" class="section" aria-labelledby="projetos-title">
    <div class="container">
      <SectionHeading id="projetos-title" index="01" label="Projetos">
        Trabalho <em>selecionado</em>
        <template #lead>
          Selecionados automaticamente dos meus repositórios públicos, priorizando documentação, atividade recente e
          variedade de stack — não apenas estrelas.
        </template>
      </SectionHeading>

      <DataNotice />

      <div class="toolbar" v-reveal>
        <SearchField id="project-search" v-model="query" label="Buscar projetos" placeholder="Buscar por nome ou tecnologia" />
        <FilterChips v-model="tag" :options="tagOptions" label="Filtrar por tecnologia" />
      </div>

      <p class="sr-only" aria-live="polite">
        <template v-if="!loading && filtering">{{ total }} projetos encontrados</template>
      </p>

      <div v-if="loading" class="featured" aria-busy="true">
        <SkeletonCard cover class="slot slot--0" />
        <SkeletonCard v-for="n in 3" :key="n" cover :class="`slot slot--${n}`" />
        <span class="sr-only">Carregando projetos do GitHub…</span>
      </div>

      <template v-else>
        <div v-if="featuredView.length" class="featured" :class="{ 'has-3d': has3d }">
          <CoverStage :version="coverVersion" @ready="has3d = true" />
          <ProjectCard
            v-for="(p, i) in featuredView"
            :key="p.repo.id"
            v-reveal="i * 60"
            :class="`slot slot--${filtering ? 'f' : i}`"
            :project="p"
            variant="feature"
            :index="i"
            :lead="i === 0 && !filtering"
            :split="i === 3 && !filtering"
          />
        </div>

        <div v-if="othersView.length" class="others">
          <h3 class="others-title">
            <span class="eyebrow">Outros projetos</span>
            <span class="mono count">{{ othersView.length }}</span>
          </h3>
          <ol class="index" role="list">
            <li v-for="(p, i) in othersView" :key="p.repo.id" v-reveal="Math.min(i, 6) * 40">
              <a :href="p.repo.html_url" target="_blank" rel="noopener noreferrer" class="row">
                <span class="num mono" aria-hidden="true">{{ pad(featuredView.length + i + 1) }}</span>
                <span class="main">
                  <span class="name">
                    {{ p.repo.name }}
                    <span v-if="p.curation?.context" class="context mono">{{ p.curation.context }}</span>
                  </span>
                  <span v-if="p.description" class="desc">{{ p.description }}</span>
                  <span v-else class="desc desc--none">Repositório sem descrição pública.</span>
                </span>
                <span class="meta mono">
                  <span class="lang"><i :style="{ background: languageColor(p.repo.language) }" />{{ p.repo.language ?? '—' }}</span>
                  <time :datetime="p.repo.pushed_at">{{ formatRelative(p.repo.pushed_at) }}</time>
                  <span v-if="p.descriptionSource === 'readme'" class="src">resumo do README</span>
                </span>
                <ArrowUpRight class="go" aria-hidden="true" />
                <span class="sr-only">(abre o repositório no GitHub em nova aba)</span>
              </a>
            </li>
          </ol>
        </div>

        <div v-if="!total" class="empty">
          <SearchX aria-hidden="true" />
          <p v-if="filtering">Nenhum projeto corresponde a essa busca.</p>
          <p v-else>Nenhum repositório público com código foi encontrado.</p>
          <button v-if="filtering" type="button" class="btn" @click="reset">Limpar filtros</button>
        </div>
      </template>

      <div class="more">
        <a :href="person.github" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
          <BrandIcon name="github" :size="17" />Ver perfil completo no GitHub<ArrowUpRight class="arrow" aria-hidden="true" />
        </a>
        <a href="#repositorios" class="btn btn--ghost">Explorar todos os repositórios</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.featured {
  position: relative;
  display: grid;
  gap: var(--space-5);
}

/* With live 3D emblems the CSS crescents step aside. */
.has-3d :deep(.block) {
  display: none;
}

.others {
  margin-top: var(--space-8);
}

.others-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--line);
}

.count {
  color: var(--accent-ink);
  font-size: 0.75rem;
}

/* Index list ------------------------------------------------------------- */
.index {
  border-top: 1px solid var(--line-strong);
}

.row {
  position: relative;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 20px;
  gap: var(--space-2) var(--space-4);
  align-items: start;
  padding: var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--line);
  isolation: isolate;
}

/* Hover: an accent wash sweeps in from the left. */
.row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, var(--accent-soft), transparent 85%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur-slow) var(--ease-out);
}

.row:hover::before,
.row:focus-visible::before {
  transform: scaleX(1);
}

.num {
  padding-top: 0.35em;
  font-size: 0.66rem;
  color: var(--ink-3);
  transition: color var(--dur) ease;
}

.row:hover .num {
  color: var(--accent-ink);
}

.main {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.name {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  overflow-wrap: anywhere;
  transition: transform var(--dur) var(--ease-out);
}

.row:hover .name {
  transform: translateX(8px);
}

.context {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--ink-3);
}

.desc {
  max-width: 64ch;
  font-size: 0.92rem;
  color: var(--ink-2);
}

.desc--none {
  color: var(--ink-3);
  font-style: italic;
}

.meta {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 0.64rem;
  color: var(--ink-3);
}

.lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-2);
}

.lang i {
  width: 8px;
  height: 8px;
}

.src {
  color: var(--ink-3);
}

.go {
  grid-column: 3;
  grid-row: 1;
  width: 20px;
  height: 20px;
  margin-top: 0.3em;
  color: var(--ink-3);
  transition:
    transform var(--dur) var(--ease-out),
    color var(--dur) ease;
}

.row:hover .go {
  color: var(--accent-ink);
  transform: translate(3px, -3px) rotate(0deg);
}

.empty {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  border: 1px dashed var(--line-strong);
  text-align: center;
  color: var(--ink-2);
}

.empty svg {
  width: 28px;
  height: 28px;
  color: var(--ink-3);
}

.more {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-7);
}

@media (min-width: 640px) {
  .toolbar {
    grid-template-columns: minmax(240px, 340px) 1fr;
    align-items: start;
  }

  .featured {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .slot--0 {
    grid-column: 1 / -1;
  }
}

/* Bento: tall lead on the left, two stacked tiles, a wide split card below. */
@media (min-width: 1024px) {
  .featured {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-auto-flow: dense;
  }

  .slot--0 {
    grid-column: 1 / span 7;
    grid-row: span 2;
  }

  .slot--1,
  .slot--2 {
    grid-column: 8 / span 5;
  }

  .slot--1 :deep(.project__cover),
  .slot--2 :deep(.project__cover) {
    aspect-ratio: 16 / 7;
  }

  .slot--3 {
    grid-column: 1 / -1;
  }

  .slot--f {
    grid-column: span 4;
  }

  .row {
    grid-template-columns: 56px minmax(0, 1fr) 230px 24px;
    align-items: center;
    padding-inline: var(--space-4);
  }

  .meta {
    grid-column: 3;
    flex-direction: column;
    align-items: flex-start;
  }

  .go {
    grid-column: 4;
    grid-row: auto;
    margin-top: 0;
  }

  .num {
    padding-top: 0;
  }
}
</style>
