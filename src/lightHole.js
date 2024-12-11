import * as THREE from 'three';

export function createLightHole(scene) {
    // Create a geometry for the light hole
    const holeGeometry = new THREE.PlaneGeometry(1, 1);
    
    // Create a material that's slightly emissive to enhance the ray effect
    const holeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    // Create the hole mesh
    const lightHole = new THREE.Mesh(holeGeometry, holeMaterial);
    
    // Position the hole - adjust these coordinates to fit your room
    lightHole.position.set(0, 2, -3.9); // Near the wall, slightly inset
    lightHole.rotation.y = Math.PI; // Face inwards
    
    // Create a point light positioned at the same location
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.copy(lightHole.position);
    
    // Add both to the scene
    scene.add(lightHole);
    scene.add(pointLight);
    
    return {
        hole: lightHole,
        light: pointLight
    };
}