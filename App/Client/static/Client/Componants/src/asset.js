// Exporting paddles, ball, and other constants
import  {setLight}  from './light.js'

export let paddle1, paddle2, ball, paddleWidth, paddleHeight, ballSpeed, ballVelocity;

export function setAsset(scene) {
setLight(scene);

  // Create ball
  ballSpeed = 2;
  ballVelocity = new THREE.Vector3(-ballSpeed, -ballSpeed, 0);
  const ballGeometry = new THREE.SphereGeometry(5, 32, 32);
  
  // Using MeshBasicMaterial for the ball
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  
  // Create a PointLight for the ball's glow
  let ballGlow = new THREE.PointLight(0xffffff, 3, 30); // Adjust the intensity and distance
  ball.add(ballGlow); // Attach the light to the ball
  scene.add(ball);

    // Create paddles
    paddleWidth = 10;
    paddleHeight = 50;
    const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, 10);
    const paddleMaterial1 = new THREE.MeshStandardMaterial({ color: 0x00ff00});
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
    paddle1.position.x = -190;
    scene.add(paddle1);

    const paddleMaterial2 = new THREE.MeshStandardMaterial({ color: 0x0000ff});
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);
    paddle2.position.x = 190;
    scene.add(paddle2);

    // Create gaming surface border
    const borderGeometry = new THREE.BoxGeometry(400, 10, 20);
    const borderMaterial = new THREE.MeshStandardMaterial({ color: 0x800080});
    const borderTop = new THREE.Mesh(borderGeometry, borderMaterial);
    const borderBottom = new THREE.Mesh(borderGeometry, borderMaterial);
    borderTop.position.y = 105;
    borderBottom.position.y = -105;
    scene.add(borderTop);
    scene.add(borderBottom);



}

export function resetAsset(){
    paddle1.position.set(-190, 0, 0);
    paddle2.position.set(190, 0, 0);
}


export function clearScene(scene) {
    while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);
      if (object.dispose) {
        object.dispose();
      }
    }
  }