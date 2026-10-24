import type { RepoCuration } from '@/types/portfolio'

/**
 * Notas editoriais por repositório, escritas a partir do README e dos arquivos
 * de manifesto (package.json, idf_component, etc.) de cada projeto — conferidos
 * em 23/10/2026. Nada aqui substitui os dados da API: são exibidos com o rótulo
 * "Resumo do README". Repositórios sem README não têm entrada.
 */
export const curation: Record<string, RepoCuration> = {
  'Nexus-CRM': {
    summary:
      'Painel de gestão de projetos e tarefas em Angular e Tailwind CSS, com tela de login sobre uma cidade 3D em Three.js, tema claro e escuro e carregamento com skeletons.',
    stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Vitest'],
    highlights: [
      'Login com cena 3D animada',
      'Quadro de tarefas, detalhes e comentários',
      'Navegação por teclado e layout a partir de 320 px',
    ],
    context: 'Dados simulados (mocks), ainda sem backend',
    weight: 3,
  },
  DandD: {
    summary:
      'Grimório de Classes: aplicação em Vue 3 que consome a D&D 5e SRD API para apresentar as 12 classes jogáveis, com busca em tempo real e páginas de detalhe traduzidas para o português.',
    stack: ['Vue', 'TypeScript', 'Tailwind CSS', 'Vue Router', 'REST API'],
    highlights: ['Busca por nome em português ou inglês', 'Detalhes de proficiências, subclasses e conjuração'],
    context: 'Projeto acadêmico',
    weight: 3,
    emblem: 'd20',
  },
  ProjetoP2_IoT: {
    summary:
      'Sistema de comunicação IoT via MQTT para ESP32, escrito em C com ESP-IDF, com arquitetura modular, reconexão automática de Wi-Fi e MQTT, telemetria e monitoramento de saúde do dispositivo.',
    stack: ['C', 'ESP-IDF', 'ESP32', 'MQTT'],
    highlights: ['Biblioteca separada da aplicação', 'Fluxograma da arquitetura documentado no README'],
    weight: 2.5,
  },
  'smart-fish-smaqjt': {
    summary: 'Aplicativo híbrido desenvolvido como Projeto Integrador acadêmico na Unimar, construído com Ionic, Angular e Capacitor.',
    stack: ['Ionic', 'Angular', 'TypeScript', 'Capacitor', 'SCSS'],
    context: 'Projeto Integrador, Unimar',
    weight: -3,
  },
  GearShopUnimar: {
    summary: 'E-commerce em Vue 3 com Vite, Vue Router, Axios e Firebase como dependências do projeto.',
    stack: ['Vue', 'Vue Router', 'Firebase', 'Axios'],
    weight: 1,
  },
  GearShop: {
    summary: 'E-commerce em Vue 3 com Vite, Vue Router, Axios e Firebase.',
    stack: ['Vue', 'Vue Router', 'Firebase', 'Axios'],
    relatedTo: 'GearShopUnimar',
    context: 'Mesma base de código de GearShopUnimar',
    weight: -2,
  },
  NewGearShop: {
    summary: 'Projeto em Ionic 8 e Angular 20 com Capacitor. O README ainda não descreve o escopo.',
    stack: ['Ionic', 'Angular', 'TypeScript', 'Capacitor'],
    weight: -1,
  },
  'front-end-vue': {
    summary: 'Single-page application em Vue criada com Vue CLI.',
    stack: ['Vue'],
  },
  sodacan: {
    summary: 'Animação fluida de uma lata de refrigerante com duas bebidas diferentes, feita apenas com HTML e CSS.',
    stack: ['HTML', 'CSS', 'Animação'],
    weight: 5,
    emblem: 'can',
  },
}
