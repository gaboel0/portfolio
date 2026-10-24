<script setup lang="ts">
import { computed, ref } from 'vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useGithub } from '@/composables/useGithub'
import { profileSnapshot } from '@/data/github-snapshot'
import { experience, person } from '@/data/profile'
import { formatDuration } from '@/utils/format'

const { profile } = useGithub()

/** GitHub serves resized avatars through the `s` parameter. */
const avatar = computed(() => {
  const url = new URL(profile.value?.avatar_url ?? profileSnapshot.avatar_url)
  url.searchParams.set('s', '480')
  return url.href
})
const avatarFailed = ref(false)
const bio = computed(() => profile.value?.bio ?? profileSnapshot.bio)
const firstRole = experience[experience.length - 1]
const tenure = firstRole ? formatDuration(firstRole.start, null) : ''
</script>

<template>
  <section id="sobre" class="section" aria-labelledby="sobre-title">
    <div class="container">
      <SectionHeading id="sobre-title" index="03" label="Sobre mim">
        Front-end, <em>do Figma</em> ao código
      </SectionHeading>

      <div class="grid">
        <figure class="portrait" v-reveal>
          <div class="frame">
            <span v-if="avatarFailed" class="fallback" aria-hidden="true">gf</span>
            <img
              v-else
              :src="avatar"
              alt="Foto de perfil de Gabriel Figueiredo no GitHub"
              width="480"
              height="480"
              decoding="async"
              @error="avatarFailed = true"
            />
          </div>
          <figcaption class="mono">
            <span>{{ person.shortName }}</span>
            <span>{{ person.location }}</span>
          </figcaption>
        </figure>

        <div class="text">
          <blockquote v-if="bio" class="quote" v-reveal>
            <p>“{{ bio }}”</p>
            <footer class="mono">— minha bio no GitHub</footer>
          </blockquote>

          <div class="prose" v-reveal="80">
            <p>
              Sou desenvolvedor de software em Marília, no interior de São Paulo. Entrei na Unipac em 2022 como estagiário,
              mantendo interfaces de plataformas web, e desde março de 2023 atuo como assistente de desenvolvimento, cuidando
              do front-end dessas plataformas.
            </p>
            <p>
              No dia a dia, alterno entre Angular, Ionic, Vue e Flutter. Trabalhar com frameworks diferentes me fez prestar
              mais atenção no problema do que na ferramenta: componentes claros, código bem versionado e telas que passam pelo
              Figma antes de virar código.
            </p>
            <p>
              Uso ferramentas de IA como parte do fluxo de desenvolvimento e participo de iniciativas de inovação na empresa.
              Em paralelo, curso Análise e Desenvolvimento de Sistemas na Unimar e sigo ampliando meu repertório, hoje
              principalmente em back-end e cloud.
            </p>
          </div>

          <dl class="facts" v-reveal="140">
            <div>
              <dt class="eyebrow">Na Unipac há</dt>
              <dd>{{ tenure }}</dd>
            </div>
            <div>
              <dt class="eyebrow">Foco</dt>
              <dd>Front-end web e mobile</dd>
            </div>
            <div>
              <dt class="eyebrow">Estudando</dt>
              <dd>Back-end e cloud</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--space-7);
}

.portrait {
  max-width: 380px;
}

.frame {
  position: relative;
  aspect-ratio: 1;
  background: var(--bg-sunken);
  border-radius: var(--radius-m);
  overflow: hidden;
}

.frame::after {
  content: '';
  position: absolute;
  inset: auto 0 0 auto;
  width: 22%;
  height: 22%;
  background: var(--accent);
  mix-blend-mode: multiply;
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.05);
  transition: filter var(--dur-slow) var(--ease-out);
}

.fallback {
  display: grid;
  place-items: center;
  height: 100%;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 6rem;
  text-transform: uppercase;
  color: var(--ink-3);
}

.portrait:hover img {
  filter: grayscale(0);
}

figcaption {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-3);
  font-size: 0.72rem;
  color: var(--ink-3);
}

.quote {
  margin: 0 0 var(--space-6);
  padding-left: var(--space-5);
  border-left: 2px solid var(--accent);
}

.quote p {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.quote footer {
  margin-top: var(--space-3);
  font-size: 0.72rem;
  color: var(--ink-3);
}

.prose {
  display: grid;
  gap: var(--space-4);
  max-width: 62ch;
  font-size: var(--step-1);
  line-height: 1.6;
  color: var(--ink-2);
}

.prose p:first-child {
  color: var(--ink);
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-7);
  padding-top: var(--space-5);
  border-top: 1px solid var(--line);
}

.facts dd {
  margin-top: 4px;
  font-weight: 600;
  font-size: var(--step-1);
  letter-spacing: -0.02em;
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: minmax(260px, 0.75fr) minmax(0, 1.6fr);
    gap: var(--space-9);
    align-items: start;
  }

  .portrait {
    position: sticky;
    top: calc(var(--header-h) + var(--space-6));
  }
}
</style>
