import { useState, useEffect, useRef } from 'preact/hooks';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useOnlineGame(playerName) {
  const socketRef = useRef(null);

  const [phase, setPhase] = useState('finding'); // 'finding' | 'matched' | 'playing' | 'round_end' | 'match_end' | 'disconnected'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [mySymbol, setMySymbol] = useState(null);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [roomId, setRoomId] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winTarget, setWinTarget] = useState(3);
  const [winningCombo, setWinningCombo] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // { winner, isDraw, isMatchOver, scores }
  const [matchWinner, setMatchWinner] = useState(null); // 'X' | 'O'
  const [rematchState, setRematchState] = useState('idle'); // 'idle' | 'waiting' | 'offered' | 'declined'
  const [playerNames, setPlayerNames] = useState({ X: '', O: '' });

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('findMatch', { name: playerName });

    socket.on('matchFound', ({ room, symbol, opponent, winTarget: wt }) => {
      setRoomId(room);
      setMySymbol(symbol);
      setOpponentName(opponent);
      setWinTarget(wt);
      setPlayerNames({
        X: symbol === 'X' ? playerName : opponent,
        O: symbol === 'O' ? playerName : opponent,
      });
      setPhase('matched');
      setTimeout(() => setPhase('playing'), 2500);
    });

    socket.on('moveMade', ({ board: newBoard, nextPlayer, winningCombo: combo }) => {
      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
      if (combo) setWinningCombo(combo);
    });

    socket.on('roundEnd', ({ winner, scores: newScores, isDraw, isMatchOver }) => {
      setScores(newScores);
      setRoundResult({ winner, isDraw, isMatchOver });
      setPhase('round_end');
    });

    socket.on('roundStart', ({ board: newBoard, currentPlayer: cp }) => {
      setBoard(newBoard);
      setCurrentPlayer(cp);
      setWinningCombo(null);
      setRoundResult(null);
      setPhase('playing');
    });

    socket.on('matchEnd', ({ winner, scores: finalScores }) => {
      setScores(finalScores);
      setMatchWinner(winner);
      setPhase('match_end');
      setRematchState('idle');
    });

    socket.on('rematchWaiting', () => {
      setRematchState('waiting');
    });

    socket.on('opponentWantsRematch', () => {
      setRematchState('offered');
    });

    socket.on('rematchAccepted', ({ board: newBoard, currentPlayer: cp, scores: newScores }) => {
      setBoard(newBoard);
      setCurrentPlayer(cp);
      setScores(newScores);
      setWinningCombo(null);
      setRoundResult(null);
      setMatchWinner(null);
      setRematchState('idle');
      setPhase('playing');
    });

    socket.on('rematchDeclined', () => {
      setRematchState('declined');
    });

    socket.on('opponentDisconnected', ({ leaverName }) => {
      setOpponentName(leaverName);
      setPhase('disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [playerName]);

  const makeMove = (index) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('makeMove', { room: roomId, index });
  };

  const cancelSearch = () => {
    if (socketRef.current) socketRef.current.emit('cancelSearch');
  };

  const offerRematch = () => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('rematchOffer', { room: roomId });
    setRematchState('waiting');
  };

  const declineRematch = () => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('rematchDecline', { room: roomId });
  };

  return {
    phase,
    board,
    currentPlayer,
    mySymbol,
    opponentName,
    scores,
    winTarget,
    winningCombo,
    roundResult,
    matchWinner,
    rematchState,
    playerNames,
    makeMove,
    cancelSearch,
    offerRematch,
    declineRematch,
  };
}
