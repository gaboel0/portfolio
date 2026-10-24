<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUpRight, MapPin, Zap } from 'lucide-vue-next'
import BrandIcon from '@/components/BrandIcon.vue'
import HeroCanvas from '@/components/HeroCanvas.vue'
import { useGithub } from '@/composables/useGithub'
import { person } from '@/data/profile'

const { status, source, projects, profile } = useGithub()
const stage = ref<InstanceType<typeof HeroCanvas> | null>(null)

/** Latest pushes, straight from the API (or the bundled snapshot). */
const recent = computed(() =>
  [...projects.value]
    .filter((p) => p.status === 'active')
    .sort((a, b) => new Date(b.repo.pushed_at).getTime() - new Date(a.repo.pushed_at).getTime())
    .slice(0, 6),
)

const loading = computed(() => status.value !== 'ready')
const year = new Date().getFullYear()

function shortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}.${m}.${y}`
}

/** Clicking empty sky releases a burst of lightning. */
function onSkyClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a, button')) return
  stage.value?.burst()
}
</script>

<template>
  <section id="inicio" class="hero" aria-labelledby="hero-title" @click="onSkyClick">
    <HeroCanvas ref="stage" />
    <div class="veil" aria-hidden="true" />

    <div class="container content">
      <div class="meta mono" aria-hidden="true">
        <span>[ Portfólio — {{ year }} ]</span>
        <span class="coords">{{ person.coordinates }}</span>
        <span class="status"><i />Aberto a conversas</span>
      </div>

      <div class="title-block">
        <p class="kicker mono">
          <span class="line" aria-hidden="true" />Desenvolvedor de software · Front-end
        </p>
        <h1 id="hero-title" class="name">
          <span class="l1">Gabriel</span>
          <span class="l2"><em>Figueiredo</em><span class="dot" aria-hidden="true" /></span>
          <span class="sr-only">dos Santos</span>
        </h1>
      </div>

      <div class="bottom">
        <p class="lead">
          Construo e mantenho interfaces web e mobile — hoje com <strong>Angular, Ionic, Vue e Flutter</strong> na Unipac —
          levando cada tela do protótipo no Figma até o código em produção.
        </p>

        <div class="cta">
          <a href="#projetos" class="btn btn--primary">Ver projetos<ArrowDown class="arrow" aria-hidden="true" /></a>
          <a href="#contato" class="btn">Contato<ArrowUpRight class="arrow" aria-hidden="true" /></a>
        </div>

        <ul class="links mono" role="list">
          <li><MapPin aria-hidden="true" />{{ person.location }}</li>
          <li>
            <a :href="person.github" target="_blank" rel="noopener noreferrer" class="link">
              <BrandIcon name="github" :size="14" />{{ person.githubUser }}
            </a>
          </li>
          <li>
            <a :href="person.linkedin" target="_blank" rel="noopener noreferrer" class="link">
              <BrandIcon name="linkedin" :size="14" />LinkedIn
            </a>
          </li>
        </ul>
      </div>

      <button type="button" class="spark mono" @click="stage?.burst()">
        <Zap aria-hidden="true" />Clique no céu
      </button>
      <span class="kanji jp" aria-hidden="true">静かな雷</span>
    </div>

    <div class="ticker" :aria-busy="loading">
      <p class="sr-only">
        Repositórios atualizados recentemente
        <template v-if="source === 'snapshot'"> (cópia local)</template>
      </p>
      <div v-if="loading" class="track track--static mono" aria-hidden="true">Conectando ao GitHub…</div>
      <div v-else class="track mono">
        <ul v-for="copy in 2" :key="copy" role="list" class="run" :aria-hidden="copy === 2 ? 'true' : undefined">
          <li v-for="p in recent" :key="p.repo.id">
            <a :href="p.repo.html_url" target="_blank" rel="noopener noreferrer" :tabindex="copy === 2 ? -1 : undefined">
              <strong>{{ p.repo.name }}</strong>
              <span>{{ p.repo.language ?? '—' }}</span>
              <span>{{ shortDate(p.repo.pushed_at) }}</span>
            </a>
            <span class="star" aria-hidden="true">✦</span>
          </li>
          <li v-if="profile" class="total">
            {{ profile.public_repos }} repositórios públicos <span class="star" aria-hidden="true">✦</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: max(100svh, 640px);
  color: var(--ink);
  overflow: hidden;
  isolation: isolate;
  cursor: crosshair;
}

.veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgb(var(--hero-veil) / 0.85) 0%, rgb(var(--hero-veil) / 0.35) 55%, transparent 80%),
    linear-gradient(0deg, rgb(var(--hero-veil) / 0.9) 0%, transparent 35%);
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
  padding-top: calc(var(--header-h) + var(--space-5));
  padding-bottom: var(--space-6);
  pointer-events: none;
}

.content a,
.content button {
  pointer-events: auto;
  cursor: pointer;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: 0.62rem;
  text-transform: uppercase;
  color: var(--ink-3);
}

.coords {
  display: none;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-2);
}

.status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}

.title-block {
  align-self: end;
  min-width: 0;
}

.kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--space-4);
  font-size: 0.66rem;
  text-transform: uppercase;
  color: var(--ink-2);
  animation: rise 900ms 100ms var(--ease-out) both;
}

.kicker .line {
  width: 36px;
  height: 1px;
  background: var(--crimson);
  box-shadow: 0 0 8px var(--crimson);
}

.name {
  display: grid;
  font-size: clamp(2rem, 8.4vw, 8.2rem);
  font-weight: 800;
  line-height: 0.86;
  letter-spacing: -0.035em;
  text-transform: uppercase;
}

.l1,
.l2 {
  display: block;
  animation: rise 1s var(--ease-out) both;
}

.l2 {
  position: relative;
  width: fit-content;
  animation-delay: 120ms;
}

.l2 em {
  -webkit-text-stroke-width: 2px;
}

.dot {
  position: absolute;
  right: -0.22em;
  bottom: 0.12em;
  width: 0.13em;
  height: 0.13em;
  background: var(--crimson);
  box-shadow: 0 0 18px var(--crimson);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(0.3em);
  }
}

.bottom {
  display: grid;
  gap: var(--space-5);
  animation: rise 1s 260ms var(--ease-out) both;
}

.lead {
  max-width: 44ch;
  font-size: var(--step-1);
  line-height: 1.5;
  color: var(--ink-2);
}

.lead strong {
  font-weight: 700;
  color: var(--ink);
}

.cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.cta .btn--primary:hover {
  --btn-bg: var(--accent);
  --btn-line: var(--accent);
  --btn-ink: var(--on-accent);
  box-shadow: 0 0 30px -6px var(--accent);
}

.cta .btn:not(.btn--primary) {
  background: rgb(var(--hero-veil) / 0.4);
  backdrop-filter: blur(8px);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-5);
  font-size: 0.66rem;
  color: var(--ink-2);
}

.links li,
.links a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.links svg {
  width: 14px;
  height: 14px;
}

.spark {
  position: absolute;
  right: var(--gutter);
  bottom: var(--space-6);
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: rgb(var(--hero-veil) / 0.4);
  backdrop-filter: blur(8px);
  font-size: 0.62rem;
  text-transform: uppercase;
  color: var(--ink-2);
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.spark:hover {
  color: var(--ink);
  border-color: var(--accent);
}

.spark svg {
  width: 13px;
  height: 13px;
  color: var(--accent);
}

.kanji {
  position: absolute;
  top: calc(var(--header-h) + var(--space-8));
  right: var(--gutter);
  display: none;
  writing-mode: vertical-rl;
  font-size: 0.95rem;
  letter-spacing: 0.6em;
  color: var(--ink-3);
}

/* Ticker ---------------------------------------------------------------------- */
.ticker {
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--line);
  background: rgb(var(--hero-veil) / 0.55);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.track {
  display: flex;
  width: max-content;
  padding-block: 14px;
  font-size: 0.66rem;
  text-transform: uppercase;
  animation: marquee 38s linear infinite;
}

.ticker:hover .track {
  animation-play-state: paused;
}

.track--static {
  padding-inline: var(--gutter);
  color: var(--ink-3);
  animation: none;
}

.run {
  display: flex;
  flex: none;
}

.run li {
  display: flex;
  align-items: center;
}

.run a,
.total {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding-inline: 18px;
  color: var(--ink-3);
  white-space: nowrap;
}

.run a strong {
  font-weight: 500;
  color: var(--ink);
}

.run a:hover strong {
  color: var(--accent-ink);
}

.star {
  color: var(--accent);
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (min-width: 640px) {
  .coords {
    display: inline;
  }
}

@media (min-width: 1024px) {
  .bottom {
    grid-template-columns: minmax(0, 1.2fr) auto;
    align-items: end;
    column-gap: var(--space-8);
  }

  .links {
    grid-column: 1 / -1;
  }

  .spark,
  .kanji {
    display: inline-flex;
  }
}

@media (max-width: 1023px) {
  .veil {
    background: linear-gradient(0deg, rgb(var(--hero-veil) / 0.95) 0%, rgb(var(--hero-veil) / 0.55) 55%, transparent 85%);
  }
}
</style>
