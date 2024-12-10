import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoom } from './src/room.js';
import { createMinecraftSteve } from './src/steve/create-steve.js';
import { setupKeyControls, updateSteveMovement } from './src/steve/animate-steve.js';

// THREE.js needs 3 things
// 1. renderer
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// 2. camera
const fov = 75; // degrees
const aspect = w / h;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2; // moves the camera back a little bit

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

// Add Steve
const steve = createMinecraftSteve();
steve.position.set(0, -2, 0); // Place Steve on the floor
scene.add(steve);

// Add lights
const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500, 0.8);
scene.add(hemiLight);

const pointLight = new THREE.PointLight(0xffffff, 0.6);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

// Key controls
const keys = { forward: false, backward: false, left: false, right: false, jump: false };
setupKeyControls(keys);

function animate(t = 0) {
    const deltaTime = 0.016; // Approximate frame time for 60 FPS
    requestAnimationFrame(animate);
    // mesh.rotation.y = t * 0.001;
    updateSteveMovement(steve, keys, deltaTime, t);
    renderer.render(scene, camera);
    controls.update();
}
animate();