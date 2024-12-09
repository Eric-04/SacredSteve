import * as THREE from 'three';

export function createRoom() {
    const roomWidth = 14;
    const roomHeight = 14;
    const roomDepth = 20;

    // Load the bump map texture
    const textureMap = new THREE.TextureLoader().load('smaller.png');
    textureMap.wrapS = THREE.RepeatWrapping;
    textureMap.wrapT = THREE.RepeatWrapping;
    textureMap.minFilter = THREE.LinearFilter;
    textureMap.magFilter = THREE.LinearFilter;

    // Create the front and back wall materials without bump map
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xAAAAAA, // Base color for the wall
        side: THREE.FrontSide,
    });

    // Create front wall
    const frontWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.z = roomDepth / 2;
    frontWall.rotation.y = Math.PI;

    // Create back wall
    const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -roomDepth / 2;

    // Create left wall geometry
    const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
    // applyDisplacement(leftWallGeometry, textureMap, 2);  // Apply the bump map manually to the left wall

    // Create left wall mesh with the manually modified geometry
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -roomWidth / 2;
    leftWall.rotation.y = Math.PI / 2;

    // Create right wall geometry
    const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
    // applyDisplacement(rightWallGeometry, textureMap, 2);  // Apply the bump map manually to the right wall

    // Create right wall mesh with the manually modified geometry
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.x = roomWidth / 2;
    rightWall.rotation.y = -Math.PI / 2;

    // Create floor
    const floorMaterial = new THREE.MeshStandardMaterial({color: 0x555555});
        
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight / 2 + 0.01; 

    // Calculate how much we need to shift everything so the floor is at y = -2
    const floorCurrentPositionY = floor.position.y;
    const shiftAmount = - 2 - floorCurrentPositionY;

    // Apply the shift to all objects
    frontWall.position.y += shiftAmount;
    backWall.position.y += shiftAmount;
    leftWall.position.y += shiftAmount;
    rightWall.position.y += shiftAmount;
    floor.position.y += shiftAmount;

    // Create the pillars lined by left and right walls
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, roomHeight, 32);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    // Create a group for the pillars
    const pillarGroup = new THREE.Group();

    // Position 3 pillars on the left wall, 1 units away from the wall
    for (let i = 0; i < 3; i++) {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.x = -roomWidth / 2 + 1.5; 
        pillar.position.y += shiftAmount; 
        pillar.position.z = roomDepth / 3 * (i + 1) - (roomDepth / 2 + 3.5); 
        pillarGroup.add(pillar);
    }

    // Position 3 pillars on the right wall, 1 units away from the wall
    for (let i = 0; i < 3; i++) {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.x = roomWidth / 2 - 1.5; 
        pillar.position.y += shiftAmount; 
        pillar.position.z = roomDepth / 3 * (i + 1) - (roomDepth / 2 + 3.5);
        pillarGroup.add(pillar);
    }

    // Create the tall windows
    const windowGeometry = new THREE.PlaneGeometry(3, 7); 
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });

    // add windows on the front wall
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-4, 2.5, frontWall.position.z - 0.01); 

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(4, 2.5, frontWall.position.z - 0.01); 

    // add windows on the back wall
    const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
    window3.position.set(-4, 2.5, backWall.position.z + 0.01); 

    // add windows on the back wall
    const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
    window4.position.set(4, 2.5, backWall.position.z + 0.01); 

    // Create the wide windows
    const windowGeometry2 = new THREE.PlaneGeometry(6, 3); 
    const windowMaterial2 = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF99, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });

    const longwindow1 = new THREE.Mesh(windowGeometry2, windowMaterial2);
    longwindow1.position.set(0, 8.5, backWall.position.z + 0.01)

    const longwindow2 = new THREE.Mesh(windowGeometry2, windowMaterial2);
    longwindow2.position.set(0, 8.5, frontWall.position.z - 0.01)

    // Create the room group and add all parts
    const roomGroup = new THREE.Group();
    roomGroup.add(frontWall);
    roomGroup.add(backWall);
    roomGroup.add(leftWall);
    roomGroup.add(rightWall);
    roomGroup.add(floor);
    roomGroup.add(pillarGroup);
    roomGroup.add(window1);
    roomGroup.add(window2);
    roomGroup.add(window3);
    roomGroup.add(window4);
    roomGroup.add(longwindow1);
    roomGroup.add(longwindow2);

    // Create spotlights coming from the wide windows
    const spotlight1 = new THREE.SpotLight(0xFFFFFF, 1, 20, Math.PI / 4, 0.5, 1);
    spotlight1.position.set(0, 8, backWall.position.z + 0.01); 
    spotlight1.target.position.set(0, floor.position.y + 0.01, 0); // Target the center of the floor
    spotlight1.castShadow = true;

    const spotlight2 = new THREE.SpotLight(0xFFFFFF, 1, 20, Math.PI / 4, 0.5, 1);
    spotlight2.position.set(0, 8, frontWall.position.z - 0.01); 
    spotlight2.target.position.set(0, floor.position.y + 0.01, 0); // Target the center of the floor
    spotlight2.castShadow = true;

    // Add the spotlights to the room
    roomGroup.add(spotlight1);
    roomGroup.add(spotlight2);
    roomGroup.add(spotlight1.target);
    roomGroup.add(spotlight2.target);

    return roomGroup;
}

function applyDisplacement(geometry, texture, repeat) {
    const vertices = geometry.attributes.position.array;
    const width = texture.image.width;
    const height = texture.image.height;

    // Loop through each vertex
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];    // X position of vertex
        const y = vertices[i + 1];  // Y position of vertex
        const z = vertices[i + 2];  // Z position of vertex

        // Map the vertex's x and y position to the texture coordinates
        const u = (x / (geometry.parameters.width / repeat)) * width;
        const v = (y / (geometry.parameters.height / repeat)) * height;

        // Get the bump value from the texture (grayscale value)
        const bumpValue = texture.image.getImageData(u, v, 1, 1).data[0] / 255;

        // Apply displacement based on the bump value (higher bumpScale = stronger bump effect)
        const bumpScale = 0.5; // displacement factor
        vertices[i + 2] = z + bumpValue * bumpScale; // Modify the Z position
    }

    geometry.attributes.position.needsUpdate = true;  // Mark the geometry as needing an update
}