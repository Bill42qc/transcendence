import { gameMode } from "../Pong.js";
import { timer } from "./timer.js";

const aITimer1 = timer(1000);
const aITimer2 = timer(1000);
let AI_SPEED = 60;
let targetYClamped = 0;

export function paddleMovement(keyState, paddle1, paddle2, ball, paddleHeight, gameMode, ballVelocity , ballSpeed, socket) {
  // Prevent the use of the arrow up or arrow down webpage nav
  document.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown"].includes(event.code)) {
      event.preventDefault();
    }
  });

  if (gameMode === "demo") {
    // demo AI control the Ai responsiveness with AI_SPEED
    AI_SPEED = 60;

    // Control Paddle 1 with AI
    simpleAiMovement(paddle1, ball, ballVelocity, ballSpeed, AI_SPEED, aITimer1);
        // // Player-controlled paddle 1
        // movePaddle(paddle1, keyState["KeyW"], keyState["KeyS"], 5, paddleHeight, 100, socket);

    // Control Paddle 2 with AI
    // demo AI control the Ai responsiveness with AI_SPEED'
    const DUMB_AI_SPEED = 1;
    const targetY2 = ball.position.y + (ballVelocity.y * (Math.abs(paddle2.position.x - ball.position.x) / ballSpeed));
    if (paddle2.position.y < targetY2 && paddle2.position.y + paddleHeight / 2 < 100) {
      paddle2.position.y += DUMB_AI_SPEED;
    } else if (paddle2.position.y - paddleHeight / 2 > -100) {
      paddle2.position.y -= DUMB_AI_SPEED;
    }
  }

  // Paddle movement
  if (gameMode === 'vsAi') {
    // Player-controlled paddle 1
    movePaddle(paddle1, keyState["KeyW"], keyState["KeyS"], 5, paddleHeight, 100, socket);

    // Simple AI for paddle2
    AI_SPEED = 60;
    simpleAiMovement(paddle2, ball, ballVelocity, ballSpeed, AI_SPEED, aITimer2);
  }

  if (gameMode === 'vsLocal') {
    // Player-controlled paddle 1
    movePaddle(paddle1, keyState["KeyW"], keyState["KeyS"], 5, paddleHeight, 100, socket);

    // Player-controlled paddle 2
    movePaddle(paddle2, keyState["ArrowUp"], keyState["ArrowDown"], 5, paddleHeight, 100, socket);
  }

  if (gameMode === 'vsOnline') {
    // Player-controlled paddle 1 (Host)
    if (socket.isHost) {
      movePaddle(paddle1, keyState["KeyW"], keyState["KeyS"], 5, paddleHeight, 100, socket);
      // Update the local ball position and send it to the other player
      socket.updateBallPosition(ball.position.x, ball.position.y);
    }

    // Player-controlled paddle 2 (Non-host)
    if (!socket.isHost) {
      movePaddle(paddle2, keyState["KeyW"], keyState["KeyS"], 5, paddleHeight, 100, socket);
      // Update the local ball position and send it to the other player
      socket.updateBallPosition(ball.position.x, ball.position.y);
    }
  }
}

export function movePaddle(paddle, moveUp, moveDown, speed, paddleHeight, boundary, socket) {
  const newPosition = paddle.position.y + (moveUp ? speed : 0) - (moveDown ? speed : 0);

  if (newPosition + paddleHeight / 2 < boundary && newPosition - paddleHeight / 2 > -boundary) {
    paddle.position.y = newPosition;
    
    if(gameMode === 'vsOnline'){

      // Update the local paddle position and send it to the other player
      socket.updatePaddlePosition(paddle.position.y);
    }
  }
}

function simpleAiMovement(paddle, ball, ballVelocity, ballSpeed, VS_AI_SPEED, aITimer) {
  // Check if enough time has passed since the last AI response
  if (aITimer()) {
    const targetY = ball.position.y + (ballVelocity.y * (Math.abs(paddle.position.x - ball.position.x) / ballSpeed));

    // Ensure AI movement stays within the boundary
     targetYClamped = Math.max(-70, Math.min(70, targetY));
  }
    // Use linear interpolation (lerp) to smoothly move towards the target position
    paddle.position.y = lerp(paddle.position.y, targetYClamped, 0.025); // 0.025 is the interpolation factor

}

// Linear interpolation function
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}
