import * as THREE from "three";

export class NetherParticleSystem {
    constructor(scene, particleCount = 100, spreadX = 10, spreadY = 10, spreadZ = 10, offset = 0, moveDistance = -1, downDistance = -1) {
        this.scene = scene;
        this.offset = offset;  // Set the offset value (default to -2)
        this.moveDistance = moveDistance;  // Distance to move the particle system forward

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

            // Random forward velocity
            this.velocities[i * 3 + 0] = Math.random() * 0.05 - 0.025; // x velocity (forward movement)
            this.velocities[i * 3 + 2] = Math.random() * 0.05 - 0.025; // z velocity (forward movement)

            // Optional: randomize a downward component for more natural movement
            this.velocities[i * 3 + 1] = -Math.random() * 0.1; // y velocity (falling effect)
        }

        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(this.positions, 3)
        );

        // Shader material for particles
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                pointSize: { value: 5.0 }, // Size of the particles
                color: { value: new THREE.Color(0x800080) },
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

        // Move the entire particle system forward (along z-axis)
        this.particleSystem.position.z = this.moveDistance;  // Adjust this value as needed
        this.particleSystem.position.y = downDistance;
        this.scene.add(this.particleSystem);
    }

    update(deltaTime) {
        const positions = this.geometry.attributes.position.array;

        // Speed of forward movement (adjust as needed)
        const forwardSpeed = 0.1;

        // Loop through particles and update their positions
        for (let i = 0; i < this.particleCount; i++) {
            // Apply forward velocity to x and z components (now facing the positive z-axis)
            this.velocities[i * 3 + 0] = 0; // No movement in x (after rotation)
            this.velocities[i * 3 + 2] = forwardSpeed * 3; // Forward in positive z-axis

            // Apply gravity effect to the y-component of the velocity
            const fallSpeed = 0.1; // Gravity strength for the y-axis
            this.velocities[i * 3 + 1] -= fallSpeed * deltaTime; // y velocity (falling effect)

            // Update particle positions based on velocity
            positions[i * 3 + 0] += this.velocities[i * 3 + 0] * deltaTime;
            positions[i * 3 + 1] += this.velocities[i * 3 + 1] * deltaTime;
            positions[i * 3 + 2] += this.velocities[i * 3 + 2] * deltaTime;

            // Reset particles once they fall below a certain threshold
            if (positions[i * 3 + 1] < this.offset) {
                // Reset particle to the top of the rectangular prism
                positions[i * 3 + 1] = this.spreadY + this.offset;  // Reset to top with offset applied
                positions[i * 3 + 0] = (Math.random() - 0.5) * this.spreadX; // Random x position
                positions[i * 3 + 2] = (Math.random() - 0.5) * this.spreadZ; // Random z position

                // Apply a random forward velocity for the reset particle (facing front)
                this.velocities[i * 3 + 0] = 0;  // No movement in x
                this.velocities[i * 3 + 2] = forwardSpeed;  // Reset forward velocity in the z-axis
                this.velocities[i * 3 + 1] = -Math.random() * 0.2 - 0.1;  // Random downward velocity
            }
        }

        // Ensure the geometry's position attribute is updated with the new positions
        this.geometry.attributes.position.needsUpdate = true;
    }
}
