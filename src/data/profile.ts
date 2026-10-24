import type { Role, SkillGroup } from '@/types/portfolio'

/** Conteúdo do currículo. Fonte: informações fornecidas por Gabriel. */
export const person = {
  name: 'Gabriel dos Santos Figueiredo',
  shortName: 'Gabriel Figueiredo',
  role: 'Desenvolvedor de software',
  location: 'Marília, SP, Brasil',
  coordinates: '22.21° S · 49.95° O',
  email: 'gabrieldossantosfigueiredo@gmail.com',
  githubUser: 'gaboel0',
  github: 'https://github.com/gaboel0',
  linkedin: 'https://www.linkedin.com/in/gabriel-dos-santos-figueiredo-23583a229/',
}

export const experience: Role[] = [
  {
    title: 'Assistente de Desenvolvimento',
    company: 'Unipac',
    start: '2023-03',
    end: null,
    current: true,
    summary:
      'Desenvolvo e mantenho o front-end de plataformas web, transitando entre os frameworks que cada produto exige.',
    responsibilities: [
      'Manutenção e desenvolvimento front-end de plataformas web',
      'Trabalho com Angular, Ionic, Vue e Flutter',
      'Versionamento e gerenciamento de código com Git',
      'Criação de interfaces e protótipos no Figma',
      'Uso de ferramentas de IA para apoiar o desenvolvimento',
      'Participação em iniciativas de inovação e transformação',
    ],
    stack: ['Angular', 'Ionic', 'Vue', 'Flutter', 'Git', 'Figma'],
  },
  {
    title: 'Estagiário',
    company: 'Unipac',
    start: '2022-06',
    end: '2023-03',
    current: false,
    summary: 'Primeiro contato com produtos em produção: interfaces, versionamento e banco de dados.',
    responsibilities: [
      'Manutenção de interfaces de plataformas web',
      'Desenvolvimento front-end com frameworks',
      'Gerenciamento de código com GitHub e GitLab',
      'Criação de telas no Figma',
      'Uso de MySQL e estudo de novas tecnologias',
    ],
    stack: ['GitHub', 'GitLab', 'Figma', 'MySQL'],
  },
]

export const education = {
  course: 'Análise e Desenvolvimento de Sistemas',
  institution: 'Universidade de Marília (Unimar)',
  periods: [
    { start: '2022-01', end: '2023-06' },
    { start: '2024-08', end: '2026-07' },
  ],
}

export const languages = [
  {
    name: 'Inglês',
    levels: [
      { skill: 'Leitura', level: 'Avançado' },
      { skill: 'Conversação', level: 'Intermediário' },
      { skill: 'Escrita', level: 'Intermediário' },
    ],
  },
]

export const skillGroups: SkillGroup[] = [
  {
    id: 'front',
    title: 'Front-end',
    description: 'Onde passo a maior parte do dia: interfaces web e mobile.',
    items: [
      { name: 'Vue.js', note: 'Composition API, SPAs e consumo de APIs', icon: 'vue' },
      { name: 'Angular', note: 'Plataformas web no trabalho e em projetos', icon: 'angular' },
      { name: 'Ionic', note: 'Apps híbridos com Angular e Capacitor', icon: 'ionic' },
      { name: 'Flutter', note: 'Interfaces multiplataforma', icon: 'flutter' },
    ],
  },
  {
    id: 'back',
    title: 'Back-end e programação',
    description: 'Linguagens e frameworks que uso além da interface.',
    items: [
      { name: 'TypeScript', note: 'Base dos meus projetos front-end', icon: 'typescript' },
      { name: 'C#', note: 'Linguagem orientada a objetos', icon: 'csharp' },
      { name: 'AdonisJS', note: 'APIs em Node.js', icon: 'adonis' },
    ],
  },
  {
    id: 'data',
    title: 'Banco de dados',
    description: 'Banco relacional presente desde o estágio.',
    items: [{ name: 'MySQL', note: 'Consultas e dados em plataformas web', icon: 'mysql' }],
  },
  {
    id: 'tools',
    title: 'Ferramentas e produtividade',
    description: 'Versionamento, design e assistentes de IA no fluxo de trabalho.',
    items: [
      { name: 'Git', note: 'Versionamento diário', icon: 'git' },
      { name: 'GitHub', note: 'Repositórios e colaboração', icon: 'github' },
      { name: 'GitLab', note: 'Repositórios corporativos', icon: 'gitlab' },
      { name: 'Figma', note: 'Telas e protótipos', icon: 'figma' },
      { name: 'Claude', note: 'Assistente de IA', icon: 'claude' },
      { name: 'GitHub Copilot', note: 'Autocompletar no editor', icon: 'copilot' },
      { name: 'Codex', note: 'Agente de código', icon: 'codex' },
    ],
  },
]
