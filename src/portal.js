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
    const portalMaterial = new THREE.MeshStandardMaterial({
        color: 0x7833AE, // Base color for the wall
        side: THREE.FrontSide,
    });
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(frameWidth-frameThickness, frameHeight), portalMaterial);
    frame.add(portal);

    frame.position.y = 0.8;

    return frame;
}