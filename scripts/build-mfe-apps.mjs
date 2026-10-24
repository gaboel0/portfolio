// Rebuilds the micro-frontend apps hosted in public/mfe/apps/ from their GitHub repositories.
//
//   npm run mfe:build            all apps
//   npm run mfe:build -- dandd   only one
//
// Each repository is cloned (shallow) into a fresh temporary folder, its dependencies are
// installed with --ignore-scripts, and it is built with a base path that matches where the
// portfolio serves it. Nothing is installed in or written to the portfolio besides the final
// build output.
import { execSync } from 'node:child_process'
import { cp, mkdtemp, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OWNER = 'gaboel0'
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const apps = [
  {
    name: 'dandd',
    repo: 'DandD',
    build: (base) => `npx vite build --base ${base} --outDir out`,
    out: 'out',
  },
  {
    name: 'nexus-crm',
    repo: 'Nexus-CRM',
    build: (base) => `npx ng build --base-href ${base} --output-path out`,
    out: 'out/browser',
  },
  {
    name: 'soda-can',
    repo: 'sodacan',
    // A static page: no install and no build, the repository files are the app.
    static: true,
  },
]

const wanted = process.argv.slice(2)
const selected = wanted.length ? apps.filter((a) => wanted.includes(a.name)) : apps
if (!selected.length) {
  console.error(`Unknown app. Choose from: ${apps.map((a) => a.name).join(', ')}`)
  process.exit(1)
}

const run = (command, cwd, env = {}) =>
  execSync(command, {
    cwd,
    stdio: 'inherit',
    // MSYS_NO_PATHCONV stops Git Bash from rewriting "/mfe/..." into a Windows path.
    env: { ...process.env, MSYS_NO_PATHCONV: '1', NG_CLI_ANALYTICS: 'false', ...env },
  })

async function removeSourceMaps(dir) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry)
    if ((await stat(path)).isDirectory()) await removeSourceMaps(path)
    else if (entry.endsWith('.map')) await rm(path)
  }
}

const work = await mkdtemp(join(tmpdir(), 'portfolio-mfe-'))
try {
  for (const app of selected) {
    const base = `/mfe/apps/${app.name}/`
    const dir = join(work, app.name)
    console.log(`\n=== ${app.name}: ${OWNER}/${app.repo} -> ${base}`)
    run(`git clone --depth 1 https://github.com/${OWNER}/${app.repo}.git "${dir}"`, work)
    if (!app.static) {
      run('npm ci --ignore-scripts --no-audit --no-fund', dir)
      run(app.build(base), dir, app.env)
    }

    const dest = join(root, 'public', 'mfe', 'apps', app.name)
    await rm(dest, { recursive: true, force: true })
    await cp(app.static ? dir : join(dir, app.out), dest, {
      recursive: true,
      // A static repository is copied whole, minus its git data and docs.
      filter: (path) => !app.static || !/[\\/](\.git|README\.md)([\\/]|$)/.test(path),
    })
    await removeSourceMaps(dest)
    console.log(`${app.name}: build copied to public/mfe/apps/${app.name}`)
  }
} finally {
  await rm(work, { recursive: true, force: true })
}
