import * as THREE from 'three';

export function setupShadowMapping(scene, renderer) {
    // Light camera setup
    const lightPosition = new THREE.Vector3(5, 10, 5);
    const lightCamera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.5, 50);
    lightCamera.position.copy(lightPosition);
    lightCamera.lookAt(0, 0, 0);
    scene.add(lightCamera);

    // Shadow map render target
    const shadowMap = new THREE.WebGLRenderTarget(1024, 1024);
    shadowMap.texture.format = THREE.RGBAFormat;
    shadowMap.texture.minFilter = THREE.NearestFilter;
    shadowMap.texture.magFilter = THREE.NearestFilter;
    shadowMap.texture.generateMipmaps = false;
    shadowMap.depthTexture = new THREE.DepthTexture();
    shadowMap.depthTexture.type = THREE.UnsignedShortType;

    // Custom shaders
    const shadowMapVertexShader = `
        varying vec4 vPositionLightSpace;

        void main() {
            vPositionLightSpace = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = vPositionLightSpace;
        }
    `;

    const shadowMapFragmentShader = `
        varying vec4 vPositionLightSpace;

        void main() {
            float depth = vPositionLightSpace.z / vPositionLightSpace.w;
            gl_FragColor = vec4(vec3(depth), 1.0);
        }
    `;

    const shadowMaterial = new THREE.ShaderMaterial({
        vertexShader: shadowMapVertexShader,
        fragmentShader: shadowMapFragmentShader,
    });

    const sceneFragmentShader = `
        varying vec4 vPositionLightSpace;

        uniform sampler2D shadowMap;

        void main() {
            vec3 projCoords = vPositionLightSpace.xyz / vPositionLightSpace.w;
            projCoords = projCoords * 0.5 + 0.5;

            float shadowMapDepth = texture2D(shadowMap, projCoords.xy).r;
            float shadow = projCoords.z > shadowMapDepth + 0.005 ? 0.5 : 1.0;

            gl_FragColor = vec4(vec3(shadow), 1.0);
        }
    `;

    const sceneMaterial = new THREE.ShaderMaterial({
        vertexShader: shadowMapVertexShader,
        fragmentShader: sceneFragmentShader,
        uniforms: {
            shadowMap: { value: shadowMap.depthTexture },
        },
    });

    // // Assign materials
    // plane.receiveShadow = true;
    // plane.material = sceneMaterial;

    // cube.castShadow = true;
    // cube.material = sceneMaterial;

    // Update shadow matrix (static)
    const lightMatrix = lightCamera.projectionMatrix.clone().multiply(lightCamera.matrixWorldInverse);

    function updateShadowMatrix() {
        // Only update uniforms, not the camera
        sceneMaterial.uniforms.lightMatrix = { value: lightMatrix };
    }

    return { lightCamera, shadowMaterial, sceneMaterial, shadowMap, updateShadowMatrix};
}

export function renderShadowMap(scene, renderer, lightCamera, shadowMap, shadowMaterial) {
    scene.overrideMaterial = shadowMaterial;
    renderer.setRenderTarget(shadowMap);
    renderer.render(scene, lightCamera);
    renderer.setRenderTarget(null);
    scene.overrideMaterial = null;
}
