import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.get('/', (_, res) => res.send('TicTacToe Server Running'));

// ── Game rules ─────────────────────────────────────────────────────────────
// Keep WIN_TARGET in sync with the default in src/components/PlayerForm.jsx
const WIN_TARGET = 7;

// Keep these in sync with src/utils/gameLogic.js
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combination: [a, b, c] };
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null);
}

// ── In-memory state ─────────────────────────────────────────────────────────
const activeGames = new Map();    // roomId -> game object
const waitingPlayers = [];        // sockets waiting for random matchmaking
const privateRooms = new Map();   // code -> { id, name, socket }

// ── Helpers ─────────────────────────────────────────────────────────────────
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function startGame(socketX, nameX, socketO, nameO) {
  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const game = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    nextStarter: 'O',
    scores: { X: 0, O: 0 },
    players: {
      X: { id: socketX.id, name: nameX },
      O: { id: socketO.id, name: nameO },
    },
    phase: 'playing',
  };

  activeGames.set(roomId, game);
  socketX.join(roomId);
  socketO.join(roomId);

  const payload = { room: roomId, winTarget: WIN_TARGET };
  socketX.emit('matchFound', { ...payload, symbol: 'X', opponent: nameO });
  socketO.emit('matchFound', { ...payload, symbol: 'O', opponent: nameX });

  return roomId;
}

// ── Socket handlers ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  // ── Random matchmaking ──
  socket.on('findMatch', ({ name }) => {
    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.shift();
      if (!opponent.connected) {
        waitingPlayers.unshift({ socket, name }); // put self back and retry next connection
        return;
      }
      startGame(opponent.socket, opponent.name, socket, name);
    } else {
      waitingPlayers.push({ socket, name });
    }
  });

  // ── Private room: create ──
  socket.on('createPrivateRoom', ({ name }) => {
    // Clean up any previous room this socket owns
    for (const [code, data] of privateRooms.entries()) {
      if (data.id === socket.id) privateRooms.delete(code);
    }

    let code = generateRoomCode();
    while (privateRooms.has(code)) code = generateRoomCode();

    privateRooms.set(code, { id: socket.id, name, socket });
    socket.emit('privateRoomCreated', { code });
  });

  // ── Private room: join ──
  socket.on('joinPrivateRoom', ({ name, code }) => {
    const normalized = (code || '').toUpperCase().trim();
    const host = privateRooms.get(normalized);

    if (!host) {
      socket.emit('privateRoomError', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (host.id === socket.id) {
      socket.emit('privateRoomError', { message: 'You cannot join your own room.' });
      return;
    }

    privateRooms.delete(normalized);
    startGame(host.socket, host.name, socket, name);
  });

  // ── Private room: cancel ──
  socket.on('cancelPrivateRoom', ({ code }) => {
    const normalized = (code || '').toUpperCase().trim();
    if (privateRooms.get(normalized)?.id === socket.id) {
      privateRooms.delete(normalized);
    }
  });

  // ── Move ──
  socket.on('makeMove', ({ room, index }) => {
    const game = activeGames.get(room);
    if (!game || game.phase !== 'playing') return;

    const playerSymbol = game.players.X.id === socket.id ? 'X' : 'O';
    if (playerSymbol !== game.currentPlayer) return;
    if (game.board[index] !== null) return;

    game.board[index] = playerSymbol;
    game.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';

    const winResult = checkWinner(game.board);
    const isDraw = !winResult && checkDraw(game.board);

    io.to(room).emit('moveMade', {
      board: game.board,
      nextPlayer: game.currentPlayer,
      winningCombo: winResult ? winResult.combination : null,
    });

    if (winResult || isDraw) {
      game.phase = 'between_rounds';
      if (winResult) game.scores[winResult.winner]++;

      const isMatchOver = winResult && game.scores[winResult.winner] >= WIN_TARGET;

      io.to(room).emit('roundEnd', {
        winner: winResult ? winResult.winner : null,
        isDraw,
        scores: game.scores,
        isMatchOver,
      });

      if (isMatchOver) {
        game.phase = 'finished';
        const playerNames = {
          X: game.players.X.name,
          O: game.players.O.name,
        };
        io.to(room).emit('matchEnd', {
          winner: winResult.winner,
          scores: game.scores,
          playerNames,
        });
        activeGames.delete(room);
      } else {
        // Start next round
        setTimeout(() => {
          game.board = Array(9).fill(null);
          game.currentPlayer = game.nextStarter;
          game.nextStarter = game.nextStarter === 'X' ? 'O' : 'X';
          game.phase = 'playing';
          io.to(room).emit('roundStart', {
            board: game.board,
            currentPlayer: game.currentPlayer,
          });
        }, 3000);
      }
    }
  });

  // ── Rejoin after disconnect ──
  socket.on('rejoinMatch', ({ roomId, name, symbol }) => {
    const game = activeGames.get(roomId);
    if (!game) {
      socket.emit('rejoinFailed');
      return;
    }

    const oldId = game.players[symbol].id;
    game.players[symbol].id = socket.id;
    socket.join(roomId);

    const opponentSymbol = symbol === 'X' ? 'O' : 'X';
    socket.emit('rejoinSuccess', {
      room: roomId,
      symbol,
      opponent: game.players[opponentSymbol].name,
      winTarget: WIN_TARGET,
      board: game.board,
      currentPlayer: game.currentPlayer,
      scores: game.scores,
      phase: game.phase,
      playerNames: { X: game.players.X.name, O: game.players.O.name },
    });

    io.to(roomId).emit('opponentRejoined', { name });
  });

  // ── Rematch ──
  socket.on('rematchOffer', ({ room }) => {
    const game = activeGames.get(room);
    if (!game) {
      // Game was cleaned up — recreate a fresh one
      const newGame = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        nextStarter: 'O',
        scores: { X: 0, O: 0 },
        players: {
          X: { id: socket.id, name: '' },
          O: { id: null, name: '' },
        },
        rematchVotes: new Set([socket.id]),
        phase: 'playing',
      };
      activeGames.set(room, newGame);
      socket.to(room).emit('opponentWantsRematch');
      socket.emit('rematchWaiting');
      return;
    }

    if (!game.rematchVotes) game.rematchVotes = new Set();
    game.rematchVotes.add(socket.id);

    if (game.rematchVotes.size < 2) {
      socket.to(room).emit('opponentWantsRematch');
      socket.emit('rematchWaiting');
      return;
    }

    // Both agreed — restart
    game.board = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.nextStarter = 'O';
    game.scores = { X: 0, O: 0 };
    game.phase = 'playing';
    delete game.rematchVotes;
    activeGames.set(room, game);

    io.to(room).emit('rematchAccepted', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      scores: game.scores,
    });
  });

  socket.on('rematchDecline', ({ room }) => {
    socket.to(room).emit('rematchDeclined');
  });

  // ── Chat ──
  socket.on('chatMessage', ({ room, text }) => {
    const game = activeGames.get(room);
    if (!game) return;

    const playerSymbol = game.players.X.id === socket.id ? 'X' : 'O';
    const senderName = game.players[playerSymbol].name;

    io.to(room).emit('chatMessage', {
      name: senderName,
      text: String(text).slice(0, 200),
    });
  });

  // ── Cancel random search ──
  socket.on('cancelSearch', () => {
    const idx = waitingPlayers.findIndex(p => p.socket.id === socket.id);
    if (idx !== -1) waitingPlayers.splice(idx, 1);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    // Remove from waiting queue
    const idx = waitingPlayers.findIndex(p => p.socket.id === socket.id);
    if (idx !== -1) waitingPlayers.splice(idx, 1);

    // Remove any private room this socket owns
    for (const [code, data] of privateRooms.entries()) {
      if (data.id === socket.id) privateRooms.delete(code);
    }

    // Notify opponent in active game
    for (const [roomId, game] of activeGames.entries()) {
      const leaverSymbol = game.players.X.id === socket.id ? 'X' :
                           game.players.O.id === socket.id ? 'O' : null;
      if (!leaverSymbol) continue;

      const leaverName = game.players[leaverSymbol].name;
      game.players[leaverSymbol].id = null;

      // Give the player 10 seconds to rejoin before notifying opponent
      setTimeout(() => {
        const currentGame = activeGames.get(roomId);
        if (!currentGame) return;
        if (currentGame.players[leaverSymbol].id === null) {
          // Still disconnected — inform opponent
          const opponentSymbol = leaverSymbol === 'X' ? 'O' : 'X';
          const opponentId = currentGame.players[opponentSymbol].id;
          if (opponentId) {
            io.to(opponentId).emit('opponentDisconnected', { leaverName });
          }
          activeGames.delete(roomId);
        }
      }, 10000);
      break;
    }
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
