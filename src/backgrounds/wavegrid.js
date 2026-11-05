/* Wave grid — an undulating wireframe terrain receding to the horizon.
   Kept in the lower half and dimmed, so the upper area stays clear for text. */

import * as THREE from 'three'
import { NOISE_GLSL } from './shaders.js'

const VERT = /* glsl */ `
  uniform float uTime;
  varying float vElev;
  varying vec3 vWorld;

  ${NOISE_GLSL}

  void main() {
    vec3 p = position; // floor plane: x/z spread, y = 0
    float wave = sin(p.z * 0.4 + uTime * 1.1) * 0.45
               + sin(p.x * 0.3 - uTime * 0.5) * 0.28
               + snoise(vec3(p.xz * 0.13, uTime * 0.2)) * 0.7;
    p.y += wave;

    vElev = p.y;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uColorNear;
  uniform vec3 uColorFar;
  varying float vElev;
  varying vec3 vWorld;

  void main() {
    // Fade lines out toward the horizon (far in -z) so they melt into the dark.
    float dist = clamp((vWorld.z + 22.0) / 30.0, 0.0, 1.0);
    float elev = smoothstep(-0.3, 1.1, vElev);
    vec3 col = mix(uColorFar, uColorNear, elev);
    float alpha = dist * (0.18 + elev * 0.55);
    gl_FragColor = vec4(col, alpha);
  }
`

export function createWaveGrid({ isMobile }) {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 1.7, 6)
  camera.lookAt(0, 0.1, -6)

  const seg = isMobile ? 64 : 120
  const geometry = new THREE.PlaneGeometry(44, 44, seg, seg)
  geometry.rotateX(-Math.PI / 2) // lay it flat as a floor

  const material = new THREE.ShaderMaterial({
    wireframe: true,
    transparent: true,
    depthWrite: false,
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uColorNear: { value: new THREE.Color('#ff7a18') },
      uColorFar: { value: new THREE.Color('#1a0f08') }
    }
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, -8)
  scene.add(mesh)

  return {
    scene,
    camera,
    clearColor: 0x07070b,
    bloom: { strength: isMobile ? 0.22 : 0.34, radius: 0.65, threshold: 0.14 },
    update(elapsed, pointer) {
      // The waves travel continuously inside the shader (the `+ uTime` term),
      // so motion stays perfectly smooth without snapping the mesh position.
      material.uniforms.uTime.value = elapsed
      camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.05
      camera.position.y += (1.7 - pointer.y * 0.3 - camera.position.y) * 0.05
      camera.lookAt(0, 0.1, -6)
    },
    resize(w, h) {
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    }
  }
}
