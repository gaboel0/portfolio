<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, FolderOpen } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import SearchField from '@/components/SearchField.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { MIN_COMMITS, useGithub } from '@/composables/useGithub'
import type { RepoStatus } from '@/types/portfolio'
import { formatDate, formatRelative } from '@/utils/format'
import { languageColor } from '@/utils/languages'
import { matchesQuery, sortProjects, type SortKey } from '@/utils/projects'

const { status, projects } = useGithub()

const NO_LANGUAGE = '__none__'
const query = ref('')
const language = ref('')
const sort = ref<SortKey>('updated')

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'updated', label: 'Atualização mais recente' },
  { value: 'stars', label: 'Mais estrelas' },
  { value: 'created', label: 'Criação mais recente' },
  { value: 'name', label: 'Nome (A–Z)' },
]

const statusLabel: Record<RepoStatus, string | null> = {
  active: null,
  empty: 'Vazio',
  profile: 'README do perfil',
  fork: 'Fork',
  archived: 'Arquivado',
}

const languages = computed(() => {
  const counts = new Map<string, number>()
  for (const p of projects.value) {
    const key = p.repo.language ?? NO_LANGUAGE
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const view = computed(() => {
  const filtered = projects.value.filter((p) => {
    if (language.value && (p.repo.language ?? NO_LANGUAGE) !== language.value) return false
    return matchesQuery(p, query.value)
  })
  return sortProjects(filtered, sort.value)
})

const loading = computed(() => status.value !== 'ready')
</script>

<template>
  <section id="repositorios" class="section" aria-labelledby="repositorios-title">
    <div class="container">
      <SectionHeading id="repositorios-title">
        Todos os <em>repositórios</em>
        <template #lead>
          Repositórios públicos com pelo menos {{ MIN_COMMITS }} commits e descrição.
        </template>
      </SectionHeading>

      <AeroWindow as="div" title="Repositórios — Explorador de arquivos">
        <template #icon><FolderOpen /></template>
      <form class="controls" role="search" aria-label="Filtrar repositórios" @submit.prevent>
        <SearchField id="repo-search" v-model="query" label="Buscar repositórios" placeholder="Buscar repositório" />

        <label class="select">
          <span class="eyebrow">Linguagem</span>
          <select v-model="language">
            <option value="">Todas</option>
            <option v-for="[lang, count] in languages" :key="lang" :value="lang">
              {{ lang === NO_LANGUAGE ? 'Sem linguagem detectada' : lang }} ({{ count }})
            </option>
          </select>
        </label>

        <label class="select">
          <span class="eyebrow">Ordenar por</span>
          <select v-model="sort">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

      </form>

      <p class="summary mono" aria-live="polite">
        <template v-if="loading">Carregando repositórios…</template>
        <template v-else>
          {{ view.length }} de {{ projects.length }} repositórios
        </template>
      </p>

      <div class="table" :aria-busy="loading">
        <div class="row head mono" aria-hidden="true">
          <span>Repositório</span>
          <span>Linguagem</span>
          <span>Atualizado</span>
        </div>

        <ul v-if="loading" role="list">
          <li v-for="n in 6" :key="n" class="row ghost-row" aria-hidden="true"><span /><span /><span /><span /></li>
        </ul>

        <ul v-else-if="view.length" role="list">
          <li v-for="p in view" :key="p.repo.id" class="row" :class="{ muted: p.status === 'empty' }">
            <div class="cell-name">
              <a :href="p.repo.html_url" target="_blank" rel="noopener noreferrer" class="repo-link">
                <span class="repo-name">{{ p.repo.name }}</span>
                <ArrowUpRight aria-hidden="true" />
                <span class="sr-only">(abre no GitHub em nova aba)</span>
              </a>
              <span v-if="statusLabel[p.status]" class="flag mono">{{ statusLabel[p.status] }}</span>
              <p v-if="p.repo.description" class="desc">{{ p.repo.description }}</p>
              <p v-else-if="p.curation" class="desc">
                {{ p.curation.summary }}
              </p>
              <p v-else class="desc desc--none">Sem descrição no GitHub</p>
            </div>
            <div class="cell-lang mono">
              <span class="label-m">Linguagem</span>
              <span v-if="p.repo.language" class="lang"><i :style="{ background: languageColor(p.repo.language) }" />{{ p.repo.language }}</span>
              <span v-else class="none">—</span>
            </div>
            <div class="cell-date mono">
              <span class="label-m">Atualizado</span>
              <time :datetime="p.repo.pushed_at" :title="formatDate(p.repo.pushed_at)">{{ formatRelative(p.repo.pushed_at) }}</time>
            </div>
          </li>
        </ul>

        <p v-else class="empty">
          Nenhum repositório encontrado com esses filtros.
          <button type="button" class="btn btn--ghost" @click="(query = ''), (language = '')">Limpar filtros</button>
        </p>
      </div>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.controls {
  display: grid;
  gap: var(--space-4);
  align-items: end;
}

.select {
  display: grid;
  gap: 6px;
}

.select .eyebrow {
  font-size: 0.68rem;
}

select {
  min-height: 46px;
  padding: 0 40px 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-m);
  background: var(--bg-elev)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23888' stroke-width='1.6'%3E%3Cpath d='M2 4.5 6 8.5l4-4'/%3E%3C/svg%3E")
    no-repeat right 14px center;
  appearance: none;
  cursor: pointer;
}

select:hover {
  border-color: var(--ink-3);
}

.summary {
  margin: var(--space-6) 0 var(--space-3);
  font-size: 0.75rem;
  color: var(--ink-3);
}

.table {
  border: 1px solid var(--line-strong);
  background: var(--win-body);
}

.row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-2) var(--space-5);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line-strong);
}

.head {
  display: none;
}

.row:not(.head) {
  transition: background-color var(--dur-fast) ease;
}

.row:not(.head):hover {
  background: color-mix(in srgb, var(--bg-elev) 70%, transparent);
}

.muted .repo-name,
.muted .desc {
  color: var(--ink-3);
}

.cell-name {
  min-width: 0;
}

.repo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  font-size: var(--step-1);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.repo-name {
  overflow-wrap: anywhere;
}

.repo-link svg {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ink-3);
  transition: transform var(--dur) var(--ease-out);
}

.repo-link:hover svg {
  transform: translate(2px, -2px);
  color: var(--accent-ink);
}

.repo-link:hover .repo-name {
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
}

.flag {
  display: inline-block;
  margin-left: 10px;
  padding: 0.1em 0.5em;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-s);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
  vertical-align: 0.25em;
}

.desc {
  margin-top: 4px;
  font-size: 0.92rem;
  color: var(--ink-2);
}

.desc--none {
  color: var(--ink-3);
  font-style: italic;
}

.cell-lang,
.label-m {
  min-width: 96px;
  color: var(--ink-3);
  text-transform: uppercase;
  font-size: 0.64rem;
  letter-spacing: 0.06em;
}

.lang,
.lang i {
  width: 8px;
  height: 8px;
}

.none {
  color: var(--ink-3);
}

.ghost-row span {
  height: 12px;
  border-radius: 2px;
  background: var(--line);
  animation: fade 1.2s ease-in-out infinite;
}

.ghost-row span:first-child {
  height: 18px;
  width: 60%;
}

@keyframes fade {
  50% {
    opacity: 0.4;
  }
}

.empty {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-7) 0;
  color: var(--ink-2);
}

@media (min-width: 720px) {
  .controls {
    grid-template-columns: minmax(220px, 1.4fr) 1fr 1fr;
  }
}

@media (min-width: 900px) {
  .controls {
    grid-template-columns: minmax(240px, 1.6fr) 1fr 1fr;
  }

  .row {
    grid-template-columns: minmax(0, 1fr) 150px 140px;
    align-items: baseline;
    padding-inline: var(--space-3);
  }

  .head {
    display: grid;
    padding-block: var(--space-2);
    border-bottom: 1px solid var(--line-strong);
    background: linear-gradient(180deg, var(--glass-hi), transparent 90%);
    font-size: 0.8rem;
    color: var(--ink-2);
  }

  .label-m {
    display: none;
  }
}
</style>
