import * as THREE from "three";

export function createPointLight() {
    const pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 0, 5);
    return pointLight;
}

export function createDirLight() {
    const dirLight = new THREE.DirectionalLight(0xa8a8a8, 1);
    dirLight.position.set(5, 5, 5);
    return dirLight;
}

export function createShadowLight() {
    // Create directional light for shadows
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.7);
    shadowLight.position.set(5, 10, 7);
    shadowLight.castShadow = true;

    // Configure shadow map
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 20;
    shadowLight.shadow.bias = -0.001;
    return shadowLight;
}