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

window.cameraPos = camera.position;


// Add Steve
const steve = createMinecraftSteve();
steve.position.set(0, -2, 0); // Place Steve on the floor
scene.add(steve);


// Add nether portal
const portal = createNetherPortal();
portal.position.z = -5;
scene.add(portal);

// Add lights
const pointLight = createPointLight(0, 0, 5);
// const pointLight2 = createPointLight(-2, 0, 2);
const dirLight = createDirLight(0, 5, 5);

const dirLight6 = createDirLight(0, 0, 2);

const shadowLight = createShadowLight();
scene.add(pointLight);

scene.add(dirLight);


scene.add(dirLight6);

scene.add(shadowLight);
window.lights = [pointLight, dirLight, dirLight6, shadowLight];


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

// Track whether god rays are enabled
let godRaysEnabled = true;

// Create a toggle button
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle God Rays';
toggleButton.style.position = 'absolute';
toggleButton.style.top = '10px';
toggleButton.style.left = '10px';
toggleButton.style.padding = '10px';
toggleButton.style.backgroundColor = '#333';
toggleButton.style.color = '#fff';
toggleButton.style.border = 'none';
toggleButton.style.cursor = 'pointer';

// Add the button to the DOM
document.body.appendChild(toggleButton);

// Add an event listener to the button
toggleButton.addEventListener('click', () => {
    godRaysEnabled = !godRaysEnabled;
    toggleButton.textContent = godRaysEnabled ? 'Disable God Rays' : 'Enable God Rays';
});

// Animation loop
function animate(t = 0) {
    const deltaTime = 0.016; // Approximate frame time for 60 FPS
    requestAnimationFrame(animate);

    // Add displacement mapped walls
    const walls = createWalls();
    scene.add(walls);

    // Update particle system (snow)
    snowParticleSystem.update(deltaTime);
    netherParticleSystem.update(deltaTime);

    // Update Steve's movement based on key presses
    updateSteveMovement(steve, keys, deltaTime, t);

    renderer.render(scene, camera);

    // Conditionally apply crepuscular rays
    if (godRaysEnabled) {
        crepuscularRays.render(scene, camera, renderer);
    }
    
    controls.update();
}

animate();

