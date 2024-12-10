import * as THREE from 'three';

export function createRoom() {
    const roomWidth = 14;
    const roomHeight = 14;
    const roomDepth = 20;

    // Create the front and back wall materials without bump map
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0xAAAAAA,
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

    // Create floor
    const floor_texture = new THREE.TextureLoader().load('/floor texture.png');
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xAAAAAA, 
        map: floor_texture
    });
        
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight / 2 + 0.01;

    // Calculate how much we need to shift everything so the floor is at y = -2
    const floorCurrentPositionY = floor.position.y;
    const shiftAmount = - 2 - floorCurrentPositionY;

    // Create the tall windows
    const windowGeometry = new THREE.PlaneGeometry(3, 6.5); 
    const stain_glass_texture1 = new THREE.TextureLoader().load('/steve_mosaic_left.png');
    const stain_glass_texture2 = new THREE.TextureLoader().load('/steve_mosaic_right.png');

    const leftStainWIndow = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide, 
        map: stain_glass_texture1
    });

    const rightStainWIndow = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide, 
        map: stain_glass_texture2
    });

    const window1 = new THREE.Mesh(windowGeometry, rightStainWIndow);
    window1.position.set(-4, 2.5, frontWall.position.z - 0.01); 

    const window2 = new THREE.Mesh(windowGeometry, leftStainWIndow);
    window2.position.set(4, 2.5, frontWall.position.z - 0.01); 

    const window3 = new THREE.Mesh(windowGeometry, rightStainWIndow);
    window3.position.set(-4, 2.5, backWall.position.z + 0.01); 

    const window4 = new THREE.Mesh(windowGeometry, leftStainWIndow);
    window4.position.set(4, 2.5, backWall.position.z + 0.01); 

    const tallWindowGeometry = new THREE.PlaneGeometry(3, 8); 
    const tallWindowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });

    const window5 = new THREE.Mesh(tallWindowGeometry, tallWindowMaterial);
    window5.position.set(0, 3, frontWall.position.z + 0.01); 

    const window6 = new THREE.Mesh(tallWindowGeometry, tallWindowMaterial);
    window6.position.set(0, 3, backWall.position.z + 0.01); 

    // Create the wide windows
    const windowGeometry2 = new THREE.PlaneGeometry(9, 3); 
    const windowMaterial2 = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF99, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide 
    });

    const longwindow1 = new THREE.Mesh(windowGeometry2, windowMaterial2);
    longwindow1.position.set(0, 9.5, backWall.position.z + 0.01)

    const longwindow2 = new THREE.Mesh(windowGeometry2, windowMaterial2);
    longwindow2.position.set(0, 9.5, frontWall.position.z - 0.01)

        // Apply the shift to all objects
        frontWall.position.y += shiftAmount;
        backWall.position.y += shiftAmount;
        floor.position.y += shiftAmount;
        
        // Create the room group and add all parts
        const roomGroup = new THREE.Group();
        roomGroup.add(frontWall);
        roomGroup.add(backWall);
        roomGroup.add(floor);
        roomGroup.add(window1);
        roomGroup.add(window2);
        roomGroup.add(window3);
        roomGroup.add(window4);
        roomGroup.add(window5);
        roomGroup.add(window6);
        roomGroup.add(longwindow1);
        roomGroup.add(longwindow2);

    return roomGroup;
}