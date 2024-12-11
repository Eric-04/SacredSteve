import * as THREE from "three";

export function createPointLight(x, y, z) {
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(x, y, z);
    return pointLight;
}


export function createDirLight(x, y, z) {
    const dirLight = new THREE.DirectionalLight(0xa8a8a8, 5);
    dirLight.position.set(x, y, z);
    return dirLight;
}

export function createShadowLight() {
    // Create directional light for shadows
    const shadowLight = new THREE.DirectionalLight(0xffffff, 1.5);
    shadowLight.position.set(5, 10, -7);
    shadowLight.castShadow = true;

    // Configure shadow map
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 20;
    shadowLight.shadow.bias = -0.001;
    return shadowLight;
}

export function changeShadowLightPosition(shadowLight, x, y, z) {
    shadowLight.position.set(x, y, z);
}