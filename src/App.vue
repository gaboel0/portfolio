<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useGithub } from '@/composables/useGithub'
import AboutSection from '@/sections/AboutSection.vue'
import ContactSection from '@/sections/ContactSection.vue'
import EducationSection from '@/sections/EducationSection.vue'
import ExperienceTimeline from '@/sections/ExperienceTimeline.vue'
import FeaturedProjects from '@/sections/FeaturedProjects.vue'
import HeroSection from '@/sections/HeroSection.vue'
import RepositoryExplorer from '@/sections/RepositoryExplorer.vue'
import SkillsSection from '@/sections/SkillsSection.vue'

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
    <SkillsSection />
    <ExperienceTimeline />
    <EducationSection />
    <ContactSection />
  </main>
</template>

<style>
main:focus {
  outline: none;
}
</style>
