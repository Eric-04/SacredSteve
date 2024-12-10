export function setupKeyControls(keys) {
    document.addEventListener('keydown', (event) => {
        if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.forward = true;
        if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.backward = true;
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = true;
        if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = true;
        if (event.code === 'Space') keys.jump = true;
    });

    document.addEventListener('keyup', (event) => {
        if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.forward = false;
        if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.backward = false;
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = false;
        if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = false;
        if (event.code === 'Space') keys.jump = false;
    });
}

export function updateSteveMovement(steve, keys, deltaTime) {
    const walkSpeed = 0.05;
    const jumpSpeed = 5;
    const gravity = 9.8;
    const groundLevel = -2;

    stevenMovementLogic(steve, keys, walkSpeed);
    
    // Retrieve or initialize jump state
    let isJumping = steve.userData.isJumping || false;
    let jumpVelocity = steve.userData.jumpVelocity || 0;

    // Jump logic
    if (keys.jump && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpSpeed;
    }

    if (isJumping) {
        steve.position.y += jumpVelocity * deltaTime;
        jumpVelocity -= gravity * deltaTime; // Gravity effect
        steveAnimationLogic(steve);

        // Reset jump when Steve lands
        if (steve.position.y <= groundLevel) {
            steve.position.y = groundLevel;
            isJumping = false;
            jumpVelocity = 0;
        }
    }

    // Save jump state to steve's userData
    steve.userData.isJumping = isJumping;
    steve.userData.jumpVelocity = jumpVelocity;
    
}

function stevenMovementLogic(steve, keys, walkSpeed) {
    if (keys.forward || keys.backward || keys.left || keys.right) steveAnimationLogic(steve);
    // Move forward or backward
    if (keys.forward) steve.position.z -= walkSpeed;
    if (keys.backward) steve.position.z += walkSpeed;

    // Move left or right
    if (keys.left) steve.position.x -= walkSpeed;
    if (keys.right) steve.position.x += walkSpeed;
}

function steveAnimationLogic(steve) {
    const time = Date.now() * 0.01; 
    
    steve.children[2].rotation.x = Math.sin(time) * 0.5; // Left arm
    steve.children[3].rotation.x = -Math.sin(time) * 0.5; // Right arm

    steve.children[4].rotation.x = Math.sin(time) * 0.5; // Left leg
    steve.children[5].rotation.x = -Math.sin(time) * 0.5; // Right right
}