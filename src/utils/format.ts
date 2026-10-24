const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
const fullDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

function parse(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "2023-03" → "mar. 2023" */
export function formatMonth(value: string): string {
  const date = parse(`${value}-01T12:00:00`)
  return date ? monthYear.format(date).replace(' de ', ' ') : value
}

export function formatDate(value: string): string {
  const date = parse(value)
  return date ? fullDate.format(date).replace(/ de /g, ' ') : '—'
}

export function formatRelative(value: string, now = new Date()): string {
  const date = parse(value)
  if (!date) return '—'
  const diff = (date.getTime() - now.getTime()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) return relative.format(Math.round(diff / seconds), unit)
  }
  return 'agora mesmo'
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Duration between two "YYYY-MM" strings (end defaults to now). */
export function formatDuration(start: string, end: string | null, now = new Date()): string {
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end ? end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1]
  const months = ((ey ?? 0) - (sy ?? 0)) * 12 + ((em ?? 0) - (sm ?? 0))
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts: string[] = []
  if (years) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  if (rest) parts.push(`${rest} ${rest === 1 ? 'mês' : 'meses'}`)
  return parts.join(' e ') || 'menos de 1 mês'
}

/** "Nexus-CRM" → "Nexus CRM". Casing is kept as published (e.g. "DandD"). */
export function prettifyRepoName(name: string): string {
  return name.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0')
}
