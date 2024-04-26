
export let isCameraAnimationRunning = false; // Change from const to let


///function to spawn sphere randomly
function updateDuringAnimation(camera, scene, progress, spheres) {
  // Adjust the condition to control the frequency of sphere spawns
  if (progress % 0.1 < 0.01) {
    const sphereRadius = 10;

    // Random color
    const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());

    // Random glow
    const randomGlow = Math.random() * 1;

    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: randomColor,
      emissive: new THREE.Color(randomGlow, randomGlow, randomGlow),
    });

    const sphere = new THREE.Mesh(geometry, material);

    // Random position between (-500, -500, -500) and (500, 500, 500)
    const randomPosition = new THREE.Vector3(
      Math.random() * 1000 - 500,
      Math.random() * 1000 - 500,
      Math.random() * 1000 - 500
    );

    sphere.position.copy(randomPosition);

    // Set a random lifespan (in frames)
    sphere.lifespan = Math.floor(Math.random() * 300) + 100; // Adjust the range based on your preference

    scene.add(sphere);
    spheres.push(sphere);
  }

  // Fix the delete mechanism by iterating backward through the spheres array
  for (let i = spheres.length - 1; i >= 0; i--) {
    const sphere = spheres[i];
    sphere.lifespan--;

    if (sphere.lifespan <= 0) {
      scene.remove(sphere);
      spheres.splice(i, 1);
    }
  }
}


export function stopCameraAnimation() {
  isCameraAnimationRunning = false;
}

export function startCameraAnimation(camera, scene, resetBall, createNewCamera = false) {
  isCameraAnimationRunning = true;

  // Array to store spheres
  const spheres = [];

  if (createNewCamera) {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;
  }

  const animationDuration = 30000;
  const orbitAmplitude = 300;
  const orbitSpeed = 1;
  const zoomDuration = 5000;
  const zoomIntensity = 2;

  let startTime;
  let zoomStartTime;

  const animateCamera = (timestamp) => {
    if (!isCameraAnimationRunning) return;

    if (!startTime) startTime = timestamp;
    if (!zoomStartTime) zoomStartTime = timestamp;

    const progress = (timestamp - startTime) / animationDuration;
    const zoomProgress = (timestamp - zoomStartTime) / zoomDuration;

  //  updateDuringAnimation(camera, scene, progress, spheres); // Call the custom update function

    const angle = progress * Math.PI * 2;
    const oscillation = Math.sin(progress * Math.PI);

    const orbitRadius = 300 + orbitAmplitude * oscillation;

    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;

    camera.position.set(x, 200, z);
    camera.lookAt(scene.position);

    if (progress % 1 === 0) {
      const randomTwist = Math.random() * Math.PI * 2;
      camera.rotation.y = randomTwist;
    }

    if (zoomProgress <= 1) {
      const zoomFactor = 1 + zoomIntensity * Math.sin(zoomProgress * Math.PI);
      camera.fov = 75 / zoomFactor;
      camera.updateProjectionMatrix();
    }

    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      startCameraAnimation(camera, scene, resetBall);
    }
  };

  animateCamera(performance.now());
}

export function resetCamera(camera, scene) {
  scene.remove(camera);

  const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  newCamera.position.z = 200;
  scene.add(newCamera);
  
  return newCamera;
}
