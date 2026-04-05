import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { TreeManager } from './TreeManager.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
  }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

const treeManager = new TreeManager();
treeManager.createSampleTree();

const emitState = () => io.emit('state-update', treeManager.getState());
const emitLogs = () => io.emit('logs-update', treeManager.getLogs());
const emitMetrics = () => io.emit('metrics-update', treeManager.getMetrics());

app.get('/api/state', (req, res) => res.json(treeManager.getState()));
app.get('/api/logs', (req, res) => res.json(treeManager.getLogs()));
app.get('/api/metrics', (req, res) => res.json(treeManager.getMetrics()));

app.post('/api/tree', (req, res) => {
  treeManager.reset();
  const state = treeManager.createSampleTree();
  emitState();
  emitLogs();
  emitMetrics();
  res.json(state);
});

app.post('/api/request/:nodeId', async (req, res) => {
  const result = await treeManager.requestCS(req.params.nodeId);
  emitState();
  emitLogs();
  emitMetrics();
  res.json(result);
});

app.post('/api/release/:nodeId', async (req, res) => {
  const result = await treeManager.releaseCS(req.params.nodeId);
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

app.post('/api/clear-logs', (req, res) => {
  treeManager.clearLogs();
  emitState();
  emitLogs();
  res.json({ success: true });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('state-update', treeManager.getState());
  socket.emit('metrics-update', treeManager.getMetrics());
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
