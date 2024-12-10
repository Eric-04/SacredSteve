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
    leftSide.position.x = -((frameWidth-frameThickness) / 2);
    frame.add(leftSide);

    const rightSide = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameHeight, frameThickness), obsidianMaterial);
    rightSide.position.x = (frameWidth-frameThickness) / 2;
    frame.add(rightSide);

    // Add top and bottom
    const top = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), obsidianMaterial);
    top.position.y = frameHeight / 2;
    frame.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameThickness, frameThickness), obsidianMaterial);
    bottom.position.y = -(frameHeight / 2);
    frame.add(bottom);

    // Add purple portal
    const portal = createPortalEffect(frameWidth-frameThickness, frameHeight);
    frame.add(portal);

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