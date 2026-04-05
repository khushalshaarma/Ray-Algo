# Raymond's Tree-Based Mutual Exclusion Algorithm Simulator

A full-stack interactive simulation of Raymond's tree-based mutual exclusion algorithm for distributed systems.

![Raymond's Algorithm](https://img.shields.io/badge/Algorithm-Raymond's-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)

## 🌳 What is Raymond's Algorithm?

Raymond's Algorithm is a distributed mutual exclusion algorithm that uses a spanning tree structure to coordinate access to a critical section among multiple nodes in a distributed system.

### Key Concepts:

1. **Tree Structure**: Nodes are arranged in a logical tree topology
2. **Token**: A single token circulates granting access to critical section
3. **Request Queue**: Each node maintains a FIFO queue of pending requests
4. **Holder**: Each node knows who currently holds the token (its parent in the tree)

### How It Works:

1. **Requesting Critical Section**:
   - Node checks if it has the token
   - If not, it adds request to queue and sends request to its holder
   - Holder forwards request if needed

2. **Token Passing**:
   - When holder receives request and doesn't need token, it passes token
   - Token moves along tree edges toward requesting node

3. **Releasing Critical Section**:
   - Node executes critical section
   - Processes queued requests in FIFO order
   - Passes token to next requester if any

### Algorithm Properties:

- **Mutual Exclusion**: Only one node can be in critical section at a time
- **Deadlock-Free**: No circular waiting conditions
- **Fairness**: FIFO ordering of requests
- **Message Complexity**: O(log N) messages per critical section entry

## 🚀 Quick Start

### Prerequisites

- Node.js 18+

### Running the Application

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**2. Open the Frontend:**
Simply open `frontend/index.html` in a web browser.

> Note: The frontend uses CDN-based dependencies, so no npm install is needed for the frontend.

### Alternative Frontend Setup (with Vite)

If you prefer a build-based frontend:
```bash
cd frontend
npm install
npm run dev
```
Then open `http://localhost:5173`

## 📁 Project Structure

```
raymond-algorithm-simulator/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   ├── TreeManager.js    # Tree structure management
│   │   └── Node.js           # Node class
│   └── package.json
├── frontend/
│   ├── index.html            # Main HTML (CDN-based, no build needed)
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── components/       # UI components
│   │   └── styles/           # CSS styles
│   └── package.json          # Optional Vite setup
├── README.md
└── package.json
```

## 🎮 How to Use

### 1. Start the System
- Open `frontend/index.html` in your browser
- Backend should be running on port 3001
- Click "Create Sample Tree" to generate a default 7-node tree

### 2. Visualize
- Nodes appear as circles with labels (A, B, C...)
- Tree connections shown as lines
- Token holder has a glowing cyan animation
- Request queues displayed on each node
- Nodes in critical section glow green

### 3. Trigger Requests
- Click on any node button to request critical section
- Click on node in CS to release it
- Watch token pass through tree structure
- See request queues fill and drain

### 4. Monitor
- Logs panel shows every algorithm step in real-time
- Metrics show message count and waiting times
- Queue status panel shows per-node queue states

## 🔌 API Endpoints

### Backend (Express)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get current system state |
| POST | `/api/tree` | Create new tree structure |
| POST | `/api/request/:nodeId` | Request critical section |
| POST | `/api/release/:nodeId` | Release critical section |
| POST | `/api/reset` | Reset simulation |
| GET | `/api/logs` | Get execution logs |
| GET | `/api/metrics` | Get performance metrics |
| POST | `/api/clear-logs` | Clear execution logs |

## 📊 Metrics Tracked

- **Total Messages**: Number of token/request messages passed
- **Total Requests**: Number of critical section requests
- **Average Waiting Time**: Average time nodes wait for CS
- **Queue Length**: Current queue size per node

## 🎨 UI Features

- **Dark Theme**: Modern glassmorphism design
- **Real-time Updates**: Auto-refresh every 500ms
- **Animations**: Smooth token movement and glow effects
- **Responsive**: Works on desktop and tablet
- **Interactive Tree**: Click nodes to interact

## 🔬 Node States

Each node can be in one of these states:

1. **IDLE**: Not requesting, doesn't need token
2. **HELD**: Holding the token but not in critical section
3. **WANTED**: Wants to enter critical section, waiting for token
4. **IN_CS**: Currently executing critical section

## 📝 Project Files

### Backend Files

- **Node.js**: Node class with state management, request queue, token handling
- **TreeManager.js**: Manages the tree structure, handles algorithm logic, logging, metrics
- **index.js**: Express server with REST API and WebSocket support

### Frontend Files

- **index.html**: Single-file React app with D3.js visualization (CDN-based)
- **src/components/**: React components (for Vite setup)
- **src/styles/App.css**: Global styles

## ⚡ Technical Details

### Backend Stack
- Express.js for REST API
- Socket.IO for WebSocket (optional)
- In-memory state management
- ES6 modules

### Frontend Stack
- React 18 (via CDN or Vite)
- D3.js for tree visualization
- Framer Motion for animations
- CSS Variables for theming

## 📝 License

MIT License - Feel free to use for educational purposes!

## 👨‍💻 Author

Built for educational demonstration of distributed systems algorithms.
