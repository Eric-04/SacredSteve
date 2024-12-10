import * as THREE from 'three';

export function createWalls() {
    const roomWidth = 14;
    const roomHeight = 14;
    const roomDepth = 20;

    // Load the texture map and bump map
    const bump_map = new THREE.TextureLoader().load('/bump_mapping.png');
    const text_map = new THREE.TextureLoader().load('/wall_texture.png');
    
    // Create spotlights
    const spotlight1 = new THREE.SpotLight(0xFFFFFF, 1, 20, Math.PI / 4, 0.5, 1);
    spotlight1.position.set(0, 8, 10 + 0.01); 
    spotlight1.target.position.set(0, -6.99 + 0.01, 0); // Target the center of the floor
    spotlight1.castShadow = true;

    const spotlight2 = new THREE.SpotLight(0xFFFFFF, 1, 20, Math.PI / 4, 0.5, 1);
    spotlight2.position.set(0, 8, -10 - 0.01); 
    spotlight2.target.position.set(0, -6.99 + 0.01, 0); // Target the center of the floor
    spotlight2.castShadow = true;

    const lightPositions = [];
    const lightColors = [];
    const lightIntensities = [];
    lightPositions.push(spotlight1.position);
    lightPositions.push(spotlight2.position);
    lightColors.push(spotlight1.color);
    lightColors.push(spotlight2.color);
    lightIntensities.push(spotlight1.intensity);
    lightIntensities.push(spotlight2.intensity);

    const textureWallMaterial = applyDisplacement(bump_map, text_map, 1.2);

    // Create left wall geometry
    const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight, 250, 150);
    const leftWall = new THREE.Mesh(leftWallGeometry, textureWallMaterial);
    leftWall.position.x = -roomWidth / 2 - 0.4;
    leftWall.rotation.y = Math.PI / 2;

    // Create right wall geometry
    const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight, 250, 150);
    const rightWall = new THREE.Mesh(rightWallGeometry, textureWallMaterial);
    rightWall.position.x = roomWidth / 2 + 0.4;
    rightWall.rotation.y = -Math.PI / 2;

    // Apply the shift to all objects
    const shiftAmount = 4.99;
    leftWall.position.y += shiftAmount;
    rightWall.position.y += shiftAmount;

    // Create the room group and add all parts
    const roomGroup = new THREE.Group();
    roomGroup.add(leftWall);
    roomGroup.add(rightWall);
    roomGroup.add(spotlight1);
    roomGroup.add(spotlight2);
    roomGroup.add(spotlight1.target);
    roomGroup.add(spotlight2.target);

    const pillarGroup = createPillars();
    roomGroup.add(pillarGroup);

    return roomGroup;
}

function createPillars() {
    // Create a group for the pillars
    const pillarGroup = new THREE.Group();

    // Create the pillars lined by left and right walls
    const pillar_texture = new THREE.TextureLoader().load('/pillar_texture.png');
    const pillar_bump = new THREE.TextureLoader().load('/pillar_bump.png');
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 14, 35);
    const pillarMaterial = applyDisplacement(pillar_texture, pillar_bump, 0.2);
    
    // Position 4 pillars on the left wall, 1 units away from the wall
    for (let i = 0; i < 4; i++) {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.x = -14 / 2 + 2; 
        pillar.position.y += 4.99; 
        pillar.position.z = 20 / 4 * (i + 1) - (20 / 2 + 2.5); 
        pillarGroup.add(pillar);
    }
        
    // Position 4 pillars on the right wall, 1 units away from the wall
    for (let i = 0; i < 4; i++) {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.x = 14 / 2 - 2; 
        pillar.position.y += 4.99; 
        pillar.position.z = 20 / 4 * (i + 1) - (20 / 2 + 2.5);
        pillarGroup.add(pillar);
    }
    return pillarGroup;
}

// displacement map
function applyDisplacement(bump, texture, intensity) {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            text: { type: 't', value: texture },
            displacementMap: { type: 't', value: bump },
            displacementScale: { type: 'f', value: intensity } 
        },
        vertexShader: `
            varying vec2 vUv;
            uniform sampler2D displacementMap;
            uniform float displacementScale;
    
            void main() {
                vUv = uv;
                float displacement = texture2D(displacementMap, vUv).r;
                vec3 displacedPosition = position + normal * displacement * displacementScale;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D text;
            varying vec2 vUv;

            void main() {
                vec3 color = texture2D(text, vUv).rgb;
                gl_FragColor = vec4(color, 1.0); 
            }
        `
    });
    return material;
}


// bump map
function bumpMapping(texture_map, bump_map, light_positions, light_colors, light_intensities) { 
    const material = new THREE.ShaderMaterial({
            uniforms: {
                textMap: {type: 't', value: texture_map},
                bumpMap: { type: 't', value: bump_map },
                bumpScale: { type: 'f', value: 1.0 },
                numLights: { type: 'i', value: light_positions.length },  
                lightPositions: { type: 'v3v', value: light_positions },  
                lightColors: { type: 'v3v', value: light_colors },        
                lightIntensities: { type: 'f', value: light_intensities }
            },
            vertexShader: `
            varying vec2 vUv;  
            varying vec3 vNormal; 

            void main() {
                vUv = uv;
                vNormal = normal; 
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
            fragmentShader: `
            uniform sampler2D bumpMap; 
            uniform sampler2D textMap; 
            uniform float bumpScale;   
            uniform int numLights;  // Number of lights
            uniform vec3 lightPositions[3];  // Light positions (adjust size as needed)
            uniform vec3 lightColors[3];     // Light colors (adjust size as needed)
            uniform float lightIntensities[3]; // Light intensities (adjust size as needed)

            varying vec2 vUv;         
            varying vec3 vNormal;  

            void main() {
                float bumpHeight = texture2D(bumpMap, vUv).r;
    
                float dx = 1.0 / 2765.0; 
                float dy = 1.0 / 2000.0; 

                // Sample neighboring points around the current pixel
                float bumpHeightRight = texture2D(bumpMap, vUv + vec2(dx, 0.0)).r;
                float bumpHeightLeft = texture2D(bumpMap, vUv - vec2(dx, 0.0)).r;
                float bumpHeightUp = texture2D(bumpMap, vUv + vec2(0.0, dy)).r;
                float bumpHeightDown = texture2D(bumpMap, vUv - vec2(0.0, dy)).r;
    
                float dX = bumpHeightRight - bumpHeightLeft;
                float dY = bumpHeightUp - bumpHeightDown;

                vec3 objNormal = normalize(vec3(dX, dY, 1.0));
                vec3 newNorm = normalize(vNormal + objNormal * bumpScale);

                vec3 color = texture2D(textureMap, vUv).xyz;

                // Iterate over each light
                for (int i = 0; i < numLights; i++) {
                    vec3 lightDirection = normalize(lightPositions[i] - gl_FragCoord.xyz);
                    float diffuse = max(dot(newNorm, lightDirection), 0.0);
                    color += lightColors[i] * lightIntensities[i] * diffuse;
            }
            gl_FragColor += vec4(color, 1.0);
        }
        `
    });
    return material;
}