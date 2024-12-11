import * as THREE from "three";

export function createPointLight(x, y, z) {
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(x, y, z);
    pointLight.castShadow = true;
    return pointLight;
}

export function createSpotLight(x,y,z) {
    const spotLight = new THREE.SpotLight(0x738beb, 25);
    spotLight.target.position.set(x, y - 10, z)
    spotLight.position.set(x,y,z);
    spotLight.castShadow = true;
    return spotLight;
}

export function createSpotLight2(x,y,z) {
    const spotLight = new THREE.SpotLight(0xd3fc95, 8);
    spotLight.target.position.set(x, y - 15, z)
    spotLight.position.set(x,y,z);
    return spotLight;
}

export function createDirLight(x, y, z) {
    const dirLight = new THREE.DirectionalLight(0x9798ad, .5);
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