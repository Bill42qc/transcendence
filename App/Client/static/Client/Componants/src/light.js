  export function setLight(scene){
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Adjust the intensity (second parameter) 
  scene.add(ambientLight);
  // Directional light
  // Light facing Paddle 1
  const directionalLightPaddle1 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLightPaddle1.position.set(5, 5, 5);
  scene.add(directionalLightPaddle1);

  // Light facing Paddle 2
  const directionalLightPaddle2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLightPaddle2.position.set(-5, -5, 5);
  scene.add(directionalLightPaddle2);

  // General light pointing towards the center
  const directionalLightCenter = new THREE.DirectionalLight(0xffffff, 1);
  directionalLightCenter.position.set(0, 0, 20); // Adjust the position
  scene.add(directionalLightCenter);

  }
