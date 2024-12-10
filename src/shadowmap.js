import * as THREE from 'three';

export function createCustomShadowShader() {
    // Vertex Shader for Shadow Mapping
    const vertexShader = `
        uniform mat4 shadowMatrix;
        varying vec4 shadowCoord;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            // Transform vertex to world space
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            
            // Transform normal to world space
            vNormal = normalize(normalMatrix * normal);
            
            // Calculate shadow coordinates
            shadowCoord = shadowMatrix * vec4(vWorldPosition, 1.0);
            
            // Standard vertex transformation
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Fragment Shader for Shadow Mapping
    const fragmentShader = `
        uniform sampler2D shadowMap;
        uniform vec3 lightPosition;
        uniform float shadowBias;
        uniform vec3 objectColor;

        varying vec4 shadowCoord;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        float calculateShadow(sampler2D shadowMap, vec4 shadowCoord, float bias) {
            // Perspective divide and normalize shadow coordinates
            vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
            projCoords = projCoords * 0.5 + 0.5;

            // Check if fragment is within shadow map bounds
            if (projCoords.z > 1.0 || 
                projCoords.x < 0.0 || projCoords.x > 1.0 ||
                projCoords.y < 0.0 || projCoords.y > 1.0) {
                return 1.0;
            }

            // Sample shadow map
            float closestDepth = texture2D(shadowMap, projCoords.xy).r;
            float currentDepth = projCoords.z;

            // Shadow calculation with soft edges
            float shadow = 0.0;
            vec2 texelSize = vec2(1.0 / 2048.0, 1.0 / 2048.0);
            for(int x = -1; x <= 1; ++x) {
                for(int y = -1; y <= 1; ++y) {
                    float pcfDepth = texture2D(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
                    shadow += currentDepth - bias > pcfDepth ? 0.3 : 1.0;
                }
            }
            shadow /= 9.0;

            return shadow;
        }

        void main() {
            // Basic lighting calculation
            vec3 lightDir = normalize(lightPosition - vWorldPosition);
            float diffuse = max(dot(vNormal, lightDir), 0.0);

            // Calculate shadow
            // float shadow = calculateShadow(shadowMap, shadowCoord, 0.005);
            float shadow = 1.0;

            // Combine color, lighting, and shadow
            vec3 finalColor = objectColor * diffuse * shadow;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Create a custom shadow material generator
    function createShadowMaterial(originalMaterial, shadowLight) {
        return new THREE.ShaderMaterial({
            uniforms: {
                shadowMap: { value: shadowLight.shadow.map },
                shadowMatrix: { value: shadowLight.shadow.matrix },
                lightPosition: { value: shadowLight.position },
                shadowBias: { value: 0.005 },
                objectColor: { value: new THREE.Color(originalMaterial.color || 0x888888) }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true
        });
    }

    return {
        createShadowMaterial
    };
}

export function applyReceiveShadow(object) {
    object.forEach((child) => {
        child.receiveShadow = true;
    });
};

export function applyCastShadow (object, createShadowMaterial, shadowLight) {
    object.forEach((child) => {
        if (child.isMesh) {
            // Store original material to restore later if needed
            child.userData.originalMaterial = child.material;
            
            // Create and apply custom shadow material
            const shadowMaterial = createShadowMaterial(child.material, shadowLight);
            child.material = shadowMaterial;
            
            child.castShadow = true;
        }
    });
}