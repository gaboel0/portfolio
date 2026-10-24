import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Sphere,
  BufferAttribute,
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
  BoxGeometry,
  type Object3D,
} from 'three'

/**
 * Live 3D emblems for the project covers, all drawn by ONE WebGL canvas laid
 * over the featured grid (browsers cap the number of contexts, so one canvas
 * per card is not an option). Each cover gets its own scene and camera and is
 * rendered into its own rectangle with scissor/viewport.
 */
export type CoverKind = 'ico' | 'knot' | 'orbit' | 'rings' | 'sphere' | 'dodeca' | 'box' | 'd20'

export interface CoverStage {
  refresh(): void
  setPaused(paused: boolean): void
  dispose(): void
}

interface Entry {
  el: HTMLElement
  card: HTMLElement | null
  scene: Scene
  camera: PerspectiveCamera
  emblem: Group
  spin: number
  hover: number
  hoverTarget: number
  onEnter: () => void
  onLeave: () => void
}

const ACCENT = new Color('#9d8fff')
const PALE = new Color('#e4dfff')
const CRIMSON = new Color('#ff3b55')

function lines(geometry: BufferGeometry, color: Color, opacity: number, wire = false) {
  const geo = wire ? new WireframeGeometry(geometry) : new EdgesGeometry(geometry, 1)
  geometry.dispose()
  return new LineSegments(
    geo,
    new LineBasicMaterial({ color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false }),
  )
}

let dotMap: CanvasTexture | null = null

/** Soft round sprite so points read as dots, not squares. */
function roundDot() {
  if (dotMap) return dotMap
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  dotMap = new CanvasTexture(c)
  return dotMap
}

/**
 * Points sized in CSS pixels: with one tall canvas, attenuated sizes would
 * scale with the whole canvas height instead of the cover.
 */
function dots(positions: Float32Array, color: Color, px: number, opacity = 0.9) {
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(positions, 3))
  return new Points(
    geo,
    new PointsMaterial({
      color,
      size: px,
      sizeAttenuation: false,
      map: roundDot(),
      transparent: true,
      opacity,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
}

function vertexDots(geometry: BufferGeometry, color: Color, size: number) {
  return dots(new Float32Array(geometry.getAttribute('position').array), color, size)
}

/** A face label texture for the d20 ("20" in crimson, the rest pale). */
function numberTexture(n: number) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = n === 20 ? '#ff3b55' : '#e4dfff'
  ctx.font = "800 64px Syne, 'Manrope', sans-serif"
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(n), 64, 70)
  // Underline 6 and 9 so they can be told apart, as on real dice.
  if (n === 6 || n === 9) ctx.fillRect(44, 102, 40, 6)
  return new CanvasTexture(c)
}

/**
 * Twenty-sided die: a dark solid body (it hides the back faces), glowing
 * violet edges, crimson vertices and numbered faces.
 */
function buildD20(g: Group) {
  const r = 0.72
  const shape = new IcosahedronGeometry(r, 0) // non-indexed: 20 triangles, 3 vertices each
  const body = new Mesh(
    new IcosahedronGeometry(r * 0.995, 0),
    new MeshBasicMaterial({ color: '#14112a', transparent: true, opacity: 0.92 }),
  )
  g.add(body)
  const fill = new Mesh(
    new IcosahedronGeometry(r * 0.998, 0),
    new MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.07, blending: AdditiveBlending, depthWrite: false }),
  )
  g.add(fill)
  g.add(vertexDots(shape, CRIMSON, 5))
  g.add(lines(shape.clone(), ACCENT, 0.95))

  const pos = shape.getAttribute('position')
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const label = new PlaneGeometry(r * 0.5, r * 0.5)
  for (let face = 0; face < 20; face++) {
    a.fromBufferAttribute(pos, face * 3)
    b.fromBufferAttribute(pos, face * 3 + 1)
    c.fromBufferAttribute(pos, face * 3 + 2)
    const centroid = new Vector3().add(a).add(b).add(c).divideScalar(3)
    const plane = new Mesh(
      label.clone(),
      new MeshBasicMaterial({ map: numberTexture(face + 1), transparent: true, depthWrite: false }),
    )
    plane.position.copy(centroid).multiplyScalar(1.01)
    plane.lookAt(centroid.clone().multiplyScalar(2))
    g.add(plane)
  }
  label.dispose()
  shape.dispose()
  // The die is the star of its cover: draw it larger than the other emblems.
  g.userData.boost = 1.45
}

/** One emblem per stack family, so each card reads differently. */
function buildEmblem(kind: CoverKind, seed: number): Group {
  const g = new Group()
  switch (kind) {
    case 'd20': {
      buildD20(g)
      break
    }
    case 'knot': {
      g.add(lines(new TorusKnotGeometry(0.55, 0.16, 90, 8, 2, 3), ACCENT, 0.55, true))
      break
    }
    case 'orbit': {
      const core = new OctahedronGeometry(0.42, 0)
      g.add(vertexDots(core, CRIMSON, 7))
      g.add(lines(core, ACCENT, 0.9))
      // Three tilted orbits of points: messages travelling around the device.
      for (let r = 0; r < 3; r++) {
        const n = 48
        const pos = new Float32Array(n * 3)
        const radius = 0.75 + r * 0.22
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          pos[i * 3] = Math.cos(a) * radius
          pos[i * 3 + 1] = Math.sin(a) * radius * 0.35
          pos[i * 3 + 2] = Math.sin(a) * radius * 0.6
        }
        const ring = dots(pos, r === 1 ? PALE : ACCENT, 3, 0.8)
        ring.rotation.z = (r - 1) * 0.55
        g.add(ring)
      }
      break
    }
    case 'rings': {
      for (let i = 0; i < 3; i++) {
        const ring = lines(new TorusGeometry(0.42 + i * 0.2, 0.012, 6, 64), i === 1 ? PALE : ACCENT, 0.8)
        ring.rotation.x = Math.PI / 2 + i * 0.5
        ring.rotation.y = i * 0.7
        g.add(ring)
      }
      const center = new Float32Array([0, 0, 0])
      g.add(dots(center, CRIMSON, 12))
      break
    }
    case 'sphere': {
      const n = 420
      const pos = new Float32Array(n * 3)
      // Fibonacci sphere.
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const t = i * 2.399963
        pos[i * 3] = Math.cos(t) * r * 0.7
        pos[i * 3 + 1] = y * 0.7
        pos[i * 3 + 2] = Math.sin(t) * r * 0.7
      }
      g.add(dots(pos, PALE, 3, 0.85))
      break
    }
    case 'dodeca': {
      const geo = new DodecahedronGeometry(0.62, 0)
      g.add(vertexDots(geo, CRIMSON, 6))
      g.add(lines(geo, ACCENT, 0.9))
      break
    }
    case 'box': {
      const geo = new BoxGeometry(0.8, 0.8, 0.8, 2, 2, 2)
      g.add(lines(geo, ACCENT, 0.5, true))
      break
    }
    default: {
      const outer = new IcosahedronGeometry(0.68, 1)
      g.add(lines(outer, ACCENT, 0.75))
      const inner = new IcosahedronGeometry(0.3, 0)
      g.add(vertexDots(inner, CRIMSON, 6))
      g.add(lines(inner, PALE, 0.9))
    }
  }
  g.rotation.set((seed % 7) * 0.3, (seed % 11) * 0.4, 0)
  // Normalise every emblem to the same bounding radius so none spills out.
  const bounds = new Box3().setFromObject(g).getBoundingSphere(new Sphere())
  g.userData.norm = bounds.radius > 0 ? 0.75 / (bounds.radius + bounds.center.length()) : 1
  return g
}

function disposeTree(root: Object3D) {
  root.traverse((obj) => {
    const mesh = obj as Object3D & { geometry?: BufferGeometry; material?: { dispose(): void; map?: CanvasTexture | null } }
    mesh.geometry?.dispose()
    // Per-face number textures belong to the emblem; the shared dot sprite does not.
    if (mesh.material?.map && mesh.material.map !== dotMap) mesh.material.map.dispose()
    mesh.material?.dispose()
  })
}

export function createCoverStage(canvas: HTMLCanvasElement, container: HTMLElement, reducedMotion: boolean): CoverStage {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.setScissorTest(true)

  let entries: Entry[] = []
  let width = 0
  let height = 0
  let paused = false
  let frame = 0
  let last = performance.now()

  function resize() {
    width = container.clientWidth
    height = container.clientHeight
    renderer.setSize(width, height, false)
    if (reducedMotion) render(0)
  }

  function clear() {
    for (const e of entries) {
      e.card?.removeEventListener('pointerenter', e.onEnter)
      e.card?.removeEventListener('pointerleave', e.onLeave)
      disposeTree(e.scene)
    }
    entries = []
  }

  function refresh() {
    clear()
    for (const el of container.querySelectorAll<HTMLElement>('[data-cover]')) {
      const kind = (el.dataset.kind as CoverKind) ?? 'ico'
      const seed = Number(el.dataset.seed ?? 0)
      const scene = new Scene()
      const camera = new PerspectiveCamera(32, 1, 0.1, 50)
      camera.position.z = 4.2
      const emblem = buildEmblem(kind, seed)
      scene.add(emblem)
      const entry: Entry = {
        el,
        card: el.closest<HTMLElement>('.project'),
        scene,
        camera,
        emblem,
        spin: 0.25 + (seed % 5) * 0.04,
        hover: 0,
        hoverTarget: 0,
        onEnter: () => (entry.hoverTarget = 1),
        onLeave: () => (entry.hoverTarget = 0),
      }
      entry.card?.addEventListener('pointerenter', entry.onEnter)
      entry.card?.addEventListener('pointerleave', entry.onLeave)
      entries.push(entry)
    }
    resize()
  }

  function render(dt: number) {
    renderer.setScissor(0, 0, width, height)
    renderer.setViewport(0, 0, width, height)
    renderer.clear()
    const box = container.getBoundingClientRect()
    for (const e of entries) {
      const r = e.el.getBoundingClientRect()
      const w = r.width
      const h = r.height
      if (w < 2 || h < 2) continue
      const x = r.left - box.left
      const y = height - (r.bottom - box.top) // GL origin is bottom-left

      e.hover += (e.hoverTarget - e.hover) * Math.min(1, dt * 6)
      if (!reducedMotion) {
        e.emblem.rotation.y += dt * e.spin * (1 + e.hover * 3)
        e.emblem.rotation.x += dt * e.spin * 0.35
      }
      // Emblem sits in the upper-right of the cover, clear of the title below.
      e.camera.aspect = w / h
      const halfH = Math.tan((e.camera.fov * Math.PI) / 360) * e.camera.position.z
      const halfW = halfH * e.camera.aspect
      const boost = (e.emblem.userData.boost as number | undefined) ?? 1
      const size = Math.min(Math.min(halfW * 0.4, halfH * 0.7) * boost, halfH * 0.86) // emblem radius in world units
      const scale = (size / 0.75) * (e.emblem.userData.norm as number) * (1 + e.hover * 0.12)
      e.emblem.scale.setScalar(scale)
      e.emblem.position.set(halfW - size * 1.1 - halfW * 0.05, halfH - size * 1.1 - halfH * 0.1, 0)
      e.camera.updateProjectionMatrix()

      renderer.setViewport(x, y, w, h)
      renderer.setScissor(x, y, w, h)
      renderer.render(e.scene, e.camera)
    }
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    render(dt)
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  refresh()
  if (!reducedMotion) frame = requestAnimationFrame(tick)

  return {
    refresh,
    setPaused(value) {
      if (reducedMotion || value === paused) return
      paused = value
      if (paused) cancelAnimationFrame(frame)
      else {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    },
    dispose() {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      clear()
      renderer.dispose()
      dotMap?.dispose()
      dotMap = null
    },
  }
}
