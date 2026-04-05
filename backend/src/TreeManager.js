import { Node, NodeState } from './Node.js';

export class TreeManager {
  constructor() {
    this.nodes = new Map();
    this.root = null;
    this.tokenHolder = null;
    this.logs = [];
    this.totalMessages = 0;
    this.executionMode = 'auto';
    this.autoSpeed = 1000;
  }

  createSampleTree() {
    this.reset();
    
    // Create nodes: A is root, B,C are children of A, D,E are children of B, F,G are children of C
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    labels.forEach((label, index) => {
      this.addNode(`node_${index}`, label);
    });

    // Set parent-child relationships (child <- parent)
    // A is root, B and C are children of A
    this.setParent('node_1', 'node_0');  // B -> A
    this.setParent('node_2', 'node_0');  // C -> A
    // D and E are children of B
    this.setParent('node_3', 'node_1');  // D -> B
    this.setParent('node_4', 'node_1');  // E -> B
    // F and G are children of C
    this.setParent('node_5', 'node_2');  // F -> C
    this.setParent('node_6', 'node_2');  // G -> C

    // Token starts at root (A)
    this.setTokenHolder('node_0');
    
    this.addLog('System', 'Tree created: A(root) -> B,C -> D,E,F,G');
    this.addLog('System', 'Token initially at Node A (root)');
    
    return this.getState();
  }

  addNode(id, label = null) {
    if (this.nodes.has(id)) {
      return null;
    }
    const node = new Node(id, label);
    this.nodes.set(id, node);
    
    if (this.nodes.size === 1) {
      this.root = id;
      node.receiveToken();
      this.tokenHolder = id;
    }
    
    this.addLog('System', `Node ${label || id} added to the tree`);
    return node.toJSON();
  }

  removeNode(id) {
    if (!this.nodes.has(id)) {
      return false;
    }

    const node = this.nodes.get(id);
    
    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent) {
        parent.removeChild(id);
      }
    }

    node.children.forEach(childId => {
      const child = this.nodes.get(childId);
      if (child) {
        child.clearParent();
      }
    });

    if (node.hasToken) {
      this.tokenHolder = null;
    }

    this.nodes.delete(id);
    this.addLog('System', `Node ${node.label} removed from the tree`);
    return true;
  }

  setParent(childId, parentId) {
    const child = this.nodes.get(childId);
    const parent = this.nodes.get(parentId);

    if (!child || !parent) {
      return false;
    }

    if (child.parent) {
      const oldParent = this.nodes.get(child.parent);
      if (oldParent) {
        oldParent.removeChild(childId);
      }
    }

    child.setParent(parentId);
    parent.addChild(childId);
    
    this.addLog('System', `Set ${child.label} as child of ${parent.label}`);
    return true;
  }

  setTokenHolder(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    if (this.tokenHolder) {
      const currentHolder = this.nodes.get(this.tokenHolder);
      if (currentHolder) {
        currentHolder.hasToken = false;
      }
    }

    node.receiveToken();
    this.tokenHolder = nodeId;
    return true;
  }

  requestCS(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      this.addLog('ERROR', `Node ${nodeId} not found`);
      return { success: false, error: 'Node not found' };
    }

    // If already in CS, return success
    if (node.state === NodeState.IN_CS && node.hasToken) {
      return { success: true, inCS: true };
    }

    // If this node has the token but not in CS, enter CS
    if (node.hasToken) {
      node.state = NodeState.IN_CS;
      this.addLog(node.label, `Entering critical section`);
      return { success: true, inCS: true };
    }

    // Request token from whoever has it
    const tokenHolder = this.findTokenHolder();
    if (tokenHolder) {
      this.totalMessages++;
      this.addLog(node.label, `Requesting token from ${tokenHolder.label}`);
      this.passToken(tokenHolder, node);
    } else {
      this.addLog('ERROR', 'No token holder found!');
    }

    return { success: true, inCS: node.state === NodeState.IN_CS };
  }

  findTokenHolder() {
    for (const [id, node] of this.nodes) {
      if (node.hasToken) {
        return node;
      }
    }
    return null;
  }

  passToken(fromNode, toNode) {
    if (!fromNode || !toNode) return;

    this.totalMessages++;
    fromNode.hasToken = false;
    fromNode.state = NodeState.IDLE;
    this.tokenHolder = toNode.id;
    this.addLog(fromNode.label, `Passing token to ${toNode.label}`);

    toNode.hasToken = true;
    toNode.state = NodeState.IN_CS;
    this.addLog(toNode.label, `Entering critical section`);
  }

  releaseCS(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    if (node.state !== NodeState.IN_CS) {
      return { success: false, error: 'Node not in critical section' };
    }

    this.addLog(node.label, `Releasing critical section`);
    node.state = NodeState.HELD;  // Keep token but not in CS
    // Token stays with this node

    return { success: true };
  }

  getState() {
    const nodesArray = Array.from(this.nodes.values()).map(n => n.toJSON());
    const edges = [];
    
    // Create edges for D3 visualization: source = parent, target = child
    // But we need to flip because in our tree, parent has children array
    nodesArray.forEach(node => {
      // For each child, create edge from parent to child
      node.children.forEach(childId => {
        edges.push({
          source: node.id,           // parent node id
          target: childId,            // child node id
          sourceLabel: node.label,
          targetLabel: this.nodes.get(childId)?.label
        });
      });
    });

    return {
      nodes: nodesArray,
      edges,
      root: this.root,
      tokenHolder: this.tokenHolder,
      tokenHolderLabel: this.nodes.get(this.tokenHolder)?.label || null,
      logs: this.logs.slice(-50),
      totalMessages: this.totalMessages,
      inCriticalSection: this.getInCriticalSection(),
      executionMode: this.executionMode,
      autoSpeed: this.autoSpeed
    };
  }

  getInCriticalSection() {
    for (const [id, node] of this.nodes) {
      if (node.state === NodeState.IN_CS) {
        return { nodeId: id, label: node.label };
      }
    }
    return null;
  }

  addLog(source, message) {
    this.logs.push({
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      source,
      message
    });
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.addLog('System', 'Logs cleared');
  }

  reset() {
    this.nodes.clear();
    this.root = null;
    this.tokenHolder = null;
    this.logs = [];
    this.totalMessages = 0;
    this.addLog('System', 'System reset');
  }

  getMetrics() {
    const nodesArray = Array.from(this.nodes.values());
    const avgWaitingTime = nodesArray.reduce((sum, n) => sum + n.waitingTime, 0) / Math.max(nodesArray.length, 1);
    const totalRequests = nodesArray.reduce((sum, n) => sum + n.requestCount, 0);

    return {
      totalMessages: this.totalMessages,
      totalRequests,
      averageWaitingTime: avgWaitingTime,
      nodesInSystem: this.nodes.size,
      nodesInQueue: nodesArray.reduce((sum, n) => sum + n.requestQueue.length, 0),
      queuePerNode: nodesArray.map(n => ({
        nodeId: n.id,
        label: n.label,
        queueLength: n.requestQueue.length,
        waitingTime: n.waitingTime
      }))
    };
  }

  setExecutionMode(mode) {
    this.executionMode = mode;
    this.addLog('System', `Execution mode set to ${mode}`);
  }

  setAutoSpeed(speed) {
    this.autoSpeed = speed;
  }
}
