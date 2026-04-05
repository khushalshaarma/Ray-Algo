import { createServer } from 'http';
import { TreeManager } from './TreeManager.js';

const PORT = 3001;

const treeManager = new TreeManager();
treeManager.createSampleTree();

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      if (path === '/api/state' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(treeManager.getState()));
      } 
      else if (path === '/api/metrics' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(treeManager.getMetrics()));
      }
      else if (path === '/api/tree' && req.method === 'POST') {
        treeManager.reset();
        treeManager.createSampleTree();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(treeManager.getState()));
      }
      else if (path === '/api/reset' && req.method === 'POST') {
        treeManager.reset();
        treeManager.createSampleTree();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(treeManager.getState()));
      }
      else if (path === '/api/clear-logs' && req.method === 'POST') {
        treeManager.clearLogs();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
      else if (path.startsWith('/api/request/') && req.method === 'POST') {
        const nodeId = path.split('/')[3];
        const result = treeManager.requestCS(nodeId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
      else if (path.startsWith('/api/release/') && req.method === 'POST') {
        const nodeId = path.split('/')[3];
        const result = treeManager.releaseCS(nodeId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log('API endpoints:');
  console.log('  GET  /api/state    - Get system state');
  console.log('  GET  /api/metrics  - Get metrics');
  console.log('  POST /api/tree     - Create sample tree');
  console.log('  POST /api/reset    - Reset simulation');
  console.log('  POST /api/request/:nodeId  - Request CS');
  console.log('  POST /api/release/:nodeId  - Release CS');
});
