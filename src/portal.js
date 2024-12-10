import * as THREE from 'three';

export function createNetherPortal() {
    // Frame Material
    const obsidianMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2f3b, roughness: 0.8 });

    // Portal Frame
    const frameThickness = 0.8;
    const frameHeight = 4;
    const frameWidth = 4;

    const frame = new THREE.Group();

    // Add vertical sides
    const leftSide = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), obsidianMaterial);
    leftSide.position.x = -((frameWidth - frameThickness) / 2);
    frame.add(leftSide);

    const rightSide = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), obsidianMaterial);
    rightSide.position.x = (frameWidth - frameThickness) / 2;
    frame.add(rightSide);

    // Add top and bottom
    const top = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), obsidianMaterial);
    top.position.y = frameHeight / 2;
    frame.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), obsidianMaterial);
    bottom.position.y = -(frameHeight / 2);
    frame.add(bottom);

    // Add purple portal
    const portal = createPortalEffect(frameWidth - frameThickness, frameHeight);
    frame.add(portal);

    // Create particle system for portal
    const particles = createPortalParticles(frameWidth - frameThickness, frameHeight);
    frame.add(particles);

    frame.position.y = 0.8;

    return frame;
}

function createPortalEffect(portalWidth, portalHeight) {
    const portalMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            float glow = abs(sin(time * 2.0 + uv.x * 10.0 + uv.y * 10.0));
            gl_FragColor = vec4(0.5 + 0.5 * glow, 0.1, 0.8 + 0.2 * glow, 1.0);
          }
        `
    });

    const portalPlane = new THREE.Mesh(new THREE.PlaneGeometry(portalWidth, portalHeight), portalMaterial);

    return portalPlane;
}

function createPortalParticles(portalWidth, portalHeight) {
    // Create geometry for the particles
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Create particle positions (random within portal width and height)
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = Math.random() * portalWidth - portalWidth / 2;  // X position
        positions[i * 3 + 1] = Math.random() * portalHeight - portalHeight / 2; // Y position
        positions[i * 3 + 2] = Math.random() * 0.2;  // Z position
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material for the particles
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x9b4dca,  // Purple color
        size: 0.05, // Size of each particle
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    // Create particle system
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);

    return particles;
}
