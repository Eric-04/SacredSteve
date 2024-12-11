import * as THREE from "three";

export class ParticleSystem {
    constructor(scene, particleCount = 500, spreadX = 10, spreadY = 10, spreadZ = 10, offset = 0) {
        this.scene = scene;
        this.offset = offset;  // Set the offset value (default to -2)

        // Particle attributes
        this.particleCount = particleCount;
        this.spreadX = spreadX;  // Spread for the x-axis
        this.spreadY = spreadY;  // Spread for the y-axis
        this.spreadZ = spreadZ;  // Spread for the z-axis

        // Geometry and shader materials
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);

        // Initialize particle positions and velocities
        for (let i = 0; i < this.particleCount; i++) {
            // Random positions within the spread for each axis, creating particles within a rectangular prism
            this.positions[i * 3 + 0] = (Math.random() - 0.5) * this.spreadX; // x
            this.positions[i * 3 + 1] = Math.random() * this.spreadY + this.offset; // y, offset applied here
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * this.spreadZ; // z

            // Random downward velocity
            this.velocities[i * 3 + 1] = -Math.random() * 0.1; // y velocity
        }

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions, 3)
        );

        // Shader material for particles
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointSize: { value: 5.0 }, // Size of the particles
                color: { value: new THREE.Color(0xd8dae3) },
            },
            vertexShader: `
                uniform float pointSize;
                void main() {
                    gl_PointSize = pointSize;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                void main() {
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: true,
        });

        // Create particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);
    }

    update(deltaTime) {
        const positions = this.geometry.attributes.position.array;

        // Increase the downward velocity for faster falling
        const fallSpeed = 0.1; // Adjust this for fall speed

        // Loop through particles and update their positions
        for (let i = 0; i < this.particleCount; i++) {
            // Apply gravity to the Y-component of the velocity
            this.velocities[i * 3 + 1] -= fallSpeed * deltaTime;  // Gravity effect

            // Update Y position based on velocity
            positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;

            // Reset particles once they fall below a certain threshold
            if (positions[i * 3 + 1] < this.offset) {
                // Reset particle to the top of the rectangular prism
                positions[i * 3 + 1] = this.spreadY + this.offset;  // Reset to top with offset applied
                positions[i * 3 + 0] = (Math.random() - 0.5) * this.spreadX; // Random x position
                positions[i * 3 + 2] = (Math.random() - 0.5) * this.spreadZ; // Random z position

                // Apply a random downward velocity for the reset particle
                this.velocities[i * 3 + 1] = -Math.random() * 0.2 - 0.1;  // Randomize the fall speed for each reset particle
            }
        }

        // Ensure the geometry's position attribute is updated with the new positions
        this.geometry.attributes.position.needsUpdate = true;
    }
}
