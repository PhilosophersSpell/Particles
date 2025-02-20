import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('./textures/particles/2.png');

/**
 * Particles
 */

// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 200000;

const positions = new Float32Array(count * 3); // 하나의 vertex(좌표) 당 x, y, z 3개가 필요하다. 그래서 3배수 해줌.
const colors = new Float32Array(count * 3); // R, G, B 3개로 구성

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    colors[i] = Math.random();
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material
const particleMaterial = new THREE.PointsMaterial({
    // color: '#ff88cc',
    size: 0.02,
    sizeAttenuation: true,
    alphaMap: particleTexture,
    transparent: true,
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true, // 각 점(Point)의 색상을 개별적으로 설정할 수 있도록 해준다. 
})

// Points
const particles = new THREE.Points(particlesGeometry, particleMaterial);

scene.add(particles);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update Particles
    // particles.rotation.y = - elapsedTime * 0.02

    // 각각의 particle 을 움직이게하기. 좋은 아이디어는 아니라고 한다. 리소스 엄청 잡아먹나봄. 추후에 적절한 방법이 나온다. 
    for (let i = 0; i < count; i++) {
        const i3 = i * 3; // 모든 x, y, z 를 하나의 row 처럼 접근 가능하다. i3 가 x, i3 + 1 이 y, i3 + 2 가 z 를 나타낸다.

        const x = particlesGeometry.attributes.position.array[i3];
        const z = particlesGeometry.attributes.position.array[i3 + 2];
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x + z); // Math.sin(time + offset)과 같은 방식으로 입자들의 움직임을 조절하면 더 자연스러운 파도나 물결 같은 애니메이션을 만들 수 있다. z까지 더해서 더 입체적인 모양을 줘봤다. 
    }

    particlesGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()