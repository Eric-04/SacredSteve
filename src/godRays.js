import * as THREE from "three";

export function createGodRays(scene, camera, renderer) {
  // Create a directional light for god rays
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(5, 5, 5);
  scene.add(sunLight);

  // Create a visible sun/light source
  const sunGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.position.copy(sunLight.position);
  scene.add(sunMesh);

  // Create volumetric light material
  const volumetricGeometry = new THREE.PlaneGeometry(10, 10);
  const volumetricMaterial = new THREE.ShaderMaterial({
    uniforms: {
      lightPosition: { value: new THREE.Vector3(0, 0, 0) },
      exposure: { value: 0.6 },
      decay: { value: 0.96 },
      density: { value: 0.8 },
      weight: { value: 0.4 },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 lightPosition;
      uniform float exposure;
      uniform float decay;
      uniform float density;
      uniform float weight;

      varying vec2 vUv;

      void main() {
        vec2 texCoord = vUv;
        vec2 deltaTextureCoord = texCoord - lightPosition.xy;
        
        vec3 color = vec3(1.0, 1.0, 0.8); // Soft yellow god ray color
        float illuminationDecay = 1.0;
        
        for (int i = 0; i < 20; i++) {
          texCoord -= deltaTextureCoord * 0.01;
          float sample = smoothstep(0.5, 0.0, length(texCoord - vec2(0.5)));
          sample *= illuminationDecay * weight;
          color *= sample;
          illuminationDecay *= decay;
        }
        
        gl_FragColor = vec4(color * exposure, 0.3);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  const volumetricMesh = new THREE.Mesh(volumetricGeometry, volumetricMaterial);
  volumetricMesh.position.z = -5; // Position in front of the scene
  scene.add(volumetricMesh);

  return {
    sunLight,
    sunMesh,
    volumetricMesh,
    setPosition(x, y, z) {
        sunLight.position.set(x, y, z);
        sunMesh.position.set(x, y, z);
      },
    update: (time) => {
      // Update light position projection
      const lightScreenPosition = sunLight.position.clone();
      lightScreenPosition.project(camera);
      
      // Normalize to screen coordinates
      volumetricMaterial.uniforms.lightPosition.value = new THREE.Vector3(
        (lightScreenPosition.x + 1) / 2,
        (lightScreenPosition.y + 1) / 2,
        lightScreenPosition.z
      );
      
      // Optional: Add some time-based animation
      volumetricMaterial.uniforms.time.value = time;
    }
  };
}