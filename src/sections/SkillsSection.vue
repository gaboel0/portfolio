<script setup lang="ts">
import BrandIcon from '@/components/BrandIcon.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { skillGroups } from '@/data/profile'

/** Spotlight that follows the pointer inside each tile. */
function onPointerMove(e: PointerEvent) {
  const tile = (e.target as HTMLElement).closest<HTMLElement>('.tile')
  if (!tile) return
  const r = tile.getBoundingClientRect()
  tile.style.setProperty('--mx', `${e.clientX - r.left}px`)
  tile.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <section id="habilidades" class="section" aria-labelledby="habilidades-title">
    <div class="container">
      <SectionHeading id="habilidades-title" index="04" label="Habilidades">
        Ferramentas do <em>dia a dia</em>
        <template #lead>
          Tecnologias que uso no trabalho e nos projetos públicos, agrupadas por área. Sem barras ou porcentagens — o código
          nos repositórios diz mais.
        </template>
      </SectionHeading>

      <div class="groups" @pointermove="onPointerMove">
        <article
          v-for="(group, gi) in skillGroups"
          :key="group.id"
          v-reveal="gi * 70"
          class="group"
          :aria-labelledby="`skill-${group.id}`"
        >
          <header class="group-head">
            <span class="big-idx" aria-hidden="true">{{ String(gi + 1).padStart(2, '0') }}</span>
            <div>
              <h3 :id="`skill-${group.id}`">{{ group.title }}</h3>
              <p>{{ group.description }}</p>
              <p class="count mono">{{ group.items.length }} {{ group.items.length === 1 ? 'ferramenta' : 'ferramentas' }}</p>
            </div>
          </header>

          <ul role="list" class="tiles">
            <li v-for="item in group.items" :key="item.name" class="tile hud">
              <span class="icon"><BrandIcon :name="item.icon" :size="30" /></span>
              <span class="name">{{ item.name }}</span>
              <span class="note">{{ item.note }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.groups {
  display: grid;
  border-top: 1px solid var(--line-strong);
}

.group {
  display: grid;
  gap: var(--space-5);
  padding-block: var(--space-7);
  border-bottom: 1px solid var(--line);
}

.group-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.big-idx {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 6vw, 4.4rem);
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--line-strong);
}

.group-head h3 {
  font-size: var(--step-2);
  letter-spacing: -0.03em;
}

.group-head p {
  margin-top: 6px;
  max-width: 34ch;
  font-size: 0.92rem;
  color: var(--ink-3);
}

.group-head .count {
  margin-top: var(--space-3);
  font-size: 0.62rem;
  text-transform: uppercase;
  color: var(--accent-ink);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}

.tile {
  --mx: 50%;
  --my: 50%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--space-2);
  min-height: 150px;
  padding: var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--radius-s);
  background:
    radial-gradient(180px circle at var(--mx) var(--my), var(--accent-soft), transparent 70%),
    var(--bg-elev);
  overflow: hidden;
  transition:
    border-color var(--dur) ease,
    transform var(--dur) var(--ease-out);
}

.tile:hover {
  border-color: var(--line-strong);
  transform: translateY(-3px);
}

.icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--line);
  color: var(--ink);
  transition:
    color var(--dur) ease,
    box-shadow var(--dur) ease,
    border-color var(--dur) ease;
}

.tile:hover .icon {
  color: var(--accent-ink);
  border-color: var(--accent);
  box-shadow: 0 0 24px -6px var(--accent);
}

.name {
  align-self: end;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.note {
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--ink-3);
}

@media (min-width: 960px) {
  .group {
    grid-template-columns: minmax(240px, 0.8fr) minmax(0, 2fr);
    gap: var(--space-8);
  }

  .group-head {
    position: sticky;
    top: calc(var(--header-h) + var(--space-5));
    align-self: start;
  }

  .tiles {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  }
}
</style>
