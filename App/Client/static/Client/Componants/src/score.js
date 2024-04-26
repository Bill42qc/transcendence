// score.js

import playerSocket from "./socket.js"
import { gameButton, gameMode, mySocket } from "../Pong.js";
import { updateWaitingPrompt } from "./socket.js";
import { score } from "../Pong.js";
import { player1, player2 } from "./tournament.js";
import { isTournament } from "./tournament.js";
import {postResult} from "./gameInfo.js";


export class Score {
  constructor() {
    this.winner = null;
    this.scorePaddle1 = 0;
    this.scorePaddle2 = 0;
    var gameActive =false;
    var demoScore = false;
  }

  showWinnerPrompt(winner) {
    const winnerPrompt = document.getElementById("winnerPrompt");
    winnerPrompt.textContent = `${winner} WIN the Game`;
    winnerPrompt.style.display = "block";
  }

  hideWinnerPrompt() {
    const winnerPrompt = document.getElementById("winnerPrompt");
    winnerPrompt.style.display = "none";
  }

  updateScoreDisplay() {
    const scorePaddle1Element = document.getElementById("scorePaddle1");
    const scorePaddle2Element = document.getElementById("scorePaddle2");
    if(isTournament)
    {
      scorePaddle1Element.textContent = `${player1.name}: ${this.scorePaddle1}`;
      scorePaddle2Element.textContent = `${player2.name}: ${this.scorePaddle2}`;
    }
    else if(gameMode === 'vsOnline')
        if(mySocket.isHost){
        scorePaddle1Element.textContent = `${mySocket.userName}: ${this.scorePaddle1}`;
        scorePaddle2Element.textContent = `${mySocket.opponent}: ${this.scorePaddle2}`;
        }
        else
        {
          scorePaddle1Element.textContent = `${mySocket.opponent}: ${this.scorePaddle1}`;
          scorePaddle2Element.textContent = `${mySocket.userName}: ${this.scorePaddle2}`;
        }

    else{
        scorePaddle1Element.textContent = `${mySocket.userName}: ${this.scorePaddle1}`;
        scorePaddle2Element.textContent = `Le Random: ${this.scorePaddle2}`;
      }

  }

  setDemoScore(value){
    this.demoScore = value;
  }

  checkWin(ball, resetBall, mySocket) {
    // ball SCORE
    if (ball.position.x < -200) {
      this.scorePaddle2++;
      resetBall();
    }

    if (ball.position.x > 200) {
      this.scorePaddle1++;
      resetBall();
    }

    if(this.demoScore === true)
    {
      this.updateScoreDisplay();
      return;
    }  

if (this.scorePaddle1 === 3) {
  if(this.gameActive){
  mySocket.sendMessage({
    type: 'endGame',
    game_channel: mySocket.gameChannel,
  });
  if(isTournament && player1){
    this.winner = player1;
    this.showWinnerPrompt(Player1.name);
  }
  else if(gameMode === 'vsOnline')
  {
    this.showWinnerPrompt(mySocket.userName);
    postResult(mySocket.opponent, "Win");
    this.scorePaddle1 = "Winner ";
    this.scorePaddle2 = "Looser ";
    mySocket.gameChannel = "N/A"



  }
  else
  this.showWinnerPrompt(mySocket.userName);}
  this.gameActive = false;
  updateWaitingPrompt("Well Played");
  if(!isTournament)
    gameButton.showVsOnlineButton();
  if(gameMode === 'vsAi' || gameMode === 'vsLocal' || gameMode === 'vsOnline')
  {
  this.scorePaddle1 = "Winner ";
  this.scorePaddle2 = "Looser ";
  }


} 

else if (this.scorePaddle2 === 3) {
  if(this.gameActive){
  mySocket.sendMessage({
    type: 'endGame',
    game_channel: mySocket.gameChannel,
  });
  if(isTournament && player2){
    this.winner = player2;
    this.showWinnerPrompt(player2.name);
  }
  else if(gameMode === 'vsOnline')
  {
    this.showWinnerPrompt(mySocket.opponent);
    postResult(mySocket.opponent, "Lost");
    this.scorePaddle1 = "Looser ";
    this.scorePaddle2 = "Winner ";
    mySocket.gameChannel = "N/A"

  }
  else
  this.showWinnerPrompt("Le Random");
}
  this.gameActive = false;
  updateWaitingPrompt("Well Played");
  if(!isTournament)
    gameButton.showVsOnlineButton();
  if(gameMode === 'vsAi' || gameMode === 'vsLocal' || gameMode === 'vsOnline')
  {
    this.scorePaddle1 = "Looser ";
    this.scorePaddle2 = "Winner ";
  }

  
    }
  

    this.updateScoreDisplay();
  }
}

export default Score;