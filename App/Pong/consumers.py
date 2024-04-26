# Import required modules
import json
import string
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    playerCount = 0
    ready_players = set()
    player_game_mapping = {}
    game_channels = {}

    @staticmethod
    def generate_random_channel(length=8):
        characters = string.ascii_letters + string.digits
        return ''.join(random.choice(characters) for _ in range(length))

    async def connect(self):
        PongConsumer.playerCount += 1
        await self.accept()
        await self.channel_layer.group_add("PONG", self.channel_name)
        await self.channel_layer.group_send(
            "PONG",
            {
                'type': 'updatePlayerCount',
                'playerCount': PongConsumer.playerCount,
            }
        )

    async def disconnect(self, close_code):
        PongConsumer.playerCount -= 1
        await self.accept()
        await self.channel_layer.group_add("PONG", self.channel_name)
        await self.channel_layer.group_send(
            "PONG",
            {
                'type': 'updatePlayerCount',
                'playerCount': PongConsumer.playerCount,
            }
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            if data['type'] == 'playerReady':
                # Store the information from the playerReady message
                PongConsumer.ready_players.add(self.channel_name)
                PongConsumer.player_game_mapping[self.channel_name] = {
                    'username': data.get('username', 'Unknown'),
                }

                await self.channel_layer.group_send(
                    "PONG",
                    {
                        'type': 'playerReady',
                        'sender': self.channel_name,
                        'username': data.get('username', 'Unknown'),
                    }
                )

                if len(PongConsumer.ready_players) >= 2:
                    players = list(PongConsumer.ready_players)[:2]
                    PongConsumer.ready_players -= set(players)
                    game_channel = self.generate_random_channel()

                    for player in players:
                        await self.channel_layer.group_add(game_channel, player)

                    print(f"Players in game channel {game_channel}: {players}")

                    await self.send(text_data=json.dumps({
                        'type': 'hostMessage',
                        'game_channel': game_channel,
                    }))

                    opponent_channel = [p for p in players if p != self.channel_name][0]

                    # Retrieve the opponent's information from the player_game_mapping
                    opponent_info = PongConsumer.player_game_mapping.get(opponent_channel, {})

                    await self.channel_layer.group_send(
                        game_channel,
                        {
                            'type': 'startGame',
                            'host': data.get('username', 'Unknown'),
                            'opponent_username': opponent_info.get('username', 'Unknown'),
                            'game_channel': game_channel,
                        }
                    )

            elif data['type'] == 'ballPosition':
                # Send ball position only to the game channel
                await self.channel_layer.group_send(
                    data['game_channel'],
                    {
                        'type': 'syncBallPosition',
                        'position': data['position'],
                        'sender': self.channel_name,
                        'game_channel': data['game_channel'],  # Include game_channel key here
                    }
                )

            elif data['type'] == 'paddlePosition':
                # Send paddle position only to the game channel
                await self.channel_layer.group_send(
                    data['game_channel'],
                    {
                        'type': 'syncPaddlePosition',
                        'position': data['position'],
                        'sender': self.channel_name,
                        'game_channel': data['game_channel'],  # Include game_channel key here
                    }
                )

            elif data['type'] == 'cancelReady':
                # Handle cancelReady message
                await self.handle_cancel_ready(data)
            
            elif data['type'] == 'endGame':
                game_channel = data.get('game_channel')
                if game_channel:
                    await self.delete_game_channel(game_channel)
                else:
                    print("Invalid game_channel")

            else:
                print(f"Ignored unsupported message type from {self.channel_name}: {data['type']}")

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON data: {str(e)}")
        except Exception as e:
            print(f"Error processing received data in channel {self.channel_name}: {str(e)} - {data}")

    async def delete_game_channel(self, game_channel):
        players = self.game_channels.get(game_channel, set())

        for player in players:
            await self.channel_layer.group_discard(game_channel, player)

        if game_channel in self.game_channels:
            del self.game_channels[game_channel]
            
        print(f"Deleted game channel {game_channel}")



    async def syncBallPosition(self, event):
        if self.channel_name != event["sender"]:
            # Send the synchronized ball position to the client
            await self.send(text_data=json.dumps({
                'type': 'syncBallPosition',
                'position': event['position'],
                'game_channel': event['game_channel'],
            }))

    async def syncPaddlePosition(self, event):
        if self.channel_name != event["sender"]:
            # Send the synchronized paddle position to the client
            await self.send(text_data=json.dumps({
                'type': 'syncPaddlePosition',
                'position': event['position'],
                'game_channel': event['game_channel'],
            }))


    async def playerReady(self, event):
        # Send back the userName to the opponent
        await self.send(text_data=json.dumps({
            'type': 'playerReady',
            'username': event.get('username', 'Unknown'),
        }))

    async def updatePlayerCount(self, event):
        print ("updateplayercountcalled")
        await self.send(text_data=json.dumps({
            'type': 'updatePlayerCount',
            'playerCount': event['playerCount'],
        }))

    async def startGame(self, event):
        game_channel = event['game_channel']

        if game_channel:
            PongConsumer.player_game_mapping[self.channel_name] = game_channel
            # Print both player usernames in the game channel
            print(f"Players in game channel {game_channel}: Host - {event['host']}, Opponent - {event['opponent_username']}")
            await self.send(text_data=json.dumps({
                'type': 'startGame',
                'host': event['host'],
                'opponent': event['opponent_username'],
                'game_channel': game_channel,
            }))
        else:
            print("Invalid game_channel ERROR")

    async def handle_cancel_ready(self, data):
        print ("cancel ready called !!")
        try:
            # Update data structures to cancel the ready state
            if self.channel_name in PongConsumer.ready_players:
                PongConsumer.ready_players.remove(self.channel_name)
            
            if self.channel_name in PongConsumer.player_game_mapping:
                del PongConsumer.player_game_mapping[self.channel_name]

            # # Send a notification to other players in the group/channel
            # await self.channel_layer.group_send(
            #     "PONG",
            #     {
            #         'type': 'cancelReady',
            #         'sender': self.channel_name,
            #         'username': data.get('username', 'Unknown'),
            #     }
            # )
        except Exception as e:
            print(f"Error handling cancelReady in channel {self.channel_name}: {str(e)}")


@staticmethod
def generate_random_channel(length=8):
    characters = string.ascii_letters + string.digits
    random_channel = ''.join(random.choice(characters) for _ in range(length))
    print(f"Generated random channel: {random_channel}")
    return random_channel
