import {
  AdditiveBlending,
  NormalBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/**
 * Hero scene: a black eclipse with a violet corona, a slow starfield, a ring
 * of orbiting particles and short-lived lightning arcs ("chidori") that spark
 * from the rim. Clicking the canvas releases a burst of arcs.
 */
export type SceneTheme = 'light' | 'dark'

export interface ChidoriScene {
  setPaused(paused: boolean): void
  setTheme(theme: SceneTheme): void
  burst(): void
  /** True when a viewport point lies on the eclipse disc. */
  hitMoon(clientX: number, clientY: number): boolean
  dispose(): void
}

interface Options {
  reducedMotion: boolean
  theme: SceneTheme
  onReady?: () => void
}

/**
 * Night: additive glow + bloom on a dark sky.
 * Dawn: the same eclipse drawn with normal blending on a pale lavender sky,
 * with darker strokes so it reads on light backgrounds (bloom off).
 */
const PALETTES = {
  dark: {
    clear: '#07060d',
    disc: '#030208',
    rim: '#8f80ff',
    corona: '#8f80ff',
    coronaOpacity: 0.3,
    bolt: '#e4dfff',
    crimson: '#ff3b55',
    orbit: '#e4dfff',
    stars: '#cfcaf0',
    starOpacity: 0.7,
    blending: AdditiveBlending,
    bloom: true,
  },
  light: {
    clear: '#dde1f8',
    // A pale "dawn moon" so the dark headline stays readable where they overlap.
    disc: '#dcd8f0',
    rim: '#5a48e0',
    corona: '#8f80ff',
    coronaOpacity: 0.45,
    bolt: '#4a39c9',
    crimson: '#d6253d',
    orbit: '#5a48e0',
    stars: '#3d3a58',
    starOpacity: 0.35,
    blending: NormalBlending,
    bloom: false,
  },
} as const

let palette: (typeof PALETTES)[SceneTheme] = PALETTES.dark

const RADIUS = 1.55
const BOLTS = 10
const BOLT_POINTS = 33 // 2^5 + 1, from midpoint displacement

function glowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

/** Jagged path between two points by recursive midpoint displacement. */
function lightningPath(out: Float32Array, ax: number, ay: number, bx: number, by: number, roughness: number) {
  const n = BOLT_POINTS
  const xs = new Float32Array(n)
  const ys = new Float32Array(n)
  xs[0] = ax
  ys[0] = ay
  xs[n - 1] = bx
  ys[n - 1] = by
  let step = n - 1
  let offset = roughness
  while (step > 1) {
    const half = step / 2
    for (let i = half; i < n; i += step) {
      const x0 = xs[i - half]!
      const y0 = ys[i - half]!
      const x1 = xs[i + half]!
      const y1 = ys[i + half]!
      // Displace perpendicular to the segment.
      const dx = x1 - x0
      const dy = y1 - y0
      const len = Math.hypot(dx, dy) || 1
      const d = (Math.random() - 0.5) * offset
      xs[i] = (x0 + x1) / 2 + (-dy / len) * d
      ys[i] = (y0 + y1) / 2 + (dx / len) * d
    }
    step = half
    offset *= 0.55
  }
  for (let i = 0; i < n; i++) {
    out[i * 3] = xs[i]!
    out[i * 3 + 1] = ys[i]!
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.15
  }
}

export function createChidoriScene(canvas: HTMLCanvasElement, options: Options): ChidoriScene {
  palette = PALETTES[options.theme]
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setClearColor(palette.clear, 1)

  const scene = new Scene()
  const camera = new PerspectiveCamera(38, 1, 0.1, 200)
  camera.position.set(0, 0, 10)

  // Eclipse ------------------------------------------------------------------
  const eclipse = new Group()
  scene.add(eclipse)

  const disc = new Mesh(new SphereGeometry(RADIUS, 64, 64), new MeshBasicMaterial({ color: palette.disc }))
  eclipse.add(disc)

  // Rim brighter on one side, so it reads as a crescent of light.
  const rimMaterial = new ShaderMaterial({
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Color(palette.rim) },
      uDir: { value: new Vector2(-0.6, -0.8).normalize() },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() {
        vPos = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec2 uDir;
      uniform float uTime;
      varying vec2 vPos;
      void main() {
        float r = length(vPos);
        float side = dot(normalize(vPos), uDir) * 0.5 + 0.5;
        float edge = 1.0 - smoothstep(${RADIUS.toFixed(2)}, ${(RADIUS + 0.55).toFixed(2)}, r);
        float pulse = 0.85 + 0.15 * sin(uTime * 1.3 + side * 6.0);
        float a = edge * (0.06 + pow(side, 2.6) * 1.1) * pulse;
        gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
      }
    `,
  })
  const rim = new Mesh(new RingGeometry(RADIUS - 0.01, RADIUS + 0.6, 128, 1), rimMaterial)
  eclipse.add(rim)

  const glowMap = glowTexture()
  const corona = new Sprite(
    new SpriteMaterial({ map: glowMap, color: palette.corona, transparent: true, opacity: palette.coronaOpacity, blending: AdditiveBlending, depthWrite: false }),
  )
  corona.scale.setScalar(RADIUS * 5)
  corona.position.z = -0.5
  eclipse.add(corona)

  // Orbiting particles ---------------------------------------------------------
  const orbitCount = 520
  const orbitPositions = new Float32Array(orbitCount * 3)
  for (let i = 0; i < orbitCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = RADIUS + 0.35 + Math.pow(Math.random(), 2) * 2.2
    orbitPositions[i * 3] = Math.cos(a) * r
    orbitPositions[i * 3 + 1] = Math.sin(a) * r * 0.32
    orbitPositions[i * 3 + 2] = Math.sin(a) * r * 0.5
  }
  const orbitGeometry = new BufferGeometry()
  orbitGeometry.setAttribute('position', new BufferAttribute(orbitPositions, 3))
  const orbit = new Points(
    orbitGeometry,
    new PointsMaterial({ color: palette.orbit, size: 0.03, transparent: true, opacity: 0.75, blending: AdditiveBlending, depthWrite: false }),
  )
  orbit.rotation.z = -0.35
  eclipse.add(orbit)

  // Starfield ------------------------------------------------------------------
  const starCount = 1600
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 18 + Math.random() * 50
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3 + 2] = -Math.abs(r * Math.cos(phi))
  }
  const starGeometry = new BufferGeometry()
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  const stars = new Points(
    starGeometry,
    new PointsMaterial({ color: palette.stars, size: 0.09, transparent: true, opacity: palette.starOpacity, depthWrite: false }),
  )
  scene.add(stars)

  // Lightning ------------------------------------------------------------------
  interface Bolt {
    line: Line<BufferGeometry, LineBasicMaterial>
    life: number
    max: number
  }
  const bolts: Bolt[] = []
  for (let i = 0; i < BOLTS; i++) {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(BOLT_POINTS * 3), 3))
    const material = new LineBasicMaterial({ color: palette.bolt, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false })
    const line = new Line(geometry, material)
    line.visible = false
    eclipse.add(line)
    bolts.push({ line, life: 0, max: 0 })
  }

  function spark(bolt: Bolt, wild = false) {
    // Arcs favour the lit side of the rim.
    const base = Math.atan2(-0.8, -0.6)
    const a = base + (Math.random() - 0.5) * (wild ? Math.PI * 2 : 2.2)
    const r0 = RADIUS + 0.02
    const length = (wild ? 1.6 : 0.8) + Math.random() * (wild ? 2.6 : 1.8)
    const a1 = a + (Math.random() - 0.5) * 0.9
    const attr = bolt.line.geometry.getAttribute('position') as BufferAttribute
    lightningPath(
      attr.array as Float32Array,
      Math.cos(a) * r0,
      Math.sin(a) * r0,
      Math.cos(a1) * (r0 + length),
      Math.sin(a1) * (r0 + length),
      0.9 + length * 0.25,
    )
    attr.needsUpdate = true
    bolt.line.material.color.set(Math.random() < 0.22 ? palette.crimson : palette.bolt)
    bolt.max = bolt.life = 0.08 + Math.random() * 0.22
    bolt.line.visible = true
  }

  // Post-processing ------------------------------------------------------------
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.75, 0.5, 0.12)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  /** Recolours every material for the current palette. */
  function applyPalette() {
    const blending = palette.blending
    renderer.setClearColor(palette.clear, 1)
    disc.material.color.set(palette.disc)
    rimMaterial.uniforms.uColor!.value.set(palette.rim)
    rimMaterial.blending = blending
    corona.material.color.set(palette.corona)
    corona.material.opacity = palette.coronaOpacity
    corona.material.blending = blending
    orbit.material.color.set(palette.orbit)
    orbit.material.blending = blending
    stars.material.color.set(palette.stars)
    stars.material.opacity = palette.starOpacity
    for (const bolt of bolts) bolt.line.material.blending = blending
    for (const m of [rimMaterial, corona.material, orbit.material, ...bolts.map((b) => b.line.material)]) m.needsUpdate = true
    bloom.enabled = palette.bloom
  }
  applyPalette()

  // Layout: eclipse sits right on wide screens, high and centred on narrow ones.
  function layout() {
    const parent = canvas.parentElement
    const width = parent?.clientWidth ?? window.innerWidth
    const height = parent?.clientHeight ?? window.innerHeight
    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    const wide = camera.aspect > 1.05
    eclipse.position.set(wide ? 2.9 : 0.4, wide ? 0.35 : 1.9, 0)
    eclipse.scale.setScalar(wide ? 0.88 : 0.7)
  }
  layout()
  const resizeObserver = new ResizeObserver(layout)
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

  // Pointer parallax -------------------------------------------------------------
  const pointer = new Vector2()
  const look = new Vector2()
  function onPointer(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1))
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  // Loop -------------------------------------------------------------------------
  let paused = false
  let frame = 0
  let last = performance.now()
  let elapsed = 0
  let nextSpark = 0

  function update(dt: number) {
    elapsed += dt
    rimMaterial.uniforms.uTime!.value = elapsed
    stars.rotation.y += dt * 0.006
    stars.rotation.x += dt * 0.002
    orbit.rotation.y += dt * 0.18
    look.lerp(pointer, Math.min(1, dt * 2.5))
    camera.position.x = look.x * 0.55
    camera.position.y = look.y * 0.35
    camera.lookAt(0, 0, 0)

    nextSpark -= dt
    if (nextSpark <= 0) {
      const idle = bolts.find((b) => b.life <= 0)
      if (idle) spark(idle)
      nextSpark = 0.04 + Math.random() * 0.22
    }
    for (const bolt of bolts) {
      if (bolt.life <= 0) {
        bolt.line.visible = false
        continue
      }
      bolt.life -= dt
      const t = Math.max(0, bolt.life / bolt.max)
      bolt.line.material.opacity = t * (0.6 + Math.random() * 0.4)
    }
  }

  function render() {
    composer.render()
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    update(dt)
    render()
  }

  if (options.reducedMotion) {
    // One still frame with a few arcs frozen in place.
    for (let i = 0; i < 5; i++) {
      spark(bolts[i]!)
      bolts[i]!.line.material.opacity = 0.8
    }
    render()
  } else {
    frame = requestAnimationFrame(tick)
  }
  options.onReady?.()

  return {
    setPaused(value) {
      if (options.reducedMotion || value === paused) return
      paused = value
      if (paused) cancelAnimationFrame(frame)
      else {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    },
    setTheme(theme) {
      palette = PALETTES[theme]
      applyPalette()
      // Draw right away so a view-transition snapshot already shows the new sky.
      render()
    },
    hitMoon(clientX, clientY) {
      camera.updateMatrixWorld()
      const rect = canvas.getBoundingClientRect()
      const toScreen = (v: Vector3) => {
        const p = v.clone().project(camera)
        return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height }
      }
      const centre = toScreen(eclipse.position)
      const edge = toScreen(eclipse.position.clone().add(new Vector3(RADIUS * eclipse.scale.x, 0, 0)))
      return Math.hypot(clientX - centre.x, clientY - centre.y) <= Math.abs(edge.x - centre.x) * 1.1
    },
    burst() {
      for (const bolt of bolts) spark(bolt, true)
      if (options.reducedMotion) render()
    },
    dispose() {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      scene.traverse((obj) => {
        const mesh = obj as Mesh
        mesh.geometry?.dispose()
        const material = mesh.material as { dispose?: () => void } | undefined
        material?.dispose?.()
      })
      glowMap.dispose()
      composer.dispose()
      renderer.dispose()
    },
  }
}
