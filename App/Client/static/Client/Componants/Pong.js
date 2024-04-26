import buttonControl from './src/button.js';
import { clearScene,  setAsset, paddle1, paddle2, ball, paddleWidth, paddleHeight, ballVelocity, resetAsset, ballSpeed } from './src/asset.js';
import Score from './src/score.js'
import { paddleMovement } from './src/paddleMovement.js';
import { ballMovement} from './src/ballMovement.js';
import playerSocket, { updateWaitingPrompt } from './src/socket.js';
import { resetCamera, startCameraAnimation, isCameraAnimationRunning, stopCameraAnimation } from './src/cameraAnimation.js';
import { startGameDelay } from './src/gameStartDelay.js';
import { setGameInfo, getUserInfo } from './src/gameInfo.js';
import { startTournament } from './src/tournament.js';
import { postResult } from './src/gameInfo.js';

let isAnimated = false;
const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
export const score = new Score();
let keyState = {};
export let gameMode = "demo";
export let mySocket = new playerSocket();
export let gameButton;




export function initializeGameMode(mode) {
  clean();
  gameMode = mode;
  setAsset(scene);


  if (gameMode === 'demo') {
    score.setDemoScore(true);
    startCameraAnimation(camera, scene, resetBall, false, ball);
    score.gameActive = true;
  } else {
    score.setDemoScore(false);
  }

  if (gameMode === 'vsAi' || gameMode === 'vsLocal' || (gameMode === 'vsOnline' && mySocket.isHost)) {
    startGameDelay(camera, scene, () => {
      score.gameActive = true;
      if(gameMode === 'vsOnline')
       updateWaitingPrompt("Online Game");
      // Check if the ball is already spawned
      if (!ball || !ball.visible) {
        resetBall();
      }
    });
  }
  if ((gameMode === 'vsOnline' && !mySocket.isHost))
    {
      updateWaitingPrompt("Online Game");
      startGameDelay(camera, scene, () => {})
    }
  if ((gameMode === 'tournament'))
    {
      updateWaitingPrompt("Tournament");
      startTournament();
    }
}

function update() {
  paddleMovement(keyState, paddle1, paddle2, ball, paddleHeight, gameMode, ballVelocity, ballSpeed, mySocket);
  ballMovement(ball, paddle1, paddle2, paddleWidth, paddleHeight, ballVelocity,score);
  score.checkWin(ball, resetBall, mySocket);
  setGameInfo();
}
function animate() {
  requestAnimationFrame(animate);
  update();
  // Update renderer size on each animation frame based on the container size
  const container = document.getElementById('game-container');
  const containerRect = container.getBoundingClientRect();
  renderer.setSize(containerRect.width, containerRect.height);
  renderer.render(scene, camera);
}

function init() {
   gameButton = new buttonControl(vsAi, vsLocal, vsOnline, tournament);
  // Set the renderer size based on the game-container dimensions
  const container = document.getElementById('game-container');
  const containerRect = container.getBoundingClientRect();
  renderer.setSize(containerRect.width, containerRect.height);
  renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for better rendering on high-DPI displays
  // Adjust camera aspect ratio to match the container's aspect ratio
  camera.aspect = containerRect.width / containerRect.height;
  camera.updateProjectionMatrix();
  // Append the renderer to the game-container
  container.appendChild(renderer.domElement);
  document.addEventListener("keydown", (event) => {
    keyState[event.code] = true;
  });
  document.addEventListener("keyup", (event) => {
    keyState[event.code] = false;
  });
  window.addEventListener('resize', () => {
    renderAdjustment();
  });
  
  updateWaitingPrompt("Welcome");

    // Check if the player is ready and inform the server about canceling the ready state
  window.addEventListener('beforeunload', (event) => {
    if (mySocket.isReady) {
      mySocket.isReady = false;
      mySocket.sendMessage({
        type: 'cancelReady',
        channel: mySocket.gameChannel,
        username: mySocket.userName,
      });
    }
    if(mySocket.gameChannel)
      mySocket.gameChannel = "N/A";
  });

}

export function launch() {
if(mySocket.gameChannel)
  mySocket.gameChannel = "N/A";
  init();
  setAsset(scene);
  initializeGameMode('demo');
  if(!isAnimated){
    animate();
    isAnimated = true;
    getUserInfo();
  }
  
}

export function vsAi() {
  gameButton.hideVsOnlineButton();
  mySocket.gameChannel = "N/A";
  updateWaitingPrompt("Is the AI better than you ?");
  mySocket.isHost = false;
  initializeGameMode('vsAi');
}

export function vsLocal() {
  gameButton.hideVsOnlineButton();
  mySocket.gameChannel = "N/A";
  updateWaitingPrompt("Local Death Pong Duel");
  mySocket.isHost = false;
  initializeGameMode('vsLocal');
}

export function tournament(){
  gameButton.hideVsOnlineButton();
  mySocket.gameChannel = "N/A";
  updateWaitingPrompt("Tournament: Fortune favor the brave !!!");
  mySocket.isHost = false;
  initializeGameMode('tournament');
}

export function vsOnline() {
  document.body.addEventListener('mousedown', handleMouseDown);
  // hide vsOnline button
  gameButton.hideVsOnlineButton();
  mySocket.gameChannel = "N/A";
  mySocket.isReady = true;
  updateWaitingPrompt("Looking for a Challenger !!! Please Wait");
  mySocket.isHost = false;
  if (!mySocket.socket.readyState === WebSocket.OPEN)
  mySocket.socket.open();
  
  // Send playerReady message + Include the game channel information
  mySocket.sendMessage({
    type: 'playerReady',
    channel: mySocket.gameChannel,
    username: mySocket.userName,
  });


  // Add an event listener to handle the 'startGame' message
  const startGameListener = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'startGame') {
        // Stop the mousedown listener
        stopMouseDownListener();
        if ('game_channel' in message) {
          mySocket.gameChannel = message.game_channel;
        }
        if('opponent' in message) {
          if(mySocket.userName === message.opponent)
          {
            mySocket.opponent = message.host;
          }
          else
          mySocket.opponent = message.opponent;;
        }
        
        updateWaitingPrompt("Game Found");
        gameButton.hideVsOnlineButton();
        initializeGameMode('vsOnline');

        // Remove the event listener after handling the message
        mySocket.socket.removeEventListener('message', startGameListener);
      }
    } catch (error) {
      console.error('Error processing received data:', error);
    }
  };
  // Add the event listener to the socket
  mySocket.socket.addEventListener('message', startGameListener);
}


export function updateRemoteBallPosition(x, y, game_channel) {
  if (game_channel === mySocket.gameChannel && (!mySocket.isHost)) {
    ball.position.x = x;
    ball.position.y = y;

    // Check if the ball crosses the goal line
    if (ball.position.x < -199) {
      // Increase the remote score for paddle2
      score.scorePaddle2++;
      resetBall();
    }

    if (ball.position.x > 199) {
      // Increase the remote score for paddle1
      score.scorePaddle1++;
      resetBall();
    }

    // Check if the remote player wins
    if (score.scorePaddle1 === 3) {
      // Handle remote player winning
      postResult(mySocket.opponent, "Lost");
      score.showWinnerPrompt(mySocket.opponent);
      score.scorePaddle1 = "Winner ";
      score.scorePaddle2 = "Looser ";
      gameButton.showVsOnlineButton();
      mySocket.gameChannel = "N/A";

    } else if (score.scorePaddle2 === 3) {
      postResult(mySocket.opponent, "Win");
      // Handle remote player winning
      score.showWinnerPrompt(mySocket.userName);
      score.scorePaddle1 = "Looser ";
      score.scorePaddle2 = "Winner ";
      gameButton.showVsOnlineButton();
      mySocket.gameChannel = "N/A";



    }

    // Update the score display
    score.updateScoreDisplay();
  }
}

export function updateRemotePaddlePosition(y, game_channel) {
  if (game_channel === mySocket.gameChannel) {
    // console.log(`Updating remote paddle position: y=${y} from sender=${game_channel}`);
    if (!mySocket.isHost) {
      paddle1.position.y = y;
    } else {
      paddle2.position.y = y;
    }
  }
  // } else {
  //   console.log(`Ignoring remote paddle position update from sender=${game_channel}`);
  // }
}


export function resetBall() {
  if(!scene.ball){
  // Randomly choose the initial direction hori + verti
  const horizontalDirection = Math.random() < 0.5 ? -1 : 1;
  const verticalDirection = Math.random() < 0.5 ? -1 : 1;
  ball.position.set(0, 0, 0);
  ballVelocity.set(horizontalDirection * ballSpeed, verticalDirection * ballSpeed, 0);
  }
}

function clean() {
  score.setDemoScore(false);
  score.gameActive = false;
  stopCameraAnimation();
  clearScene(scene);

  score.scorePaddle1 = 0;
  score.scorePaddle2 = 0;
  score.hideWinnerPrompt();
  camera = resetCamera(camera, scene); // Reset camera after animation completes
  renderAdjustment();

}

function renderAdjustment() {
  const container = document.getElementById('game-container');
  const containerRect = container.getBoundingClientRect();

  // Update renderer size
  renderer.setSize(containerRect.width, containerRect.height);

  // Update camera aspect ratio
  camera.aspect = containerRect.width / containerRect.height;
  camera.updateProjectionMatrix();
}

function handleMouseDown(event) {
  // Check if the click is outside the game container
  const isOutsideGameArea = !event.target.closest('#game-container');

  // Check if the click is a left mouse button click (button value 0)
  const isLeftButtonClick = event.button === 0;

  if (isOutsideGameArea && isLeftButtonClick && mySocket.isReady) {
    // Send cancelReady message
    mySocket.sendMessage({
      type: 'cancelReady',
      channel: mySocket.gameChannel,
      username: mySocket.userName,
    });

    // Update local state
    mySocket.isReady = false;

    // Update UI or perform other actions
    updateWaitingPrompt("Ready canceled");
    gameButton.showVsOnlineButton();

    if(mySocket.gameChannel !== 'N/A')
      stopMouseDownListener();
  }

  if (mySocket.gameChannel) {
    mySocket.gameChannel = "N/A";
  }
}

function stopMouseDownListener() {
  // Remove the mousedown event listener
  document.body.removeEventListener('mousedown', handleMouseDown);
}
