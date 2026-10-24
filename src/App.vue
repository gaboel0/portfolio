<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ClippyAssistant from '@/components/ClippyAssistant.vue'
import ProjectModal from '@/components/ProjectModal.vue'
import { useGithub } from '@/composables/useGithub'
import AboutSection from '@/sections/AboutSection.vue'
import ContactSection from '@/sections/ContactSection.vue'
import EducationSection from '@/sections/EducationSection.vue'
import ExperienceTimeline from '@/sections/ExperienceTimeline.vue'
import FeaturedProjects from '@/sections/FeaturedProjects.vue'
import HeroSection from '@/sections/HeroSection.vue'
import RepositoryExplorer from '@/sections/RepositoryExplorer.vue'
import ProblemsSection from '@/sections/ProblemsSection.vue'

const { load } = useGithub()
onMounted(() => load())
</script>

<template>
  <a href="#conteudo" class="skip-link">Pular para o conteúdo</a>
  <AppHeader />
  <main id="conteudo" tabindex="-1">
    <HeroSection />
    <FeaturedProjects />
    <RepositoryExplorer />
    <AboutSection />
    <ProblemsSection />
    <ExperienceTimeline />
    <EducationSection />
    <ContactSection />
  </main>
  <ProjectModal />
  <ClippyAssistant />
</template>

<style>
main:focus {
  outline: none;
}

/* Room for the fixed taskbar. */
body {
  padding-bottom: var(--taskbar-h);
}
</style>
