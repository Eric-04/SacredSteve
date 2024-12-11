import * as THREE from 'three';

export function createRoom() {
    const roomWidth = 14.5;
    const roomHeight = 16;
    const roomDepth = 20;

    // Create the front and back wall materials without bump map
    const wall_text = new THREE.TextureLoader().load('/mural_wall_text.png');
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x8c8c89,
        side: THREE.FrontSide,
        map: wall_text
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
    const floor_texture = new THREE.TextureLoader().load('/floor_gradient.png');
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
    const stain_glass_texture3 = new THREE.TextureLoader().load('/tall_mosaic.png');


    const leftStainWIndow = new THREE.MeshBasicMaterial({ 
        color: 0xe6e8be, 
        transparent: true, 
        opacity: 0.9,
        side: THREE.DoubleSide, 
        map: stain_glass_texture1
    });

    const rightStainWIndow = new THREE.MeshBasicMaterial({ 
        color: 0xe6e8be, 
        transparent: true, 
        opacity: 0.9,
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

    const tallWindowGeometry = new THREE.PlaneGeometry(3.2, 8); 
    const tallWindowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xedffbf,
        transparent: true, 
        opacity: 0.8,
        map: stain_glass_texture3,
        side: THREE.DoubleSide 
    });

    const window5 = new THREE.Mesh(tallWindowGeometry, tallWindowMaterial);
    window5.position.set(0, 3.5, frontWall.position.z - 0.01); 
console.log(frontWall.position);
    const window6 = new THREE.Mesh(tallWindowGeometry, tallWindowMaterial);
    window6.position.set(0, 3.5, backWall.position.z + 0.01); 

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

    return roomGroup;
}