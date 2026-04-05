import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TreeManager } from './TreeManager.js';

console.log('Starting server...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Creating Express app...');
const app = express();
console.log('Creating HTTP server...');
const server = createServer(app);
console.log('Creating Socket.IO...');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'DELETE']
  }
});

const PORT = process.env.PORT || 3001;

console.log('Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('Creating TreeManager...');
const treeManager = new TreeManager();

console.log('Creating sample tree...');
treeManager.createSampleTree();
console.log('Tree created!');

const emitState = () => {
  io.emit('state-update', treeManager.getState());
};

const emitLogs = () => {
  io.emit('logs-update', treeManager.getLogs());
};

const emitMetrics = () => {
  io.emit('metrics-update', treeManager.getMetrics());
};

app.get('/api/state', (req, res) => {
  res.json(treeManager.getState());
});

app.get('/api/logs', (req, res) => {
  res.json(treeManager.getLogs());
});

app.get('/api/metrics', (req, res) => {
  res.json(treeManager.getMetrics());
});

app.post('/api/tree', (req, res) => {
  const state = treeManager.createSampleTree();
  emitState();
  emitLogs();
  emitMetrics();
  res.json(state);
});

app.post('/api/tree/add', (req, res) => {
  const { id, label, parentId } = req.body;
  const node = treeManager.addNode(id, label);
  if (node && parentId) {
    treeManager.setParent(id, parentId);
  }
  emitState();
  emitLogs();
  res.json(treeManager.getState());
});

app.post('/api/tree/set-parent', (req, res) => {
  const { childId, parentId } = req.body;
  treeManager.setParent(childId, parentId);
  emitState();
  emitLogs();
  res.json(treeManager.getState());
});

app.delete('/api/tree/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const result = treeManager.removeNode(nodeId);
  emitState();
  emitLogs();
  res.json({ success: result, state: treeManager.getState() });
});

app.post('/api/request/:nodeId', async (req, res) => {
  const { nodeId } = req.params;
  const result = await treeManager.requestCS(nodeId);
  emitState();
  emitLogs();
  emitMetrics();
  res.json(result);
});

app.post('/api/release/:nodeId', async (req, res) => {
  const { nodeId } = req.params;
  const result = await treeManager.releaseCS(nodeId);
  emitState();
  emitLogs();
  emitMetrics();
  res.json(result);
});

app.post('/api/reset', (req, res) => {
  treeManager.reset();
  treeManager.createSampleTree();
  emitState();
  emitLogs();
  emitMetrics();
  res.json(treeManager.getState());
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  treeManager.setExecutionMode(mode);
  emitState();
  res.json({ success: true, mode });
});

app.post('/api/speed', (req, res) => {
  const { speed } = req.body;
  treeManager.setAutoSpeed(speed);
  res.json({ success: true, speed });
});

app.post('/api/clear-logs', (req, res) => {
  treeManager.clearLogs();
  emitState();
  emitLogs();
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.emit('state-update', treeManager.getState());
  socket.emit('logs-update', treeManager.getLogs());
  socket.emit('metrics-update', treeManager.getMetrics());

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('request-cs', async (nodeId) => {
    const result = await treeManager.requestCS(nodeId);
    emitState();
    emitLogs();
    emitMetrics();
    socket.emit('request-result', { nodeId, result });
  });

  socket.on('release-cs', async (nodeId) => {
    const result = await treeManager.releaseCS(nodeId);
    emitState();
    emitLogs();
    emitMetrics();
    socket.emit('release-result', { nodeId, result });
  });

  socket.on('add-node', (data) => {
    const { id, label, parentId } = data;
    treeManager.addNode(id, label);
    if (parentId) {
      treeManager.setParent(id, parentId);
    }
    emitState();
    emitLogs();
  });

  socket.on('remove-node', (nodeId) => {
    treeManager.removeNode(nodeId);
    emitState();
    emitLogs();
  });

  socket.on('set-parent', (data) => {
    const { childId, parentId } = data;
    treeManager.setParent(childId, parentId);
    emitState();
    emitLogs();
  });

  socket.on('reset', () => {
    treeManager.reset();
    treeManager.createSampleTree();
    emitState();
    emitLogs();
    emitMetrics();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Raymond's Algorithm Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready for connections`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
