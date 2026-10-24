import type { Problem, Role } from '@/types/portfolio'

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
      'Desenvolvo e mantenho o front-end de plataformas web, adaptando-me ao que cada produto exige.',
    responsibilities: [
      'Manutenção e desenvolvimento front-end de plataformas web',
      'Interfaces e protótipos de tela',
      'Versionamento e gerenciamento de código',
      'Uso de IA e participação em iniciativas de inovação',
    ],
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
      'Desenvolvimento front-end em produtos já existentes',
      'Gerenciamento de código em repositórios do time',
      'Criação de telas',
      'Trabalho com banco de dados e estudo de novas tecnologias',
    ],
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

/**
 * Problems I solve. Everything here comes from the resume (Unipac) or from the
 * README of a public repository, which is linked as proof.
 */
export const problems: Problem[] = [
  {
    title: 'Plataformas que não podem parar de evoluir',
    problem: 'Uma plataforma no ar sempre pede ajuste de tela e funcionalidade nova.',
    solution: 'Mantenho e desenvolvo o front-end de plataformas web, entregando o que falta sem parar o que existe.',
    proof: { label: 'Na Unipac' },
  },
  {
    title: 'Ideias que ainda não têm cara',
    problem: 'Sem tela, cada pessoa imagina uma coisa diferente.',
    solution: 'Desenho telas e protótipos e levo o desenho até a implementação.',
    proof: { label: 'Na Unipac' },
  },
  {
    title: 'Um produto, vários formatos',
    problem: 'Cada produto tem uma base de código diferente, na web ou no celular.',
    solution: 'Trabalho com interfaces web e mobile e me adapto ao que cada produto exige.',
    proof: { label: 'Na Unipac' },
  },
  {
    title: 'Projetos sem um lugar para acompanhar',
    problem: 'Sem um painel, projetos e tarefas se perdem.',
    solution: 'Criei um painel com indicadores, quadro de tarefas e detalhes de cada projeto.',
    proof: { label: 'Nexus-CRM', repo: 'Nexus-CRM' },
  },
  {
    title: 'Dados de API difíceis de consultar',
    problem: 'Dados crus de uma API são difíceis de ler e comparar.',
    solution: 'Transformei os dados de uma API de RPG numa consulta com busca e detalhes em português.',
    proof: { label: 'DandD', repo: 'DandD' },
  },
  {
    title: 'Dispositivos que perdem a conexão',
    problem: 'Um dispositivo conectado precisa continuar enviando dados quando a rede cai.',
    solution: 'Num projeto de IoT, o dispositivo se reconecta sozinho e monitora a própria saúde.',
    proof: { label: 'ProjetoP2_IoT', repo: 'ProjetoP2_IoT' },
  },
  {
    title: 'Trabalho repetitivo que toma tempo',
    problem: 'Parte do desenvolvimento é repetição e tira tempo de quem decide.',
    solution: 'Uso ferramentas de IA no fluxo de desenvolvimento e participo de iniciativas de inovação.',
    proof: { label: 'Na Unipac' },
  },
]
