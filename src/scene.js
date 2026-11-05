/* ============================================================
   Background orchestrator.

   Owns the renderer, the post-processing composer, the pointer/
   resize/visibility plumbing and the render loop. The visuals come
   from the wave-grid background module, which exports a factory
   returning:
     { scene, camera, clearColor, bloom|null, update, resize, dispose }
   ============================================================ */

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { createWaveGrid } from './backgrounds/wavegrid.js'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch (e) {
    return false
  }
}

export function initScene(canvas) {
  if (!hasWebGL()) {
    canvas.style.display = 'none'
    return null
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 768px)').matches

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const bg = createWaveGrid({ THREE, isMobile, prefersReduced })
  renderer.setClearColor(bg.clearColor != null ? bg.clearColor : 0x07070b, 1)

  // Composer: render pass + optional bloom.
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(bg.scene, bg.camera))
  let bloomPass = null
  if (bg.bloom) {
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bg.bloom.strength,
      bg.bloom.radius,
      bg.bloom.threshold
    )
    composer.addPass(bloomPass)
  }
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setSize(window.innerWidth, window.innerHeight)

  // Eased pointer for subtle parallax.
  const target = { x: 0, y: 0 }
  const pointer = { x: 0, y: 0 }
  function onPointerMove(e) {
    target.x = (e.clientX / window.innerWidth) * 2 - 1
    target.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  function renderOnce() {
    composer.render()
  }

  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    composer.setSize(w, h)
    if (bloomPass) bloomPass.setSize(w, h)
    bg.resize(w, h)
    if (prefersReduced) renderOnce()
  }
  window.addEventListener('resize', onResize)

  const clock = new THREE.Clock()
  let running = true
  let rafId = 0

  function animate() {
    if (!running) return
    rafId = requestAnimationFrame(animate)
    pointer.x += (target.x - pointer.x) * 0.05
    pointer.y += (target.y - pointer.y) * 0.05
    bg.update(clock.getElapsedTime(), pointer)
    composer.render()
  }

  if (prefersReduced) {
    // Static frame only — respect the user's motion preference.
    bg.update(0, pointer)
    renderOnce()
  } else {
    animate()
  }

  function onVisibility() {
    if (prefersReduced) return
    if (document.hidden) {
      running = false
      cancelAnimationFrame(rafId)
    } else if (!running) {
      running = true
      clock.getDelta() // swallow the paused gap
      animate()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  return {
    destroy() {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      bg.dispose()
      if (bloomPass) bloomPass.dispose()
      renderer.dispose()
    }
  }
}
