import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store waiting players and active games
const waitingPlayers = [];
const activeGames = new Map();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Handle match finding
  socket.on('findMatch', (playerName) => {
    console.log(`${playerName} is looking for a match`);

    // Check if there's a waiting player
    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.shift();
      const roomId = `room-${socket.id}-${opponent.id}`;

      // Create a new game
      const gameState = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        players: {
          X: { id: socket.id, name: playerName },
          O: { id: opponent.id, name: opponent.name }
        }
      };

      activeGames.set(roomId, gameState);

      // Add both players to the room
      socket.join(roomId);
      opponent.socket.join(roomId);

      // Notify both players
      socket.emit('matchFound', {
        room: roomId,
        symbol: 'X',
        opponent: opponent.name
      });

      opponent.socket.emit('matchFound', {
        room: roomId,
        symbol: 'O',
        opponent: playerName
      });

      console.log(`Match created: ${playerName} vs ${opponent.name} in ${roomId}`);
    } else {
      // Add to waiting list
      waitingPlayers.push({
        id: socket.id,
        name: playerName,
        socket: socket
      });
      console.log(`${playerName} added to waiting list`);
    }
  });

  // Handle moves
  socket.on('makeMove', ({ room, index }) => {
    const game = activeGames.get(room);
    if (!game) return;

    // Validate it's the player's turn
    const playerSymbol = game.players.X.id === socket.id ? 'X' : 'O';
    if (game.currentPlayer !== playerSymbol) return;

    // Make the move
    game.board[index] = playerSymbol;
    game.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';

    // Broadcast the new board state to both players
    io.to(room).emit('moveMade', {
      board: game.board,
      nextPlayer: game.currentPlayer
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Remove from waiting list if present
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    // Notify opponent if in an active game
    for (const [roomId, game] of activeGames.entries()) {
      if (game.players.X.id === socket.id || game.players.O.id === socket.id) {
        const opponentId = game.players.X.id === socket.id 
          ? game.players.O.id 
          : game.players.X.id;
        
        io.to(opponentId).emit('opponentDisconnected');
        activeGames.delete(roomId);
      }
    }
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🎮 Pick n' Toe Server running on port ${PORT}`);
});
