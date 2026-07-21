# Pick n' Toe v2 🎮

A modern, feature-rich Tic-Tac-Toe game built with Preact, featuring AI opponents with multiple difficulty levels and online multiplayer.

## ✨ Features

- **One vs One**: Local multiplayer mode - play with a friend on the same device
- **Vs Computer**: Play against PickBot with three difficulty levels:
  - **Easy** 😊: Random moves
  - **Medium** 🤔: Mix of smart and random moves
  - **Hard** 🔥: Unbeatable AI using minimax algorithm
- **Battle Online**: Real-time multiplayer - find and play against opponents online
- **Modern UI**: Dark theme with smooth animations and responsive design
- **Score Tracking**: Keep track of wins across multiple rounds

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install frontend dependencies**:
```bash
cd TicTacToe-v2
npm install
```

2. **Install backend dependencies** (for online multiplayer):
```bash
cd server
npm install
```

### Running the Game

1. **Start the frontend**:
```bash
# From TicTacToe-v2 directory
npm run dev
```
The game will open at `http://localhost:5173`

2. **Start the backend** (only needed for online multiplayer):
```bash
# In a separate terminal, from TicTacToe-v2/server directory
npm start
```
The server will run on `http://localhost:3000`

## 🎯 How to Play

1. **One vs One**: Enter both player names and compete to reach 7 wins first
2. **Vs Computer**: Choose your difficulty, enter your name, and play against PickBot
3. **Battle Online**: Enter your name and get matched with an online opponent

## 🏗️ Project Structure

```
TicTacToe-v2/
├── src/
│   ├── components/       # Preact components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Game logic and AI
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── style.css        # Styles
├── server/              # Backend for multiplayer
│   ├── index.js         # WebSocket server
│   └── package.json
├── index.html
├── vite.config.js
└── package.json
```

## 🧠 Technologies

- **Frontend**: Preact, Vite
- **Backend**: Node.js, Express, Socket.IO
- **AI**: Minimax algorithm for optimal play
- **Styling**: Modern CSS with animations

## 🎨 Design Features

- Dark theme with gradient accents
- Smooth animations and transitions
- Responsive layout for mobile and desktop
- Glassmorphism effects
- Custom winner celebration screen

---

Built with ❤️ using Preact
