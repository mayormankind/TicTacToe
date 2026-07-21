Pick n' Toe v2 - Implementation Walkthrough
Successfully built a modern, feature-rich Tic-Tac-Toe game from scratch using Preact, Socket.IO, and advanced AI algorithms.
📦 What Was Built
Frontend (Preact + Vite)
Created a component-based architecture with:
Core Components
•	HomePage.jsx - Landing page with mode selection
•	HelpPage.jsx - Game instructions
•	PlayerForm.jsx - Name entry (adapts for 1v1 vs AI)
•	DifficultySelector.jsx - AI difficulty picker
•	GameBoard.jsx - Main game interface
•	OnlineGame.jsx - Multiplayer game handler
•	WinnerScreen.jsx - Victory announcement
Game Logic
•	gameLogic.js - Win detection using WINNING_COMBINATIONS array (8 patterns)
•	ai.js - AI implementation with minimax algorithm
•	useGameState.js - Centralized state management
________________________________________
Backend (Node.js + Socket.IO)
server/index.js - WebSocket server implementing:
•	Matchmaking queue: Automatically pairs waiting players
•	Room management: Creates isolated game rooms
•	Move synchronization: Broadcasts moves to both players in real-time
•	Disconnect handling: Notifies opponent when connection drops
________________________________________
🎯 Key Features Implemented
1. Three Game Modes
One vs One
•	Local multiplayer on the same device
•	Players compete to reach 7 wins first
•	Live scoreboard
•	Turn indicator shows current player
Vs Computer (PickBot)
Three difficulty levels:
•	Easy 😊: Random move selection
•	Medium 🤔: 50% optimal (minimax), 50% random
•	Hard 🔥: Full minimax - unbeatable AI
Battle Online
•	Real-time WebSocket connection
•	Automatic matchmaking
•	"Finding match..." state with spinner
•	Live opponent moves
•	Disconnect detection
________________________________________
2. Advanced AI Implementation
The hard difficulty uses the minimax algorithm - a recursive decision-making algorithm that:
1.	Explores all possible game states
2.	Assumes both players play optimally
3.	Chooses the move with maximum guaranteed outcome
Key advantage over the original: The old version used Math.random() for all AI moves. The new version is strategically competitive.
________________________________________
3. Modern UI/UX
Design Improvements
•	Dark theme with #0a1e28 background
•	Gradient text on the title
•	Glassmorphism effects on modals
•	Smooth animations: Pop-in for moves, fade-in for winner
•	Responsive design: Works on mobile and desktop
CSS Highlights
•	CSS variables for easy theming
•	Hover effects with transform and box-shadow
•	Loading spinner for matchmaking
•	Animated gradient glow on title
________________________________________
🔍 Verification
Setup Commands
# Install frontend dependencies
cd TicTacToe-v2
npm install
# Install backend dependencies
cd server
npm install
Running the Game
# Terminal 1 - Frontend (localhost:5173)
cd TicTacToe-v2
npm run dev
# Terminal 2 - Backend (localhost:3000) [only for online mode]
cd TicTacToe-v2/server
npm start
Manual Testing Checklist
✅ One vs One Mode
•	Enter two player names
•	Play a complete game
•	Verify score increments
•	Test reaching 7 wins (triggers winner screen)
✅ Vs Computer - Easy
•	Bot makes random moves
•	Beatable by any player
✅ Vs Computer - Medium
•	Bot makes decent moves but is beatable
•	Mix of smart and random decisions
✅ Vs Computer - Hard
•	Bot blocks winning moves
•	Bot takes winning opportunities
•	Should be unbeatable (draws are possible)
✅ Online Multiplayer
•	Open two browser windows
•	Enter names in both
•	Verify both get matched
•	Play a game and verify moves sync
•	Close one window and verify disconnect notification
________________________________________
📁 File Structure
TicTacToe-v2/
├── src/
│   ├── components/       # All UI components
│   ├── hooks/           # useGameState.js
│   ├── utils/           # gameLogic.js, ai.js
│   ├── App.jsx          # Main orchestrator
│   ├── main.jsx         # Entry point
│   └── style.css        # Modern CSS
├── server/
│   ├── index.js         # WebSocket server
│   └── package.json
├── index.html
├── vite.config.js
├── package.json
├── README.md
└── .gitignore
________________________________________
🚀 Next Steps
To run and test the game:
1.	Open two terminals
2.	Run npm install in both TicTacToe-v2/ and TicTacToe-v2/server/
3.	Start frontend: npm run dev (from TicTacToe-v2/)
4.	Start backend: npm start (from TicTacToe-v2/server/)
5.	Open http://localhost:5173 in your browser
For online multiplayer testing, open the game in two different browser windows!
________________________________________
✨ Improvements Over Original
Original	v2
Vanilla JS	Modern Preact
Random AI	Minimax algorithm (unbeatable)
No online mode	Real-time multiplayer
Basic CSS	Premium dark theme with animations
Hardcoded win detection (8 loops)	Clean array-based solution
localStorage bug (always cleared)	Proper state management
Unused brain.js dependency	Clean, minimal dependencies