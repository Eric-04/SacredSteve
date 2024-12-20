import * as THREE from 'three';

export function createMinecraftSteve() {
    const steve = new THREE.Group();

    const headColor = 0xccad9f;
    const bodyColor = 0x5187b8;
    const legColor = 0x3c3c3c;

    // Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMat = new THREE.MeshStandardMaterial({ color: headColor });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    steve.add(head);

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.57, 0.84, 0.3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    steve.add(body);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const armMat = new THREE.MeshStandardMaterial({ color: headColor });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.45, 1.1, 0);
    steve.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.45, 1.1, 0);
    steve.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.72, 0.3);
    const legMat = new THREE.MeshStandardMaterial({ color: legColor });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.15, 0.41, 0);
    steve.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.15, 0.41, 0);
    steve.add(rightLeg);

    return steve;
}
