<script setup lang="ts">
import { computed, ref } from 'vue'
import { User } from 'lucide-vue-next'
import AeroWindow from '@/components/AeroWindow.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { useGithub } from '@/composables/useGithub'
import { profileSnapshot } from '@/data/github-snapshot'

const { profile } = useGithub()

/** GitHub serves resized avatars through the `s` parameter. */
const avatar = computed(() => {
  const url = new URL(profile.value?.avatar_url ?? profileSnapshot.avatar_url)
  url.searchParams.set('s', '480')
  return url.href
})
const avatarFailed = ref(false)
</script>

<template>
  <section id="sobre" class="section" aria-labelledby="sobre-title">
    <div class="container">
      <SectionHeading id="sobre-title">
        Front-end, <em>do Figma</em> ao código
      </SectionHeading>

      <AeroWindow title="Sobre mim" as="div">
        <template #icon><User /></template>
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
        </figure>

        <div class="text">
          <div class="prose" v-reveal>
            <p>
              Sou desenvolvedor de software em Marília, SP. Comecei na Unipac em 2022 como estagiário e, desde março de 2023,
              cuido do front-end de plataformas web como assistente de desenvolvimento.
            </p>
            <p>
              Trabalho em produtos web e mobile e presto mais atenção ao problema do que à ferramenta. Uso IA no fluxo de
              desenvolvimento, curso Análise e Desenvolvimento de Sistemas na Unimar e sigo aprendendo back-end e cloud.
            </p>
          </div>
        </div>
      </div>
      </AeroWindow>
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--space-7);
}

.portrait {
  max-width: 260px;
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

.prose {
  display: grid;
  gap: var(--space-4);
  max-width: 62ch;
  font-size: var(--step-0);
  line-height: 1.6;
  color: var(--ink-2);
}

.prose p:first-child {
  color: var(--ink);
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: 260px minmax(0, 62ch);
    gap: var(--space-8);
    align-items: start;
  }

  .portrait {
    position: sticky;
    top: calc(var(--header-h) + var(--space-6));
  }
}
</style>
