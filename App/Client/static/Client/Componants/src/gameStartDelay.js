// gameStartDelay.js
export function startGameDelay(camera, scene, callback) {
    const duration = 3; // seconds
    const framesPerSecond = 60;
    const totalFrames = duration * framesPerSecond;
    let currentFrame = 0;
  
    // Create a countdown display element
    const countdownDisplay = document.createElement('div');
    countdownDisplay.id = 'countdownDisplay';
    countdownDisplay.style.position = 'absolute';
    countdownDisplay.style.top = '50%';
    countdownDisplay.style.left = '50%';
    countdownDisplay.style.transform = 'translate(-50%, -50%)';
    countdownDisplay.style.fontSize = '2em';
    countdownDisplay.style.color = 'white'; // Set text color to white
    document.body.appendChild(countdownDisplay);
  
    function animateCamera() {
        const percentage = currentFrame / totalFrames;
        const newPosition = THREE.MathUtils.lerp(100, 200, percentage);
        camera.position.z = newPosition;
  
        // Update the countdown display
        const countdownValue = Math.ceil(duration - (currentFrame / framesPerSecond));
        countdownDisplay.textContent = `Game in ${countdownValue}`;
  
        currentFrame++;
  
        if (currentFrame <= totalFrames) {
            requestAnimationFrame(animateCamera);
        } else {
            // Animation complete, execute the callback
            document.body.removeChild(countdownDisplay);
            if (callback) {
                callback();
            }
        }
    }
  
    animateCamera();
  }
  