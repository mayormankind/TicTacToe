import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const WIN_TARGET = 3;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combination: combo };
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null);
}

const waitingPlayers = [];
const activeGames = new Map();
const rematchOffers = new Map(); // roomId -> Set of socket ids who offered

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('findMatch', ({ name }) => {
    console.log(`${name} is looking for a match`);

    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.shift();
      const roomId = `room-${Date.now()}`;

      const game = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        nextStarter: 'O',
        scores: { X: 0, O: 0 },
        players: {
          X: { id: socket.id, name },
          O: { id: opponent.id, name: opponent.name },
        },
        phase: 'playing',
      };

      activeGames.set(roomId, game);
      socket.join(roomId);
      opponent.socket.join(roomId);

      socket.emit('matchFound', { room: roomId, symbol: 'X', opponent: opponent.name, winTarget: WIN_TARGET });
      opponent.socket.emit('matchFound', { room: roomId, symbol: 'O', opponent: name, winTarget: WIN_TARGET });

      console.log(`Match created: ${name} vs ${opponent.name} in ${roomId}`);
    } else {
      waitingPlayers.push({ id: socket.id, name, socket });
      console.log(`${name} added to waiting list`);
    }
  });

  socket.on('makeMove', ({ room, index }) => {
    const game = activeGames.get(room);
    if (!game || game.phase !== 'playing') return;

    const playerSymbol = game.players.X.id === socket.id ? 'X' : 'O';
    if (game.currentPlayer !== playerSymbol) return;
    if (game.board[index] !== null) return;

    game.board[index] = playerSymbol;
    game.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';

    const winResult = checkWinner(game.board);
    const isDraw = !winResult && checkDraw(game.board);

    if (winResult || isDraw) {
      game.phase = 'between_rounds';

      const roundWinner = winResult ? winResult.winner : null;
      if (roundWinner) game.scores[roundWinner]++;

      const isMatchOver = roundWinner && game.scores[roundWinner] >= WIN_TARGET;

      io.to(room).emit('moveMade', {
        board: game.board,
        nextPlayer: game.currentPlayer,
        winningCombo: winResult ? winResult.combination : null,
      });

      io.to(room).emit('roundEnd', {
        winner: roundWinner,
        scores: { ...game.scores },
        isDraw,
        isMatchOver,
      });

      if (isMatchOver) {
        game.phase = 'finished';
        setTimeout(() => {
          io.to(room).emit('matchEnd', { winner: roundWinner, scores: { ...game.scores } });
        }, 2500);
      } else {
        setTimeout(() => {
          const starter = game.nextStarter;
          game.board = Array(9).fill(null);
          game.currentPlayer = starter;
          game.nextStarter = starter === 'X' ? 'O' : 'X';
          game.phase = 'playing';
          io.to(room).emit('roundStart', { board: game.board, currentPlayer: game.currentPlayer });
        }, 3000);
      }
    } else {
      io.to(room).emit('moveMade', {
        board: game.board,
        nextPlayer: game.currentPlayer,
        winningCombo: null,
      });
    }
  });

  socket.on('rematchOffer', ({ room }) => {
    const game = activeGames.get(room);
    if (!game) return;

    if (!rematchOffers.has(room)) rematchOffers.set(room, new Set());
    rematchOffers.get(room).add(socket.id);

    const opponentId = game.players.X.id === socket.id ? game.players.O.id : game.players.X.id;

    if (rematchOffers.get(room).size === 2) {
      rematchOffers.delete(room);
      game.board = Array(9).fill(null);
      game.currentPlayer = 'X';
      game.nextStarter = 'O';
      game.scores = { X: 0, O: 0 };
      game.phase = 'playing';
      io.to(room).emit('rematchAccepted', { board: game.board, currentPlayer: game.currentPlayer, scores: game.scores });
    } else {
      socket.emit('rematchWaiting');
      io.to(opponentId).emit('opponentWantsRematch');
    }
  });

  socket.on('rematchDecline', ({ room }) => {
    io.to(room).emit('rematchDeclined');
    rematchOffers.delete(room);
    activeGames.delete(room);
  });

  socket.on('cancelSearch', () => {
    const idx = waitingPlayers.findIndex(p => p.id === socket.id);
    if (idx !== -1) waitingPlayers.splice(idx, 1);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) waitingPlayers.splice(waitingIndex, 1);

    for (const [roomId, game] of activeGames.entries()) {
      if (game.players.X.id === socket.id || game.players.O.id === socket.id) {
        const isX = game.players.X.id === socket.id;
        const opponentId = isX ? game.players.O.id : game.players.X.id;
        const leaverName = isX ? game.players.X.name : game.players.O.name;
        io.to(opponentId).emit('opponentDisconnected', { leaverName });
        activeGames.delete(roomId);
        rematchOffers.delete(roomId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🎮 Pick n' Toe Server running on port ${PORT}`);
});
