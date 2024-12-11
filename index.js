import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoom } from './src/room.js';
import { createMinecraftSteve } from './src/steve/create-steve.js';
import { setupKeyControls, updateSteveMovement } from './src/steve/animate-steve.js';
import { createNetherPortal } from "./src/portal.js";
import { createWalls } from "./src/texture-walls.js";
import { ParticleSystem } from "./src/snow-particles/snowParticles.js";
import { NetherParticleSystem } from "./src/nether-particles/netherParticles.js";
import { applyReceiveShadow, applyCastShadow, createCustomShadowShader } from './src/shadowmap.js';
import { createPointLight, createDirLight, createShadowLight } from "./src/lights.js";


import { createCrepuscularRaysPass } from "./src/godRays.js";

// THREE.js needs 3 things
// 1. renderer
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
// configure renderer for shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 2. camera
const fov = 75; // degrees
const aspect = w / h;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2; // Move the camera back to see particles clearly

// 3. scene
const scene = new THREE.Scene();

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Set rotation limits
controls.minPolarAngle = Math.PI / 6; // Look slightly downwards
controls.maxPolarAngle = Math.PI / 2; // Prevent flipping upside-down

// Restrict zoom range
controls.minDistance = 1; // Minimum distance to the room
controls.maxDistance = 10; // Maximum zoom-out distance

// Pan limits (optional)
controls.enablePan = true;
const panLimit = 2.5; // Limit how far the camera can pan
controls.screenSpacePanning = false; // Panning will use a fixed plane

// Adjust zoom speed
controls.zoomSpeed = 0.8;

// Add room
const room = createRoom();
scene.add(room);

// Add displacement mapped walls
const walls = createWalls();
scene.add(walls);

// Add Steve
const steve = createMinecraftSteve();
steve.position.set(0, -2, 0); // Place Steve on the floor
scene.add(steve);


// Add nether portal
// const portal = createNetherPortal();
// portal.position.z = -4;
// scene.add(portal);

// Add lights
const pointLight = createPointLight();
const dirLight = createDirLight();
const shadowLight = createShadowLight();
scene.add(pointLight);
scene.add(dirLight);
scene.add(shadowLight);
window.lights = [pointLight, dirLight, shadowLight];


// Key controls
const keys = { forward: false, backward: false, left: false, right: false, jump: false };
setupKeyControls(keys);


// Particle system setup (snow)
const snowParticleSystem = new ParticleSystem(scene, 200, 10, 10, 20, -2);  // Adjusted spread for 3D distribution
const netherParticleSystem = new NetherParticleSystem(scene, 100, 2, 5, 8, -2);  // Adjusted spread for 3D distribution

// In your scene setup
const { createShadowMaterial } = createCustomShadowShader();

const objectsToReceiveShadow = [room.children[2]];
const objectsCastingShadow = [].concat(steve.children);

applyReceiveShadow(objectsToReceiveShadow);
applyCastShadow(objectsCastingShadow, createShadowMaterial, dirLight);


const crepuscularRays = createCrepuscularRaysPass(scene, camera, renderer);

function animate(t = 0) {
    const deltaTime = 0.016; // Approximate frame time for 60 FPS
    requestAnimationFrame(animate);
    
    // Update particle system (snow)
    snowParticleSystem.update(deltaTime);
    netherParticleSystem.update(deltaTime);

    // Update Steve's movement based on key presses
    updateSteveMovement(steve, keys, deltaTime, t);

    // Render the scene normally first
    renderer.render(scene, camera);

    // Then apply crepuscular rays
    crepuscularRays.render(scene, camera, renderer);
    
    controls.update();
}

animate();
