import * as THREE from "three";

export function initScene() {
  const canvas = document.querySelector("#webgl");
  const fallback = document.querySelector("#webgl-fallback");
  
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (e) {
    if (fallback) fallback.hidden = false;
    if (canvas) canvas.style.display = "none";
    return null;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04070e);
  scene.fog = new THREE.FogExp2(0x04070e, 0.032);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.8, 9);

  // Lighting setup for Data Center ambiance
  const ambientLight = new THREE.AmbientLight(0x0a1428, 1.8);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x00f0ff, 18, 30);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x10b981, 12, 25);
  rimLight.position.set(-4, 2, -4);
  scene.add(rimLight);

  const world = new THREE.Group();
  scene.add(world);

  // Raised Data Center Floor Tiles
  const floorGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050a14,
    metalness: 0.85,
    roughness: 0.45,
    wireframe: false
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  world.add(floor);

  // Floor Grid Lines
  const gridHelper = new THREE.GridHelper(60, 40, 0x0284c7, 0x0d203d);
  gridHelper.position.y = -1.19;
  world.add(gridHelper);

  // Server Racks Corridor Construction
  const rackMat = new THREE.MeshStandardMaterial({
    color: 0x09101d,
    metalness: 0.88,
    roughness: 0.32
  });
  const serverMat = new THREE.MeshStandardMaterial({
    color: 0x040810,
    metalness: 0.95,
    roughness: 0.2
  });

  const ledColors = [0x10b981, 0x00f0ff, 0xf59e0b, 0x10b981, 0x10b981];
  const leds = [];

  // Left and Right Server Aisle Rows
  const rackAisles = [-5.2, 5.2];
  for (const x of rackAisles) {
    for (let z = -24; z <= 8; z += 3.8) {
      // 42U Rack Enclosure
      const rack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.6, 2.2), rackMat);
      rack.position.set(x, 1.6, z);
      world.add(rack);

      // Rack Frame Rails
      const railMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
      const rackEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 5.6, 2.2)), railMat);
      rackEdges.position.copy(rack.position);
      world.add(rackEdges);

      // Server Units (1U / 2U blades)
      for (let y = -0.8; y <= 4.0; y += 0.52) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 2.05), serverMat);
        blade.position.set(x, y, z);
        world.add(blade);

        // Blinking Status LEDs on server front panel
        const facingZ = (x < 0) ? 0.95 : -0.95;
        const color = ledColors[Math.floor(Math.random() * ledColors.length)];
        const ledGeo = new THREE.SphereGeometry(0.028, 6, 6);
        const ledMat = new THREE.MeshBasicMaterial({ color });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.position.set(x + (x < 0 ? 0.72 : -0.72), y + 0.04, z + (Math.random() - 0.5) * 1.6);
        world.add(ledMesh);

        leds.push({
          mesh: ledMesh,
          baseColor: color,
          frequency: 1 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  // Overhead Fiber Optic Cable Trays & Traces
  const trayMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.3 });
  for (let x of [-3.8, 0, 3.8]) {
    const p1 = new THREE.Vector3(x, 4.2, -26);
    const p2 = new THREE.Vector3(x, 4.2, 10);
    const trayGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    world.add(new THREE.Line(trayGeo, trayMat));
  }

  // Floating Network Topology Constellation
  const topologyGroup = new THREE.Group();
  world.add(topologyGroup);

  const nodeCount = 28;
  const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const topologyNodes = [];

  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(
      (Math.random() - 0.5) * 12,
      1 + Math.random() * 3.5,
      (Math.random() - 0.5) * 26 - 2
    );
    topologyGroup.add(node);
    topologyNodes.push(node);
  }

  // Interconnected Network Mesh Traces
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15
  });

  for (let i = 0; i < topologyNodes.length; i++) {
    for (let j = i + 1; j < topologyNodes.length; j++) {
      const dist = topologyNodes[i].position.distanceTo(topologyNodes[j].position);
      if (dist < 4.2) {
        const linkGeo = new THREE.BufferGeometry().setFromPoints([
          topologyNodes[i].position,
          topologyNodes[j].position
        ]);
        topologyGroup.add(new THREE.Line(linkGeo, lineMat));
      }
    }
  }

  // Data Center Atmosphere Particle Field
  const particleCount = window.innerWidth < 768 ? 400 : 900;
  const pPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 22;
    pPos[i * 3 + 1] = Math.random() * 8 - 0.5;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 32 - 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.022,
    transparent: true,
    opacity: 0.45
  });
  const particles = new THREE.Points(pGeo, pMat);
  world.add(particles);

  // Resize Handler
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // Mouse Parallax & Scroll Integration
  const mouse = { x: 0, y: 0 };
  const targetCam = { x: 0, y: 1.8, z: 9, rx: 0 };

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.8;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function updateScrollCamera() {
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
    
    // Smooth camera progression down the data center aisle as user scrolls
    targetCam.z = 9 - progress * 24;
    targetCam.y = 1.8 + Math.sin(progress * Math.PI) * 0.4;
    targetCam.x = Math.sin(progress * Math.PI * 1.5) * 0.8;
  }
  window.addEventListener("scroll", updateScrollCamera, { passive: true });
  updateScrollCamera();

  // Animation Loop
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    // Blink server LEDs
    for (let i = 0; i < leds.length; i++) {
      const led = leds[i];
      const intensity = Math.sin(t * led.frequency + led.phase);
      led.mesh.visible = intensity > -0.2;
    }

    // Gently float network topology nodes
    for (let i = 0; i < topologyNodes.length; i++) {
      topologyNodes[i].position.y += Math.sin(t * 1.2 + i) * 0.001;
    }

    // Subtle drift on particles
    particles.rotation.y = t * 0.015;

    // Smooth camera lerp
    camera.position.x += (targetCam.x + mouse.x - camera.position.x) * 0.045;
    camera.position.y += (targetCam.y - mouse.y - camera.position.y) * 0.045;
    camera.position.z += (targetCam.z - camera.position.z) * 0.045;

    // Dynamic light pulsing
    keyLight.intensity = 16 + Math.sin(t * 1.8) * 3;
    rimLight.intensity = 10 + Math.cos(t * 1.5) * 2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return { scene, camera, renderer, world };
}
