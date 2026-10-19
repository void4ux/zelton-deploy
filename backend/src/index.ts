import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { projectRouter } from './routes/projects.js';
import { audioRouter } from './routes/audio.js';
import { aiRouter } from './routes/ai.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'SonicForge Studio (ZELTON) Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// REST API routes
app.use('/api/projects', projectRouter);
app.use('/api/audio', audioRouter);
app.use('/api/ai', aiRouter);

// Real-Time Studio Collaboration over WebSocket
const connectedClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  connectedClients.add(ws);

  ws.send(JSON.stringify({
    type: 'ROOM_JOINED',
    message: 'Connected to ZELTON Real-Time Session Bus',
    clientCount: connectedClients.size
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Broadcast transport, note, and clip events to other active collaborators
      for (const client of connectedClients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      }
    } catch (err) {
      console.error('Invalid WS payload received', err);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`[ZELTON Backend] Server listening at http://localhost:${PORT}`);
  console.log(`[ZELTON Backend] WebSocket collaboration bus active`);
});
