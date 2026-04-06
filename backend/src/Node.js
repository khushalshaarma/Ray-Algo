function generateId() {
  return 'node_' + Math.random().toString(36).substr(2, 9);
}

export const NodeState = {
  IDLE: 'IDLE',
  HELD: 'HELD',
  WANTED: 'WANTED',
  IN_CS: 'IN_CS'
};

export class Node {
  constructor(id, label = null) {
    this.id = id;
    this.label = label || id;
    this.parent = null;
    this.children = [];
    this.hasToken = false;
    this.state = NodeState.IDLE;
    this.requestQueue = [];
    this.holder = null;
    this.waitingTime = 0;
    this.requestCount = 0;
    this.messagesSent = 0;
    this.lastRequestTime = null;
  }

  addChild(childId) {
    if (!this.children.includes(childId)) {
      this.children.push(childId);
    }
  }

  removeChild(childId) {
    this.children = this.children.filter(id => id !== childId);
  }

  setParent(parentId) {
    this.parent = parentId;
    this.holder = parentId;
  }

  clearParent() {
    this.parent = null;
    this.holder = null;
  }

  requestCS() {
    this.state = NodeState.WANTED;
    this.requestQueue.push({
      nodeId: this.id,
      timestamp: Date.now()
    });
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  releaseCS() {
    this.state = this.hasToken ? NodeState.HELD : NodeState.IDLE;
    if (this.requestQueue.length > 0) {
      this.requestQueue.shift();
    }
  }

  receiveToken() {
    this.hasToken = true;
    if (this.state === NodeState.WANTED) {
      this.state = NodeState.IN_CS;
    } else if (this.state === NodeState.IDLE) {
      this.state = NodeState.HELD;
    }
  }

  passToken() {
    this.hasToken = false;
    this.state = NodeState.WANTED;
    this.messagesSent++;
  }

  processQueue() {
    if (this.requestQueue.length > 0 && this.state !== NodeState.IN_CS) {
      const request = this.requestQueue[0];
      return request;
    }
    return null;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      parent: this.parent,
      children: this.children,
      hasToken: this.hasToken,
      state: this.state,
      requestQueue: this.requestQueue.map(r => ({ nodeId: r.nodeId, timestamp: r.timestamp })),
      holder: this.holder,
      waitingTime: this.waitingTime,
      requestCount: this.requestCount,
      messagesSent: this.messagesSent
    };
  }

  static fromJSON(json) {
    const node = new Node(json.id, json.label);
    node.parent = json.parent;
    node.children = json.children || [];
    node.hasToken = json.hasToken || false;
    node.state = json.state || NodeState.IDLE;
    node.requestQueue = json.requestQueue || [];
    node.holder = json.holder;
    node.waitingTime = json.waitingTime || 0;
    node.requestCount = json.requestCount || 0;
    node.messagesSent = json.messagesSent || 0;
    return node;
  }
}
