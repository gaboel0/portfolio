<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { ArrowUpRight, Check, Copy, Mail, MapPin } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
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
    <div class="container">
      <AeroWindow as="div" title="Nova mensagem" v-reveal>
        <template #icon><Mail /></template>

        <h2 id="contato-title" class="title">Vamos conversar?</h2>
        <p class="lead">
          Se você recruta para um time de produto ou é dev e quer trocar uma ideia sobre front-end, minha caixa de entrada
          está aberta.
        </p>

        <dl class="fields">
          <div class="field">
            <dt>Para:</dt>
            <dd>
              <a :href="`mailto:${person.email}`" class="mail-link">
                <span class="u">{{ user }}</span><span class="d">@{{ domain }}</span>
              </a>
            </dd>
            <button type="button" class="btn copy" @click="copyEmail">
              <Check v-if="copied" aria-hidden="true" />
              <Copy v-else aria-hidden="true" />
              <span>{{ copied ? 'Copiado' : 'Copiar' }}</span>
            </button>
          </div>
          <div class="field">
            <dt>Local:</dt>
            <dd class="where"><MapPin aria-hidden="true" />Marília, SP, Brasil</dd>
          </div>
        </dl>
        <span class="sr-only" aria-live="polite">{{ copied ? 'E-mail copiado para a área de transferência' : '' }}</span>

        <div class="actions">
          <a :href="`mailto:${person.email}`" class="btn btn--primary">Enviar e-mail<ArrowUpRight aria-hidden="true" /></a>
          <a :href="person.linkedin" target="_blank" rel="noopener noreferrer" class="btn">
            <BrandIcon name="linkedin" :size="16" />LinkedIn
          </a>
          <a :href="person.github" target="_blank" rel="noopener noreferrer" class="btn">
            <BrandIcon name="github" :size="16" />GitHub
          </a>
        </div>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-block: var(--space-8) calc(var(--space-8) + var(--space-5));
}

.container :deep(.window) {
  max-width: 760px;
  margin-inline: auto;
}

.title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 300;
  text-shadow: var(--title-glow);
}


.lead {
  max-width: 52ch;
  margin-top: var(--space-3);
  color: var(--ink-2);
}

/* Mail header fields, like the compose window of the era. */
.fields {
  margin-top: var(--space-5);
  border: 1px solid var(--line-strong);
  background: var(--bg-sunken);
}

.field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-3);
  min-height: 44px;
  padding: var(--space-1) var(--space-3);
}

.field + .field {
  border-top: 1px solid var(--line);
}

.field dt {
  width: 52px;
  color: var(--ink-3);
  font-size: 0.85rem;
}

.field dd {
  flex: 1 1 12rem;
  min-width: 0;
}

.mail-link {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 44px;
  max-width: 100%;
  font-size: clamp(0.9rem, 4.2vw, 1.2rem);
  font-weight: 600;
}

/* The two halves never split mid-word: when the row is short, the domain drops whole. */
.mail-link .u,
.mail-link .d {
  white-space: nowrap;
}

.mail-link .d {
  color: var(--ink-3);
  font-weight: 400;
}

.mail-link:hover .u,
.mail-link:hover .d {
  color: var(--accent-ink);
}

.where {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink-2);
}

.where svg {
  width: 15px;
  height: 15px;
}

.copy {
  white-space: nowrap;
  min-height: 44px;
  padding-inline: 0.8em;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
</style>
