/**
 * SimulatedWorld WebSocket Server
 * Broadcasts real-time updates from SimulatedWorld to connected clients
 */

import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import { spawn } from 'child_process';
import * as path from 'path';

const PORT = 3002;

// Create HTTP server for WebSocket
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Connected clients
const clients: WebSocket[] = [];

// Message queue for batching updates
let messageQueue: any[] = [];
const flushInterval = 100; // Flush every 100ms

function flushQueue() {
  if (messageQueue.length > 0) {
    clients.forEach((client) => {
      if (client.readyState === 1) {
        try {
          client.send(JSON.stringify({ type: 'batch', messages: messageQueue }));
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }
    });
    messageQueue = [];
  }
}

// Set up periodic queue flushing
setInterval(flushQueue, flushInterval);

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log(`Client connected. Total clients: ${clients.length + 1}`);
  clients.push(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to SimulatedWorld',
    timestamp: new Date().toISOString(),
  }));

  // Handle incoming messages
  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message);

      // Echo the message back for now
      ws.send(JSON.stringify({ type: 'ack', messageId: message.id }));
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
    console.log(`Client disconnected. Total clients: ${clients.length}`);
  });

  // Handle errors
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function
export function broadcast(message: any) {
  messageQueue.push(message);
}

// Start monitoring SimulatedWorld for updates
function startMonitoring() {
  try {
    // Try to load and monitor the SimulatedWorld instance
    const worldModulePath = path.resolve(__dirname, '../dist/index.js');
    console.log(`Looking for SimulatedWorld at: ${worldModulePath}`);

    // For now, send sample data to demonstrate WebSocket functionality
    let messageCounter = 0;

    setInterval(() => {
      broadcast({
        type: 'trace',
        payload: {
          id: `trace-${messageCounter}`,
          timestamp: new Date().toISOString(),
          integration: 'slack',
          request: {
            method: 'GET',
            url: 'https://slack.com/api/conversations.list',
            headers: { 'Authorization': 'Bearer xoxb-...' },
          },
          response: {
            status: 200,
            duration: Math.random() * 1000,
            body: { ok: true },
          },
        },
      });
      messageCounter++;
    }, 5000);
  } catch (error) {
    console.error('Failed to start monitoring:', error);
  }
}

startMonitoring();

// Start server
server.listen(PORT, () => {
  console.log(`SimulatedWorld WebSocket server listening on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
