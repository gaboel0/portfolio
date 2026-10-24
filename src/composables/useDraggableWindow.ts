import { onBeforeUnmount, onMounted } from 'vue'

const KEYBOARD_STEP = 16
/** How much of the window must stay inside the bounds so it can always be grabbed again. */
const GRAB_MARGIN = 96

/**
 * Makes one AeroWindow draggable by its title bar, inside its section.
 * Pointer events cover mouse, touch and pen; arrow keys move the window when
 * the title bar has focus. The position is applied with the `translate`
 * property so it never fights the window's own `transform` effects.
 */
export function useDraggableWindow(target: { readonly value: unknown }) {
  let root: HTMLElement | null = null
  let handle: HTMLElement | null = null
  let bounds: HTMLElement | null = null
  let x = 0
  let y = 0
  let drag: { px: number; py: number; ox: number; oy: number; rect: DOMRect } | null = null

  function limits(rect: DOMRect, dx: number, dy: number) {
    const box = (bounds ?? document.body).getBoundingClientRect()
    const minX = box.left + GRAB_MARGIN - rect.right
    const maxX = box.right - GRAB_MARGIN - rect.left
    const minY = box.top - rect.top
    const maxY = box.bottom - 48 - rect.top
    return { dx: Math.min(maxX, Math.max(minX, dx)), dy: Math.min(maxY, Math.max(minY, dy)) }
  }

  function apply() {
    if (root) root.style.translate = `${x}px ${y}px`
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || !root || !handle) return
    drag = { px: e.clientX, py: e.clientY, ox: x, oy: y, rect: root.getBoundingClientRect() }
    handle.setPointerCapture(e.pointerId)
    root.classList.add('is-dragging')
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag) return
    const { dx, dy } = limits(drag.rect, e.clientX - drag.px, e.clientY - drag.py)
    x = drag.ox + dx
    y = drag.oy + dy
    apply()
  }

  function onPointerUp(e: PointerEvent) {
    if (!drag || !root || !handle) return
    drag = null
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
    root.classList.remove('is-dragging')
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!root) return
    const move: Record<string, [number, number]> = {
      ArrowLeft: [-KEYBOARD_STEP, 0],
      ArrowRight: [KEYBOARD_STEP, 0],
      ArrowUp: [0, -KEYBOARD_STEP],
      ArrowDown: [0, KEYBOARD_STEP],
    }
    const step = move[e.key]
    if (!step) return
    e.preventDefault()
    const { dx, dy } = limits(root.getBoundingClientRect(), step[0], step[1])
    x += dx
    y += dy
    apply()
  }

  /** After a resize the saved offset may leave the window outside its section: pull it back. */
  function onResize() {
    if (!root) return
    const { dx, dy } = limits(root.getBoundingClientRect(), 0, 0)
    if (dx || dy) {
      x += dx
      y += dy
      apply()
    }
  }

  onMounted(() => {
    const value = target.value
    const el = value instanceof HTMLElement ? value : (value as { $el?: unknown } | null)?.$el
    root = el instanceof HTMLElement ? el : null
    handle = root?.querySelector<HTMLElement>('.titlebar') ?? null
    if (!root || !handle) return
    bounds = root.closest('section')
    handle.classList.add('drag-handle')
    handle.tabIndex = 0
    handle.setAttribute('aria-label', 'Mover a janela: arraste ou use as setas do teclado')
    handle.addEventListener('pointerdown', onPointerDown)
    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
    handle.addEventListener('pointercancel', onPointerUp)
    handle.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    handle?.removeEventListener('pointerdown', onPointerDown)
    handle?.removeEventListener('pointermove', onPointerMove)
    handle?.removeEventListener('pointerup', onPointerUp)
    handle?.removeEventListener('pointercancel', onPointerUp)
    handle?.removeEventListener('keydown', onKeyDown)
  })
}
