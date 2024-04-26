import { mySocket } from "../Pong.js";

export function setGameInfo() {
  // Assuming you want to modify the "gameInfo" section
  const playersOnlineElement = document.getElementById('playersOnline');
  // const userInfoElement = document.getElementById('userInfo');
  // const gameChannelInfoElement = document.getElementById('gameChannelInfo');
  // const opponentInfoElement = document.getElementById('opponentInfo');

  // Check if the elements exist before updating their content
  if (playersOnlineElement ) {
    // Update the innerHTML or innerText property based on your needs
    playersOnlineElement.innerText = `Players Online: ${mySocket.connectedPlayers}`;
    // userInfoElement.innerText = `User: ${mySocket.userName}`;
    // gameChannelInfoElement.innerText = `gameChannel: ${mySocket.gameChannel}`;
    // opponentInfoElement.innerText = `Opponent: ${mySocket.opponent}`;
  }
}

export async function getUserInfo() {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("Token not found");
    }

    const response = await fetch("/api/user/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const userData = await response.json();
    mySocket.userName = userData.username;
  } catch (error) {
    console.error("Error fetching user DATA:", error);
  }
}

//result = W or L   to know if the host has win
//opponent who play vs host (his username)
export async function postResult(opponent, result){
      // try catch to send match result to db
      try {
        const response = await fetch("/api/update_match/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ opponent, result }),
        });
      }
      catch(error){console.error("match result post,", error)};
}

export async function updateOnlineStatus(){
  try {
    const response = await fetch("/api/update_online_status/", {
      method: "PUT",
    });
  } catch (error) {
    console.error("Update online status error:", error);
  }
}