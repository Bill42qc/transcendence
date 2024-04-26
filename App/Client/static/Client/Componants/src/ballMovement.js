export function ballMovement(ball, paddle1, paddle2, paddleWidth, paddleHeight, ballVelocity, score) {
  // Ball movement
  if(score.gameActive){
  ball.position.x += ballVelocity.x;
  ball.position.y += ballVelocity.y;
  }

  handleBallWallCollision(ball, ballVelocity);
  handlePaddleCollision(ball, paddle1, paddleWidth, paddleHeight, ballVelocity, 'paddle1');
  handlePaddleCollision(ball, paddle2, paddleWidth, paddleHeight, ballVelocity, 'paddle2');
}

function handleBallWallCollision(ball, ballVelocity) {
  // Ball collisions with walls
  if (ball.position.y + 5 > 100 || ball.position.y - 5 < -100) {
    ballVelocity.y *= -1;
  }
}

function handlePaddleCollision(ball, paddle, paddleWidth, paddleHeight, ballVelocity, paddleId) {
  const halfPaddleWidth = paddleWidth / 2;
  const halfPaddleHeight = paddleHeight / 2;

  // Check if a collision flag is set
  if (paddle.isColliding) {
    return;
  }

  // Calculate AABB for ball and paddle
  const ballAABB = {
    minX: ball.position.x - 5,
    maxX: ball.position.x + 5,
    minY: ball.position.y - 5,
    maxY: ball.position.y + 5
  };

  const paddleAABB = {
    minX: paddle.position.x - halfPaddleWidth,
    maxX: paddle.position.x + halfPaddleWidth,
    minY: paddle.position.y - halfPaddleHeight,
    maxY: paddle.position.y + halfPaddleHeight
  };

  // Check for AABB collision and paddleId to prevent double collisions
  if (
    ballAABB.minX < paddleAABB.maxX &&
    ballAABB.maxX > paddleAABB.minX &&
    ballAABB.minY < paddleAABB.maxY &&
    ballAABB.maxY > paddleAABB.minY &&
    ball.lastCollidedPaddle !== paddleId
  ) {
    // Collision detected, handle accordingly

    // Set the collision flag to prevent multiple collisions during this interaction
    paddle.isColliding = true;

    // Store the last collided paddle
    ball.lastCollidedPaddle = paddleId;

    // Calculate relative position on the paddle
    const relativePosition = (ball.position.y - paddle.position.y) / halfPaddleHeight;

    // Adjust ball's x velocity based on relative position with an exaggerated factor
    ballVelocity.x *= -1.01;
    ballVelocity.y = relativePosition * 3; // Adjust this factor as needed

    // Use setTimeout or requestAnimationFrame to reset the collision flag after a short delay
    setTimeout(() => {
      paddle.isColliding = false;
      ball.lastCollidedPaddle = null;
    }, 1000); // Adjust the delay based on your needs
  }
}


