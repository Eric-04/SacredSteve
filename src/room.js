import * as THREE from 'three';

export function createRoom() {
    const roomWidth = 10;
    const roomHeight = 6;
    const roomDepth = 10;

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.BackSide });

    // Create the room
    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
    const room = new THREE.Mesh(roomGeometry, wallMaterial);

    // Create the floor
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight / 2 + 0.01; // Slightly lift the floor to avoid z-fighting

    const roomGroup = new THREE.Group();
    roomGroup.add(room);
    roomGroup.add(floor);

    return roomGroup;
}