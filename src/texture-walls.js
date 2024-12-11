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

    window.lights.push(spotlight1);
    window.lights.push(spotlight2);

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
    const pillarMaterial = applyDisplacement(pillar_texture, pillar_bump, 0.35);

    
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
    const camera_position = window.cameraPos;
    const amb = new THREE.Vector3(0.2, 0.2, 0.3); 
    const diff = new THREE.Vector3(0.32, 0.3, 0.35); 
    const spec = new THREE.Vector3(0.15, 0.15, 0.2); 

    // arrays for light properties (8 lights max)
    const light_type = new Array(8).fill(0);  // [1: directional, 2: point, 3: spot]
    const light_color = new Array(8 * 3).fill(0);  
    const light_dir = new Array(8 * 3).fill(0);  
    const light_pos = new Array(8 * 3).fill(0);  
    const light_att = new Array(8 * 3).fill(0);
    const light_pem = new Array(8).fill(0);
    const light_angle = new Array(8).fill(0); 

    const numLights = Math.min(8, window.lights.length);

    for (let i = 0; i < numLights; i++) {
        const light = window.lights[i];
        const color = light.color;
        light_color[i * 3] = color.r;
        light_color[i * 3 + 1] = color.g;
        light_color[i * 3 + 2] = color.b;

        if (light instanceof THREE.DirectionalLight) {
            light_type[i] = 1.0; 
            const direction = light.target.position.clone().sub(light.position);
            light_dir[i * 3] = direction.x;
            light_dir[i * 3 + 1] = direction.y;
            light_dir[i * 3 + 2] = direction.z;
        } else if (light instanceof THREE.PointLight) {
            light_type[i] = 2.0;
            light_pos[i * 3] = light.position.x;
            light_pos[i * 3 + 1] = light.position.y;
            light_pos[i * 3 + 2] = light.position.z;
            light_att[i * 3] = 0.5;  // Example attenuation factors
            light_att[i * 3 + 1] = 0.5;
            light_att[i * 3 + 2] = 0.5;
        } else if (light instanceof THREE.SpotLight) {
            light_type[i] = 3.0; 
            const direction = light.target.position.clone().sub(light.position);
            light_dir[i * 3] = direction.x;
            light_dir[i * 3 + 1] = direction.y;
            light_dir[i * 3 + 2] = direction.z;
            light_pos[i * 3] = light.position.x;
            light_pos[i * 3 + 1] = light.position.y;
            light_pos[i * 3 + 2] = light.position.z;
            light_att[i * 3] = 0.7;  // Example attenuation factors
            light_att[i * 3 + 1] = 0.6;
            light_att[i * 3 + 2] = 0.8;
            light_pem[i] = light.penumbra; 
            light_angle[i] = light.angle;  
        }
    }

    const material = new THREE.ShaderMaterial({
        uniforms: {
            text: { type: 't', value: texture },
            displacementMap: { type: 't', value: bump },
            displacementScale: { type: 'f', value: intensity },
            camera_pos: { type: 'v3', value: camera_position },
            ka_term: { type: 'f', value: 0.5 },
            kd_term: { type: 'f', value: 0.5 },
            ks_term: { type: 'f', value: 0.5 },
            shininess: { type: 'f', value: 10.0 },
            ambient: { type: 'v3', value: amb },
            diffuse: { type: 'v3', value: diff },
            specular: { type: 'v3', value: spec },
            amt: { type: 'f', value: numLights },
            lightPos: { type: 'fv1', value: light_pos },
            lightColors: { type: 'fv1', value: light_color },
            lightType: { type: 'fv1', value: light_type },
            lightDir: { type: 'fv1', value: light_dir },
            lightAtt: { type: 'fv1', value: light_att },
            lightPem: { type: 'fv1', value: light_pem },
            lightAngle: { type: 'fv1', value: light_angle }
        },
        vertexShader: `
            varying vec2 vUv;
            uniform sampler2D displacementMap;
            uniform float displacementScale;

            varying vec3 world_space_pos;
            varying vec3 world_space_norm;
    
            void main() {
                vUv = uv;
                float displacement = texture2D(displacementMap, vUv).r;
                vec3 displacedPosition = position + normal * displacement * displacementScale;

                // displaced position passed to frag shader
                world_space_pos = displacedPosition;
    
                // displaced norm passed to frag shader
                vec3 displacedPositionX = position + normal * texture2D(displacementMap, vUv + vec2(0.001, 0.0)).r * displacementScale;
                vec3 displacedPositionY = position + normal * texture2D(displacementMap, vUv + vec2(0.0, 0.001)).r * displacementScale;
                vec3 dx = displacedPositionX - displacedPosition;
                vec3 dy = displacedPositionY - displacedPosition;

                vec3 displacedNormal = normalize(cross(dx, dy));
                // world_space_norm = normalize(normalMatrix * displacedNormal);
                
                world_space_norm = normal;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
            }
        `,
        fragmentShader: `
uniform sampler2D text;

varying vec2 vUv;
varying vec3 world_space_pos;
varying vec3 world_space_norm;

uniform vec3 camera_pos;
uniform float ka_term;
uniform float kd_term;
uniform float ks_term;

uniform float amt;
uniform float lightType[8];   // 1 for directional, 2 for point, 3 for spot
uniform float lightColors[24]; 
uniform float lightDir[24];    
uniform float lightPos[24];    
uniform float lightAtt[24];    
uniform float lightPem[8];     
uniform float lightAngle[8];   
uniform float shininess;

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;

void main() {
    // Output color
    vec3 fragColor = vec3(0.0); 
    
    // Phong ambient term
    vec3 ambient_term = ka_term * ambient;
    
    for (int i = 0; i < int(amt); i++) {
        // Get light direction depending on light type
        vec3 dir_to_light;
        if (lightType[i] == 1.0) {  // Directional light
            dir_to_light = -normalize(vec3(lightDir[i * 3], lightDir[i * 3 + 1], lightDir[i * 3 + 2]));
        } else {  // Point and Spot lights
            dir_to_light = normalize(vec3(lightPos[i * 3], lightPos[i * 3 + 1], lightPos[i * 3 + 2]) - world_space_pos);
        }

        // Add diffuse component
        vec3 norm = normalize(world_space_norm);
        float dif = max(0.0, min(1.0, dot(norm, dir_to_light)));
        vec3 term = kd_term * diffuse * dif * vec3(lightColors[i * 3], lightColors[i * 3 + 1], lightColors[i * 3 + 2]);

        // Add specular component
        vec3 refl_light = normalize(reflect(-dir_to_light, norm));
        vec3 dirToCam = normalize(camera_pos - world_space_pos);
        float specTerm = max(0.0, min(1.0, dot(refl_light, dirToCam)));
        if (shininess > 0.0) {
            specTerm = pow(specTerm, shininess);
        }
        term += ks_term * specular * specTerm * vec3(lightColors[i * 3], lightColors[i * 3 + 1], lightColors[i * 3 + 2]);

        if (lightType[i] == 1.0) {
            fragColor += term;  // Directional light
        } else {
            // Compute attenuation factor for point and spot lights
            float dis = length(vec3(lightPos[i * 3], lightPos[i * 3 + 1], lightPos[i * 3 + 2]) - world_space_pos);
            vec3 func = vec3(lightAtt[i * 3], lightAtt[i * 3 + 1], lightAtt[i * 3 + 2]);
            float attFactor = min(1.0, 1.0 / func.x + func.y * dis + func.z * pow(dis, 2.0));
            
            if (lightType[i] == 2.0) {
                fragColor += attFactor * term; // Point light
            }

            if (lightType[i] == 3.0) {  // Spot light
                vec3 lightDirection = normalize(vec3(lightDir[i * 3], lightDir[i * 3 + 1], lightDir[i * 3 + 2]));
                float outerAngle = lightAngle[i];
                float innerAngle = outerAngle - lightPem[i];
                float angleX = acos(dot(-dir_to_light, lightDirection));
                float fallOff = -2.0 * pow((angleX - innerAngle) / lightPem[i], 3.0) + 3.0 * pow((angleX - innerAngle) / lightPem[i], 2.0);

                // Compute intensity factor
                float intensity = 0.0;
                if (angleX <= innerAngle) {
                    intensity = 1.0;
                } else if (angleX <= outerAngle) {
                    intensity = (1.0 - fallOff);
                }
                fragColor += attFactor * term * intensity; // Spot light
            }
        }
    }

    fragColor += ambient_term;

    // blend texture with computed color
    vec3 textureColor = texture2D(text, vUv).rgb; 
    fragColor = mix(fragColor, textureColor, 0.5); // Blend texture with fragment color

    gl_FragColor = vec4(fragColor, 1.0);
}
        `
    });
    return material;
}


function applySimpleDisplacement(bump, texture, intensity) {
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
