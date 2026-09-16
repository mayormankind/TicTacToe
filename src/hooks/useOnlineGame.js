import { useState, useEffect, useRef } from 'preact/hooks';
import io from 'socket.io-client';
import { playMoveSound, playWinSound, playDrawSound } from '../utils/sounds';

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

/**
 * matchType: 'random' | 'create' | 'join'
 * roomCode:  6-char string (only used when matchType === 'join')
 * onMatchEnd(winner, playerNames): callback to persist the result
 */
export function useOnlineGame(playerName, matchType, roomCode, onMatchEnd) {
  const socketRef = useRef(null);
  // Stable mirror of playerNames so stale-closure event handlers always see the latest value
  const playerNamesRef = useRef({ X: '', O: '' });

  const [phase, setPhase] = useState(() => loadOnlineSession() ? 'rejoining' : 'finding');
  // phases: 'finding' | 'rejoining' | 'waiting_for_friend' | 'joining' |
  //         'matched' | 'playing' | 'round_end' | 'match_end' | 'disconnected' | 'error'

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [mySymbol, setMySymbol] = useState(null);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [roomId, setRoomId] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winTarget, setWinTarget] = useState(7);
  const [winningCombo, setWinningCombo] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [matchWinner, setMatchWinner] = useState(null);
  const [rematchState, setRematchState] = useState('idle');
  const [playerNames, setPlayerNames] = useState({ X: '', O: '' });
  const [privateRoomCode, setPrivateRoomCode] = useState(null); // code shown to host
  const [privateRoomError, setPrivateRoomError] = useState(null);
  const [messages, setMessages] = useState([]);

  const setPlayerNamesAndRef = (names) => {
    playerNamesRef.current = names;
    setPlayerNames(names);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    let matched = false;

    // ── Initial action based on match type ──
    const session = loadOnlineSession();
    if (session) {
      socket.emit('rejoinMatch', { roomId: session.roomId, name: session.playerName, symbol: session.mySymbol });
    } else if (matchType === 'create') {
      socket.emit('createPrivateRoom', { name: playerName });
      setPhase('waiting_for_friend');
    } else if (matchType === 'join') {
      socket.emit('joinPrivateRoom', { name: playerName, code: roomCode });
      setPhase('joining');
    } else {
      socket.emit('findMatch', { name: playerName });
    }

    // ── Error: can't reach the server ──
    socket.on('connect_error', () => {
      if (!matched) setPhase('error');
    });

    // ── Timeout: searching too long with no opponent ──
    const searchTimeout = setTimeout(() => {
      if (!matched && (matchType === 'random' || !matchType)) setPhase('error');
    }, SEARCH_TIMEOUT_MS);

    // ── Rejoin ──
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
      // opponent reconnected — game resumes naturally
    });

    // ── Private room events ──
    socket.on('privateRoomCreated', ({ code }) => {
      setPrivateRoomCode(code);
      // phase stays 'waiting_for_friend'
    });

    socket.on('privateRoomError', ({ message }) => {
      setPrivateRoomError(message);
      setPhase('finding'); // fall back so the cancel button still works
    });

    // ── Match found (random, private create, private join all use the same event) ──
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
      setPrivateRoomCode(null);
      setPhase('matched');
      setTimeout(() => setPhase('playing'), 2500);
    });

    // ── Board moves ──
    socket.on('moveMade', ({ board: newBoard, nextPlayer, winningCombo: combo }) => {
      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
      if (combo) setWinningCombo(combo);
      playMoveSound();
    });

    // ── Round end ──
    socket.on('roundEnd', ({ winner, scores: newScores, isDraw, isMatchOver }) => {
      setScores(newScores);
      setRoundResult({ winner, isDraw, isMatchOver });
      setPhase('round_end');
      if (isDraw) playDrawSound();
      else playWinSound();
    });

    socket.on('roundStart', ({ board: newBoard, currentPlayer: cp }) => {
      setBoard(newBoard);
      setCurrentPlayer(cp);
      setWinningCombo(null);
      setRoundResult(null);
      setPhase('playing');
    });

    // ── Match end ──
    socket.on('matchEnd', ({ winner, scores: finalScores, playerNames: finalPlayerNames }) => {
      clearOnlineSession();
      setScores(finalScores);
      setMatchWinner(winner);
      setPhase('match_end');
      setRematchState('idle');
      if (onMatchEnd) {
        onMatchEnd(winner, finalPlayerNames || playerNamesRef.current);
      }
    });

    // ── Rematch ──
    socket.on('rematchWaiting', () => setRematchState('waiting'));
    socket.on('opponentWantsRematch', () => setRematchState('offered'));

    socket.on('rematchAccepted', ({ board: newBoard, currentPlayer: cp, scores: newScores }) => {
      setBoard(newBoard);
      setCurrentPlayer(cp);
      setScores(newScores);
      setWinningCombo(null);
      setRoundResult(null);
      setMatchWinner(null);
      setRematchState('idle');
      setMessages([]);
      setPhase('playing');
    });

    socket.on('rematchDeclined', () => setRematchState('declined'));

    // ── Opponent disconnect ──
    socket.on('opponentDisconnected', ({ leaverName }) => {
      clearOnlineSession();
      setOpponentName(leaverName);
      setPhase('disconnected');
    });

    // ── Chat ──
    socket.on('chatMessage', ({ name, text }) => {
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), name, text }]);
    });

    return () => {
      clearTimeout(searchTimeout);
      socket.disconnect();
    };
  }, [playerName, matchType, roomCode]);

  // ── Actions ──
  const makeMove = (index) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('makeMove', { room: roomId, index });
  };

  const cancelSearch = () => {
    if (socketRef.current) {
      socketRef.current.emit('cancelSearch');
      if (privateRoomCode) socketRef.current.emit('cancelPrivateRoom', { code: privateRoomCode });
    }
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

  const sendMessage = (text) => {
    if (!socketRef.current || !roomId || !text.trim()) return;
    socketRef.current.emit('chatMessage', { room: roomId, text: text.slice(0, 200) });
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
    privateRoomCode,
    privateRoomError,
    messages,
    makeMove,
    cancelSearch,
    offerRematch,
    declineRematch,
    sendMessage,
  };
}
