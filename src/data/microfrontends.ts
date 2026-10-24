/**
 * Micro-frontend registry. A project can offer two views in its window:
 *  - `app`: the project's own build, hosted under public/mfe/apps/<name>/ and run in an iframe;
 *  - `about`: a presentation mini-app under public/mfe/<name>/ that talks to the portfolio
 *    through postMessage (see public/mfe/shared/bridge.js).
 * Only repositories listed here open the project window; the rest keep linking to GitHub.
 */
export interface MicroFrontend {
  /** What the window is called in its title bar. */
  title: string
  /** Presentation document, relative to the site base. */
  about: string
  /** The project's own app, when its build is hosted. */
  app?: {
    /** Folder of the build, relative to the site base (must end with a slash). */
    entry: string
    /** One line of help shown above the running app. */
    hint?: string
  }
}

export const microFrontends: Record<string, MicroFrontend> = {
  'Nexus-CRM': {
    title: 'Nexus CRM',
    about: 'mfe/nexus-crm/index.html',
    app: {
      entry: 'mfe/apps/nexus-crm/',
      hint: 'Login de demonstração, do README do projeto: admin@crm.com, senha 123456. Os dados são simulados.',
    },
  },
  DandD: {
    title: 'DandD: Grimório de Classes',
    about: 'mfe/dandd/index.html',
    app: { entry: 'mfe/apps/dandd/' },
  },
  sodacan: {
    title: 'sodacan: animação de lata',
    about: 'mfe/sodacan/index.html',
    app: { entry: 'mfe/apps/soda-can/', hint: 'Passe o mouse sobre as latas para disparar a animação.' },
  },
}

export const getMicroFrontend = (repo: string): MicroFrontend | null => microFrontends[repo] ?? null

export type MicroFrontendView = 'app' | 'about'

const base = () => import.meta.env.BASE_URL

/** URL of one view. Only the presentation reads the theme from the query. */
export function microFrontendUrl(mfe: MicroFrontend, view: MicroFrontendView, theme: string) {
  if (view === 'app' && mfe.app) return `${base()}${mfe.app.entry}`
  return `${base()}${mfe.about}?theme=${encodeURIComponent(theme)}`
}
