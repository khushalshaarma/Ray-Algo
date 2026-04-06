import express from 'express';
import cors from 'cors';
import { TreeManager } from './TreeManager.js';

const app = express();

app.use(cors());
app.use(express.json());

const treeManager = new TreeManager();
treeManager.createSampleTree();

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
  res.json(state);
});

app.post('/api/tree/add', (req, res) => {
  const { id, label, parentId } = req.body;
  const node = treeManager.addNode(id, label);
  if (node && parentId) {
    treeManager.setParent(id, parentId);
  }
  res.json(treeManager.getState());
});

app.post('/api/tree/set-parent', (req, res) => {
  const { childId, parentId } = req.body;
  treeManager.setParent(childId, parentId);
  res.json(treeManager.getState());
});

app.delete('/api/tree/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const result = treeManager.removeNode(nodeId);
  res.json({ success: result, state: treeManager.getState() });
});

app.post('/api/request/:nodeId', async (req, res) => {
  const { nodeId } = req.params;
  const result = await treeManager.requestCS(nodeId);
  res.json(result);
});

app.post('/api/release/:nodeId', async (req, res) => {
  const { nodeId } = req.params;
  const result = await treeManager.releaseCS(nodeId);
  res.json(result);
});

app.post('/api/reset', (req, res) => {
  treeManager.reset();
  treeManager.createSampleTree();
  res.json(treeManager.getState());
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  treeManager.setExecutionMode(mode);
  res.json({ success: true, mode });
});

app.post('/api/speed', (req, res) => {
  const { speed } = req.body;
  treeManager.setAutoSpeed(speed);
  res.json({ success: true, speed });
});

app.post('/api/clear-logs', (req, res) => {
  treeManager.clearLogs();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});