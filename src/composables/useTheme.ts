import { nextTick, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'
const KEY = 'portfolio-theme'
const DURATION = 900

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // storage blocked
  }
  // Night is the signature look; light ("dawn") is opt-in via the toggle.
  return 'dark'
}

const theme = ref<Theme>(initial())
let running = false

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
    try {
      localStorage.setItem(KEY, value)
    } catch {
      // storage blocked
    }
  },
  // Sync flush: the DOM attribute must change inside the view-transition callback.
  { immediate: true, flush: 'sync' },
)

/** A short-lived glow at the click point: sunrise when going light, a violet ring when going dark. */
function burst(x: number, y: number, to: Theme) {
  const el = document.createElement('span')
  el.className = `theme-burst theme-burst--${to}`
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  el.setAttribute('aria-hidden', 'true')
  document.body.appendChild(el)
  el.addEventListener('animationend', () => el.remove(), { once: true })
  window.setTimeout(() => el.remove(), DURATION + 400)
}

/**
 * Switches theme with a circular reveal that grows from the toggle button.
 * Dawn (light) expands over the night; night collapses the light back into
 * the button. Falls back to a colour cross-fade without View Transitions,
 * and switches instantly under reduced motion.
 */
async function toggle(event?: MouseEvent) {
  if (running) return
  const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
  const root = document.documentElement
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    theme.value = next
    return
  }

  const target = event?.currentTarget as HTMLElement | null
  const rect = target?.getBoundingClientRect()
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40
  const y = rect ? rect.top + rect.height / 2 : 40
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  if (!('startViewTransition' in document)) {
    root.classList.add('theme-fading')
    theme.value = next
    burst(x, y, next)
    window.setTimeout(() => root.classList.remove('theme-fading'), 700)
    return
  }

  running = true
  root.dataset.themeAnim = next === 'light' ? 'to-light' : 'to-dark'
  const transition = document.startViewTransition(async () => {
    theme.value = next
    await nextTick()
  })

  try {
    await transition.ready
    burst(x, y, next)
    const circle = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]
    const toLight = next === 'light'
    root.animate(
      { clipPath: toLight ? circle : [...circle].reverse() },
      {
        duration: DURATION,
        easing: toLight ? 'cubic-bezier(0.65, 0, 0.35, 1)' : 'cubic-bezier(0.7, 0, 0.84, 0)',
        pseudoElement: toLight ? '::view-transition-new(root)' : '::view-transition-old(root)',
        fill: 'forwards',
      },
    )
    await transition.finished
  } catch {
    // Transition skipped (e.g. tab hidden): the theme has still changed.
  } finally {
    delete root.dataset.themeAnim
    running = false
  }
}

export function useTheme() {
  return { theme, toggle }
}
