import { gameButton, initializeGameMode, score } from "../Pong.js";

const tournamentState = { players: [], currentMatchIndex: 0, tournamentWinners: [] };
export let player1 = "empty";
export let player2 = "empty";
export let isTournament = false;

const SELECTORS = {
  promptContainer: "promptContainer",
  startMatchButton: "startMatchButton",
  winnerPrompt: "winnerPrompt",
};

export function startTournament() {
  const numPlayersNeeded = 4;
  const players = [];
  isTournament = true;

  for (let i = 1; i <= numPlayersNeeded; i++) {
    const playerName = prompt(`Enter name for Player ${i}`);
    if (playerName) {
      players.push({ name: playerName, socket: null });
    } else {
      console.error('Player name not provided');
      initializeGameMode('demo');
      gameButton.showVsOnlineButton();
      return;
    }
  }

  shuffleArray(players);
  tournamentState.players = players;

  initiateNextMatch();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function initiateNextMatch() {
  const { currentMatchIndex, players } = tournamentState;

  if (currentMatchIndex * 2 + 1 < players.length) {
    [player1, player2] = [players[currentMatchIndex * 2], players[currentMatchIndex * 2 + 1]];

    console.log(`Match ${currentMatchIndex + 1}: ${player1.name} vs ${player2.name}`);
    showMatchPrompt(player1, player2, () => {
      tournamentState.currentMatchIndex++;
      initializeGameMode('vsLocal');
    });
  }
}

function showMatchPrompt(player1, player2, startMatchCallback) {
  const matchInfo = `Next Match: ${player1.name} vs ${player2.name}`;
  const promptContainer = document.getElementById(SELECTORS.promptContainer);

  if (!promptContainer) {
    console.error(`Error: "${SELECTORS.promptContainer}" not found in the HTML.`);
    return;
  }

  promptContainer.innerHTML = "";
  const matchInfoElement = document.createElement("div");
  matchInfoElement.textContent = matchInfo;
  promptContainer.appendChild(matchInfoElement);

  const startButton = document.createElement("button");
  startButton.textContent = "Start Match";
  startButton.id = SELECTORS.startMatchButton;
  promptContainer.appendChild(startButton);

  startButton.addEventListener("click", async () => {
    startButton.remove();
    await startMatchCallback();
    const winner = await waitForWinner();
    registerTournamentWinner(winner);
    score.winner = null;
    initiateNextMatch();
  });
}

async function waitForWinner() {
  return new Promise((resolve) => {
    const checkWinnerInterval = setInterval(() => {
      if (score.winner) {
        const winner = score.winner || "No winner";
        clearInterval(checkWinnerInterval);
        resolve(winner);
      }
    }, 1000);
  });
}

function registerTournamentWinner(winner) {
  tournamentState.tournamentWinners.push(winner);

  if (tournamentState.tournamentWinners.length === 2) {
    setTimeout(initiateFinalMatch, 1000);
  } else if (tournamentState.tournamentWinners.length > 2) {
    console.log(`Winner of the current match: ${winner}`);
  }
}

function initiateFinalMatch() {
  player1 = { name: tournamentState.tournamentWinners[0].name };
  player2 = { name: tournamentState.tournamentWinners[1].name };
  showMatchPrompt(player1, player2, async () => {
    initializeGameMode('vsLocal');
    const finalWinner = await waitForWinner();
    displayTournamentWinner();
  });
}

function displayTournamentWinner() {
  const winner = tournamentState.tournamentWinners[0];
  const pongCanvas = document.getElementById(SELECTORS.winnerPrompt);

  if (!pongCanvas) {
    console.error(`Error: "${SELECTORS.winnerPrompt}" not found in the HTML.`);
    return;
  }

  const winnerTextDiv = document.createElement("div");
  winnerTextDiv.textContent = `*****Tournament Winner*****`;
  pongCanvas.appendChild(winnerTextDiv);
  gameButton.showVsOnlineButton();
}