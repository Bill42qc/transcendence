// socket.js
import { updateRemoteBallPosition, updateRemotePaddlePosition } from "../Pong.js";
import { updateOnlineStatus } from "./gameInfo.js";

export class PlayerSocket {
  constructor() {
    this.socket = new WebSocket(`wss://${window.location.host}/ws/pong`);
    this.isHost = false;
    this.gameChannel = "N/A";
    this.userName = "No username"
    this.connectedPlayers;
    this.opponent= "not Assigned yet";

    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened');
      updateOnlineStatus();
      
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed');
      updateOnlineStatus();
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        //  console.log('Raw data received:', event.data); // Log the raw data
         // console.log('Received message:', message);
        if (message.type === 'updatePlayerCount') {
          const { playerCount } = message;
          console.log("playerCount ===", playerCount);
          this.connectedPlayers = playerCount;
        }
        else if (message.type === 'startGame') {
          console.log("message.opponent = ", message.opponent);
          console.log("message.host === ", message.host);
          if(this.userName === message.opponent)
          {
            this.opponent = message.host;
          }
          else
            this.opponent = message.opponent;
        } 
        else if (message.type === 'hostMessage') {
          this.isHost = true;
        } else if (message.type === 'syncBallPosition') {
          updateRemoteBallPosition(message.position.x, message.position.y, message.game_channel);
        } else if (message.type === 'syncPaddlePosition') {
          updateRemotePaddlePosition(message.position.y, message.game_channel);
        } else {
          console.log("Non Used message receive:", message.type);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  }

  updateBallPosition(x, y) {
    const ballPositionMessage = {
      type: 'ballPosition',
      position: { x, y },
      game_channel: this.gameChannel,
    };
    this.sendMessage(ballPositionMessage);
  }

  updatePaddlePosition(y) {
    const paddlePositionMessage = {
      type: 'paddlePosition',
      position: { y },
      game_channel: this.gameChannel,
    };

    this.sendMessage(paddlePositionMessage);
  }

  closeConnection() {
    if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
      this.socket.close();
    }}

  reset() {
    this.isHost = false;
    this.gameChannel = "N/A";
  }

  sendMessage(message) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export function updateWaitingPrompt(text) {
  const waitingPrompt = document.getElementById('waitingPrompt');
  if (waitingPrompt) {
    waitingPrompt.innerText = text;
  }
}



export default PlayerSocket;
