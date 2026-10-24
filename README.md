# Portfólio — Gabriel dos Santos Figueiredo

Portfólio pessoal em Vue 3 + TypeScript + Vite. Os projetos são carregados da API pública do GitHub
(`gaboel0`), sem tokens no front-end.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (vue-tsc) + build de produção em dist/
npm run preview    # serve o build de produção
npm run snapshot   # atualiza o snapshot offline a partir da API do GitHub
```

## Estrutura

```text
src/
├── components/   # AppHeader, ProjectCard, ProjectCover, BrandIcon, SearchField…
├── sections/     # HeroSection, FeaturedProjects, RepositoryExplorer, AboutSection,
│                 # SkillsSection, ExperienceTimeline, EducationSection, ContactSection
├── three/        # chidoriScene.ts (cena do hero) e coverStage.ts (emblemas 3D das capas,
│                 # um único canvas WebGL para todos os cards) — carregados sob demanda
├── services/     # github.ts — fetch, cache, tratamento de erros e limite de requisições
├── composables/  # useGithub (estado compartilhado), useTheme, v-reveal
├── data/         # profile.ts (currículo), curation.ts (notas dos READMEs),
│                 # github-snapshot.ts (cópia da API, só para fallback)
├── types/        # tipos da API do GitHub e do portfólio
├── utils/        # datas, ranking de projetos, cores de linguagem
└── styles/       # tokens.css (tema claro/escuro), base.css
```

## Dados

- **API do GitHub** (`/users/gaboel0` e `/users/gaboel0/repos`): fonte principal. As respostas ficam em
  cache na memória e no `sessionStorage` por 15 minutos.
- **`data/curation.ts`**: resumos escritos a partir do README de cada repositório. Aparecem com o
  rótulo "Resumo do README" e nunca substituem a descrição da API.
- **`data/github-snapshot.ts`**: cópia fiel da API usada apenas quando ela falha (rede ou limite de
  requisições). A interface avisa quando o snapshot está em uso.

### Seleção dos destaques

`utils/projects.ts` pontua cada repositório por documentação, descrição, link de demo, tamanho do
código, atividade recente e, com peso pequeno, estrelas. A escolha penaliza repetir a mesma família de
stack, para mostrar variedade. Repositórios vazios, forks, arquivados e o README do perfil não entram
nos destaques.
