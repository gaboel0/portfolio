<script setup lang="ts">
import { ArrowUpRight, Settings } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { person, problems } from '@/data/profile'

const repoUrl = (repo: string) => `${person.github}/${repo}`
</script>

<template>
  <section id="problemas" class="section" aria-labelledby="problemas-title">
    <div class="container">
      <SectionHeading id="problemas-title">
        Problemas que resolvo
        <template #lead>O que eu faço com as ferramentas, no trabalho e nos projetos públicos.</template>
      </SectionHeading>

      <AeroWindow as="div" flush title="Painel de controle: Problemas">
        <template #icon><Settings /></template>
      <ol class="list" role="list">
        <li v-for="(item, i) in problems" :key="item.title" v-reveal="Math.min(i, 4) * 50" class="item">
          <h3 class="title">{{ item.title }}</h3>
          <div class="body">
            <p class="problem">{{ item.problem }}</p>
            <p class="solution">{{ item.solution }}</p>
          </div>
          <a
            v-if="item.proof.repo"
            :href="repoUrl(item.proof.repo)"
            target="_blank"
            rel="noopener noreferrer"
            class="proof proof--link mono"
          >
            {{ item.proof.label }}<ArrowUpRight aria-hidden="true" />
            <span class="sr-only">(abre o repositório no GitHub em nova aba)</span>
          </a>
          <span v-else class="proof mono">{{ item.proof.label }}</span>
        </li>
      </ol>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.list {
  padding: 0 var(--space-5);
}

.item {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--line);
}

.item:last-child {
  border-bottom: 0;
}

.title {
  font-size: var(--step-1);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.body {
  display: grid;
  gap: 4px;
}

.problem {
  color: var(--ink-3);
}

.solution {
  color: var(--ink);
}

.proof {
  width: fit-content;
  font-size: 0.72rem;
  color: var(--ink-3);
}

.proof--link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent-ink);
}

.proof svg {
  width: 12px;
  height: 12px;
  transition: transform var(--dur) var(--ease-out);
}

.proof--link:hover svg {
  transform: translate(2px, -2px);
}

@media (min-width: 900px) {
  .item {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 2fr) 130px;
    align-items: baseline;
    gap: var(--space-6);
  }

  .body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .proof {
    justify-self: end;
  }
}
</style>
