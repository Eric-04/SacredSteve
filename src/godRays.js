import * as THREE from 'three';

export function createCrepuscularRaysPass(scene, camera, renderer) {
    // Render target with depth texture
    const renderTarget = new THREE.WebGLRenderTarget(
        window.innerWidth, 
        window.innerHeight, 
        { 
            minFilter: THREE.LinearFilter, 
            magFilter: THREE.LinearFilter, 
            format: THREE.RGBAFormat,
            depthTexture: new THREE.DepthTexture(window.innerWidth, window.innerHeight)
        }
    );

    // Create a light source mesh
    const lightSource = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 3.5),
        new THREE.MeshBasicMaterial({ 
            color: 0xb223b2, 
            transparent: true, 
            opacity: 0.5 
        })
    );
    lightSource.position.set(0, 1, -5.1);
    scene.add(lightSource);

    

    // Volumetric light scattering shader
    const volumetricLightMaterial = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { value: null },
            tDepth: { value: null },
            lightPositionOnScreen: { value: new THREE.Vector2(0.5, 0.5) },
            exposure: { value: 0.12 },
            decay: { value: 0.95 },
            density: { value: 0.8 },
            weight: { value: 0.8 },
            samples: { value: 200 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform sampler2D tDepth;
            uniform vec2 lightPositionOnScreen;
            uniform float exposure;
            uniform float decay;
            uniform float density;
            uniform float weight;
            uniform float samples;

            varying vec2 vUv;

            void main() {
                // Vector from pixel to light source
                vec2 deltaTextCoord = lightPositionOnScreen - vUv;
                deltaTextCoord *= 1.0 / float(samples) * density;
                
                vec2 coord = vUv;
                float illuminationDecay = 1.0;
                
                vec4 fragmentColor = vec4(0.0);
                
                for (int i = 0; i < int(samples); i++) {
                    coord += deltaTextCoord;
                    
                    // Sample color and depth
                    vec4 colorSample = texture2D(tDiffuse, coord);
                    float depthSample = texture2D(tDepth, coord).r;
                    
                    // Attenuate based on depth and distance from light
                    float distanceAttenuation = 1.0 - length(coord - lightPositionOnScreen);
                    
                    colorSample.rgb *= illuminationDecay * weight * distanceAttenuation;
                    
                    fragmentColor += colorSample;
                    
                    illuminationDecay *= decay;
                }
                
                // Apply exposure and make rays more visible
                gl_FragColor = fragmentColor * exposure;
                gl_FragColor.a = 0.7; // Add some transparency
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    // Screen-aligned quad
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quadMesh = new THREE.Mesh(quadGeometry, volumetricLightMaterial);

    // Post-processing scene
    const postProcessScene = new THREE.Scene();
    postProcessScene.add(quadMesh);

    // Orthographic camera for post-processing
    const postProcessCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    function updateLightPosition(camera) {
        // Project world light position to screen coordinates
        const worldPosition = lightSource.position.clone();
        const vector = worldPosition.project(camera);
        
        const screenX = (vector.x + 1) / 2;
        const screenY = (vector.y + 1) / 2;
        
        volumetricLightMaterial.uniforms.lightPositionOnScreen.value.set(screenX, screenY);
    }

    function render(scene, camera, renderer) {
        // Render the scene to a texture with depth
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);
        
        // Update light position
        updateLightPosition(camera);
        
        // Set the input textures
        volumetricLightMaterial.uniforms.tDiffuse.value = renderTarget.texture;
        volumetricLightMaterial.uniforms.tDepth.value = renderTarget.depthTexture;
        
        // Render the post-processing layer
        renderer.setRenderTarget(null);
        renderer.render(postProcessScene, postProcessCamera);
        
    }

    return {
        render,
        lightSource,
        material: volumetricLightMaterial
    };
}