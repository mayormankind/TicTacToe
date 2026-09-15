import { useState, useEffect, useRef } from 'preact/hooks';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const ONLINE_SESSION_KEY = 'ttt_online_session';
const SEARCH_TIMEOUT_MS = 12000;

function saveOnlineSession(data) {
  try { sessionStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify(data)); } catch {}
}
function loadOnlineSession() {
  try {
    const s = sessionStorage.getItem(ONLINE_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function clearOnlineSession() {
  try { sessionStorage.removeItem(ONLINE_SESSION_KEY); } catch {}
}

export function useOnlineGame(playerName, onMatchEnd) {
  const socketRef = useRef(null);
  // Mirror of playerNames state kept in a ref so matchEnd handler
  // (registered once on mount) always reads the latest value.
  const playerNamesRef = useRef({ X: '', O: '' });

  const [phase, setPhase] = useState(() => loadOnlineSession() ? 'rejoining' : 'finding'); // 'finding' | 'rejoining' | 'matched' | 'playing' | 'round_end' | 'match_end' | 'disconnected' | 'error'
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

  const setPlayerNamesAndRef = (names) => {
    playerNamesRef.current = names;
    setPlayerNames(names);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    let matched = false;

    const session = loadOnlineSession();
    if (session) {
      socket.emit('rejoinMatch', { roomId: session.roomId, name: session.playerName, symbol: session.mySymbol });
    } else {
      socket.emit('findMatch', { name: playerName });
    }

    // Show error if we can't connect to the server at all
    socket.on('connect_error', () => {
      if (!matched) setPhase('error');
    });

    // Show error if we've been searching too long with no match
    const searchTimeout = setTimeout(() => {
      if (!matched) setPhase('error');
    }, SEARCH_TIMEOUT_MS);

    socket.on('rejoinSuccess', ({ room, symbol, opponent, winTarget: wt, board: b, currentPlayer: cp, scores: s, phase: p, playerNames: pn }) => {
      matched = true;
      clearTimeout(searchTimeout);
      setRoomId(room);
      setMySymbol(symbol);
      setOpponentName(opponent);
      setWinTarget(wt);
      setBoard(b);
      setCurrentPlayer(cp);
      setScores(s);
      setPlayerNamesAndRef(pn);
      const clientPhase = p === 'finished' ? 'match_end' : p === 'between_rounds' ? 'playing' : p;
      setPhase(clientPhase);
    });

    socket.on('rejoinFailed', () => {
      clearOnlineSession();
      socket.emit('findMatch', { name: playerName });
      setPhase('finding');
    });

    socket.on('opponentRejoined', () => {
      // opponent came back — no UI change needed, game resumes naturally
    });

    socket.on('matchFound', ({ room, symbol, opponent, winTarget: wt }) => {
      matched = true;
      clearTimeout(searchTimeout);
      saveOnlineSession({ roomId: room, mySymbol: symbol, playerName });
      setRoomId(room);
      setMySymbol(symbol);
      setOpponentName(opponent);
      setWinTarget(wt);
      const names = {
        X: symbol === 'X' ? playerName : opponent,
        O: symbol === 'O' ? playerName : opponent,
      };
      setPlayerNamesAndRef(names);
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

    socket.on('matchEnd', ({ winner, scores: finalScores, playerNames: finalPlayerNames }) => {
      clearOnlineSession();
      setScores(finalScores);
      setMatchWinner(winner);
      setPhase('match_end');
      setRematchState('idle');
      // Save the completed online match to history
      if (onMatchEnd) {
        const names = finalPlayerNames || playerNamesRef.current;
        onMatchEnd(winner, names);
      }
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
      clearOnlineSession();
      setOpponentName(leaverName);
      setPhase('disconnected');
    });

    return () => {
      clearTimeout(searchTimeout);
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
