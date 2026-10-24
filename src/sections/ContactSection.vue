<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { ArrowUpRight, Check, Copy, MapPin } from 'lucide-vue-next'
import BrandIcon from '@/components/BrandIcon.vue'
import { person } from '@/data/profile'

const copied = ref(false)
let timer: number | undefined

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(person.email)
    copied.value = true
    window.clearTimeout(timer)
    timer = window.setTimeout(() => (copied.value = false), 2200)
  } catch {
    // Clipboard unavailable (insecure context or denied): the mailto link still works.
  }
}

onBeforeUnmount(() => window.clearTimeout(timer))

const [user, domain] = person.email.split('@')
</script>

<template>
  <section id="contato" class="contact" aria-labelledby="contato-title">
    <span class="watermark jp" aria-hidden="true">雷</span>
    <div class="container">
      <p class="meta mono"><i aria-hidden="true" />Contato <span class="idx">07</span></p>

      <h2 id="contato-title" class="title" v-reveal>
        Vamos<br /><em>conversar</em><span class="accent">?</span>
      </h2>

      <p class="lead" v-reveal="60">
        Se você recruta para um time de produto ou é dev e quer trocar uma ideia sobre front-end, minha caixa de entrada está
        aberta.
      </p>

      <div class="mail" v-reveal="120">
        <a :href="`mailto:${person.email}`" class="mail-link">
          <span class="u">{{ user }}</span><span class="d">@{{ domain }}</span>
          <ArrowUpRight class="mail-arrow" aria-hidden="true" />
        </a>
        <button type="button" class="copy" @click="copyEmail">
          <Check v-if="copied" aria-hidden="true" />
          <Copy v-else aria-hidden="true" />
          <span>{{ copied ? 'Copiado' : 'Copiar e-mail' }}</span>
        </button>
        <span class="sr-only" aria-live="polite">{{ copied ? 'E-mail copiado para a área de transferência' : '' }}</span>
      </div>

      <ul role="list" class="channels" v-reveal="160">
        <li>
          <a :href="person.linkedin" target="_blank" rel="noopener noreferrer">
            <BrandIcon name="linkedin" :size="20" />
            <span><strong>LinkedIn</strong><small>gabriel-dos-santos-figueiredo</small></span>
            <ArrowUpRight class="go" aria-hidden="true" />
          </a>
        </li>
        <li>
          <a :href="person.github" target="_blank" rel="noopener noreferrer">
            <BrandIcon name="github" :size="20" />
            <span><strong>GitHub</strong><small>{{ person.githubUser }}</small></span>
            <ArrowUpRight class="go" aria-hidden="true" />
          </a>
        </li>
        <li class="static">
          <MapPin aria-hidden="true" />
          <span><strong>Localização</strong><small>Marília, SP — Brasil</small></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-top: 1px solid var(--panel-line);
  padding-block: var(--space-9);
  background: var(--panel-bg);
  color: var(--panel-ink);
  --accent: var(--panel-accent);
  --line: color-mix(in srgb, var(--panel-ink) 18%, transparent);
  --muted: color-mix(in srgb, var(--panel-ink) 62%, transparent);
}

.contact::before {
  content: '';
  position: absolute;
  left: -15%;
  bottom: -40%;
  z-index: -1;
  width: min(90vw, 1000px);
  aspect-ratio: 1;
  background: radial-gradient(closest-side, rgba(143, 128, 255, 0.16), transparent);
}

.watermark {
  position: absolute;
  right: -0.08em;
  top: 50%;
  z-index: -1;
  transform: translateY(-50%);
  font-size: clamp(16rem, 42vw, 40rem);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--panel-ink) 10%, transparent);
  user-select: none;
}

.contact :focus-visible {
  outline-color: var(--accent);
}

.meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  font-size: 0.64rem;
  text-transform: uppercase;
  color: var(--muted);
}

.meta i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.contact .accent {
  color: var(--accent);
}

.title {
  margin-top: var(--space-5);
  font-size: clamp(1.9rem, 8.6vw, 8.5rem);
  font-weight: 800;
  line-height: 0.88;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.title em {
  -webkit-text-stroke-color: var(--panel-ink);
  -webkit-text-stroke-width: 2px;
}

.lead {
  max-width: 48ch;
  margin-top: var(--space-6);
  font-size: var(--step-1);
  color: var(--muted);
}

.mail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding-block: var(--space-5);
  border-block: 1px solid var(--line);
}

.mail-link {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  font-size: clamp(1.05rem, 0.4rem + 3.1vw, 2.9rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  overflow-wrap: anywhere;
}

.mail-link .d {
  color: var(--muted);
  transition: color var(--dur) ease;
}

.mail-link:hover .d {
  color: var(--accent);
}

.mail-arrow {
  width: 0.8em;
  height: 0.8em;
  margin-left: 0.2em;
  color: var(--accent);
  transition: transform var(--dur) var(--ease-out);
}

.mail-link:hover .mail-arrow {
  transform: translate(4px, -4px);
}

.copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  margin-left: auto;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-m);
  background: transparent;
  font-size: 0.85rem;
  transition: border-color var(--dur-fast) ease;
}

.copy:hover {
  border-color: var(--panel-ink);
}

.copy svg {
  width: 15px;
  height: 15px;
}

.channels {
  display: grid;
  margin-top: var(--space-6);
}

.channels li > a,
.channels .static {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--line);
}

.channels .static svg {
  width: 20px;
  height: 20px;
}

.channels span {
  display: grid;
}

.channels small {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--muted);
}

.go {
  width: 18px;
  height: 18px;
  margin-left: auto;
  color: var(--muted);
  transition: transform var(--dur) var(--ease-out), color var(--dur) ease;
}

.channels a:hover .go {
  color: var(--accent);
  transform: translate(3px, -3px);
}

@media (min-width: 800px) {
  .channels {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: var(--space-6);
  }

  .channels li > a,
  .channels .static {
    border-bottom: 0;
  }
}
</style>
