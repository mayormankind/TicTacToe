import { useState, useEffect } from 'preact/hooks';
import io from 'socket.io-client';
import { checkWinner, checkDraw } from '../utils/gameLogic';

const SOCKET_URL = 'http://localhost:3000';

export function OnlineGame({ playerName, onBackToMenu }) {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('finding'); // 'finding', 'playing', 'finished'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [mySymbol, setMySymbol] = useState(null);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [winner, setWinner] = useState(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('findMatch', playerName);

    newSocket.on('matchFound', ({ room, symbol, opponent }) => {
      setRoomId(room);
      setMySymbol(symbol);
      setOpponentName(opponent);
      setGameState('playing');
    });

    newSocket.on('moveMade', ({ board: newBoard, nextPlayer }) => {
      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
      
      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setGameState('finished');
      } else if (checkDraw(newBoard)) {
        setWinner('Draw');
        setGameState('finished');
      }
    });

    newSocket.on('opponentDisconnected', () => {
      alert('Opponent disconnected');
      onBackToMenu();
    });

    return () => {
      newSocket.close();
    };
  }, [playerName, onBackToMenu]);

  const handleCellClick = (index) => {
    if (board[index] || currentPlayer !== mySymbol || gameState !== 'playing') return;
    
    socket.emit('makeMove', { room: roomId, index });
  };

  if (gameState === 'finding') {
    return (
      <div class="online-game finding">
        <h2>Finding Match...</h2>
        <div class="spinner"></div>
        <button onClick={onBackToMenu}>Cancel</button>
      </div>
    );
  }

  if (gameState === 'finished') {
    const resultText = winner === 'Draw' 
      ? "It's a Draw!" 
      : winner === mySymbol 
        ? 'You Win!' 
        : 'You Lose!';
    
    return (
      <div class="winner-page">
        <p class="winner-quote">{resultText}</p>
        <div class="actions">
          <button onClick={onBackToMenu}>Back to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <main class="app">
      <div class="counter">
        <h3 class="playerX">{mySymbol === 'X' ? playerName : opponentName}</h3>
        <div class="livescore">
          <span>VS</span>
        </div>
        <h3 class="playerO">{mySymbol === 'O' ? playerName : opponentName}</h3>
      </div>
      
      <div class="game-container">
        {board.map((cell, index) => (
          <div
            key={index}
            class={`box ${cell ? 'filled' : 'unfilled'}`}
            onClick={() => handleCellClick(index)}
          >
            {cell && <span class="tag">{cell}</span>}
          </div>
        ))}
      </div>

      <div class="turn-indicator">
        <p>{currentPlayer === mySymbol ? "Your turn" : `${opponentName}'s turn`}</p>
      </div>
    </main>
  );
}
