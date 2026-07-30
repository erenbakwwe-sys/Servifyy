// Three.js 3D WebGL Canvas Scene & Interactive Medallion Viewer
import * as THREE from 'three';

let scene, camera, renderer, medallionMesh, dustParticles;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// Secondary 3D viewer instance for Modal
let modalScene, modalCamera, modalRenderer, modalMesh, modalAnimationId;

export function initThreeBackgroundCanvas() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // 1. Create Scene & Camera
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0A0F18, 0.02);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  // 2. Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // 3. Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xF3E5AB, 3.5);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);

  const goldPointLight = new THREE.PointLight(0xD4AF37, 4, 15);
  goldPointLight.position.set(-3, 2, 3);
  scene.add(goldPointLight);

  const rimLight = new THREE.PointLight(0x40E0D0, 2, 10);
  rimLight.position.set(3, -3, 2);
  scene.add(rimLight);

  // 4. Create Luxury 3D Monogram Medallion (Old Money Crest)
  const group = new THREE.Group();

  // Outer Gold Ring
  const ringGeo = new THREE.TorusGeometry(1.8, 0.08, 32, 100);
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 2.0
  });
  const ringMesh = new THREE.Mesh(ringGeo, goldMaterial);
  group.add(ringMesh);

  // Inner Crest Plate
  const discGeo = new THREE.CylinderGeometry(1.68, 1.68, 0.08, 64);
  const darkGoldMat = new THREE.MeshStandardMaterial({
    color: 0x121A28,
    metalness: 0.8,
    roughness: 0.3
  });
  const discMesh = new THREE.Mesh(discGeo, darkGoldMat);
  discMesh.rotation.x = Math.PI / 2;
  group.add(discMesh);

  // Decorative Inner Crown Nodes
  const nodeCount = 12;
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
    const nodeMesh = new THREE.Mesh(nodeGeo, goldMaterial);
    nodeMesh.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0.06);
    group.add(nodeMesh);
  }

  // Center Emblem Octahedron Gem
  const gemGeo = new THREE.OctahedronGeometry(0.65, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xE5C158,
    metalness: 0.98,
    roughness: 0.08
  });
  const gemMesh = new THREE.Mesh(gemGeo, gemMat);
  gemMesh.position.z = 0.2;
  group.add(gemMesh);

  medallionMesh = group;
  medallionMesh.position.set(2.4, 0.2, 0);
  scene.add(medallionMesh);

  // 5. Ambient Gold Floating Particles
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 16;
    particlePositions[i + 1] = (Math.random() - 0.5) * 16;
    particlePositions[i + 2] = (Math.random() - 0.5) * 10;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xF3E5AB,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  dustParticles = new THREE.Points(particleGeo, particleMat);
  scene.add(dustParticles);

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll);

  // Start Animation Loop
  animate();
}

function onMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onScroll() {
  const scrollY = window.scrollY;
  if (medallionMesh) {
    medallionMesh.rotation.z = scrollY * 0.001;
    medallionMesh.position.y = 0.2 - scrollY * 0.0008;
  }
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  if (medallionMesh) {
    medallionMesh.rotation.y += 0.006;
    medallionMesh.rotation.x = targetY * 0.4;
    medallionMesh.rotation.z = targetX * 0.3;
  }

  if (dustParticles) {
    dustParticles.rotation.y += 0.001;
  }

  renderer.render(scene, camera);
}

// Dedicated Interactive 3D Modal Viewer
export function init3DModalViewer() {
  const container = document.getElementById('threed-viewer-container');
  if (!container) return;

  container.innerHTML = '<div class="threed-instructions"><span><i class="fa-solid fa-arrows-spin"></i> Ziehen zum Drehen</span></div>';

  modalScene = new THREE.Scene();
  modalCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  modalCamera.position.set(0, 0, 5);

  modalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  modalRenderer.setSize(container.clientWidth, container.clientHeight);
  modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(modalRenderer.domElement);

  // Lighting
  const light1 = new THREE.DirectionalLight(0xffffff, 2.5);
  light1.position.set(5, 5, 5);
  modalScene.add(light1);

  const light2 = new THREE.PointLight(0xD4AF37, 3, 10);
  light2.position.set(-3, -2, 3);
  modalScene.add(light2);

  // Create Detailed Gold Medallion for Modal
  const group = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(1.4, 0.12, 32, 100);
  const mat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.1 });
  group.add(new THREE.Mesh(ringGeo, mat));

  const centerGeo = new THREE.IcosahedronGeometry(0.8, 0);
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xF3E5AB, metalness: 0.98, roughness: 0.05 });
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  group.add(centerMesh);

  modalMesh = group;
  modalScene.add(modalMesh);

  // Drag rotation interaction
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;

  const dom = modalRenderer.domElement;
  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  dom.addEventListener('mousemove', (e) => {
    if (!isDragging || !modalMesh) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    modalMesh.rotation.y += deltaX * 0.01;
    modalMesh.rotation.x += deltaY * 0.01;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  function renderModal() {
    modalAnimationId = requestAnimationFrame(renderModal);
    if (!isDragging && modalMesh) {
      modalMesh.rotation.y += 0.005;
    }
    modalRenderer.render(modalScene, modalCamera);
  }
  renderModal();
}

export function cleanup3DModalViewer() {
  if (modalAnimationId) cancelAnimationFrame(modalAnimationId);
  if (modalRenderer) {
    modalRenderer.dispose();
    modalRenderer = null;
  }
}
