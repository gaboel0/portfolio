/** Colors used by GitHub linguist for the languages present in the profile. */
const colors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Vue: '#41b883',
  Python: '#3572a5',
  PHP: '#4f5d95',
  C: '#555555',
  'C#': '#178600',
  CSS: '#663399',
  SCSS: '#c6538c',
  HTML: '#e34c26',
  Blade: '#f7523f',
  Dart: '#00b4ab',
}

export function languageColor(language: string | null): string {
  return (language && colors[language]) || 'var(--ink-3)'
}
