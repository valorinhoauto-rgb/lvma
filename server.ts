/**
 * Servidor Express + WebSocket para STOP + TERMO
 * Suporta multiplayer em tempo real, validação autoritativa no servidor e Vite middleware.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { gameManager } from './src/server/gameManager.ts';
import { wordEngine, userSuggestions, isValidTermoWord } from './src/server/wordEngine.ts';
import { CATEGORIES } from './src/data/words.ts';
import { Player } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const server = http.createServer(app);

  // WebSocket Server attached to same HTTP server (port 3000)
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Map to track socket connections: socket -> { roomId, playerId }
  const socketMeta = new WeakMap<WebSocket, { roomId: string; playerId: string }>();

  wss.on('connection', (ws: WebSocket, req) => {
    ws.on('message', (data: string) => {
      try {
        const payload = JSON.parse(data.toString());
        const { event, roomId, playerId, name, avatar } = payload;

        if (event === 'room:join' && roomId && playerId) {
          const room = gameManager.getRoom(roomId);
          if (room) {
            socketMeta.set(ws, { roomId, playerId });
            room.addClient(playerId, ws);

            // Check if player exists in room, otherwise add them
            let player = room.state.players.find(p => p.id === playerId);
            if (!player) {
              player = {
                id: playerId,
                name: name || 'Jogador',
                avatar: avatar || '🦊',
                isHost: false,
                score: 0,
                roundScore: 0,
                hasAnswered: false,
                isReady: true
              };
              room.state.players.push(player);
            }
            room.broadcastState();
          } else {
            ws.send(JSON.stringify({ event: 'error', message: 'Sala não encontrada.' }));
          }
        } else if (event === 'round:vote' && roomId) {
          const room = gameManager.getRoom(roomId);
          if (room) {
            room.castVote(payload.voterId, payload.targetPlayerId, payload.approve);
          }
        } else if (event === 'round:conclude_voting' && roomId) {
          const room = gameManager.getRoom(roomId);
          if (room) {
            room.concludeVoting();
          }
        } else if (event === 'chat:message' && roomId) {
          const room = gameManager.getRoom(roomId);
          if (room) {
            room.broadcast('chat:message', {
              senderName: payload.senderName || 'Jogador',
              avatar: payload.avatar || '💬',
              text: payload.text,
              timestamp: Date.now()
            });
          }
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      const meta = socketMeta.get(ws);
      if (meta) {
        const room = gameManager.getRoom(meta.roomId);
        if (room) {
          room.removeClient(meta.playerId);
        }
      }
    });
  });

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Word Database statistics & exploration
  app.get('/api/words/stats', (req, res) => {
    res.json({
      categories: CATEGORIES,
      stats: wordEngine.getStats()
    });
  });

  app.get('/api/words/combinations', (req, res) => {
    const { category, minLength, maxLength } = req.query;
    const list = wordEngine.getCombinations(
      category ? String(category) : undefined,
      minLength ? Number(minLength) : 4,
      maxLength ? Number(maxLength) : 9
    );
    res.json({ combinations: list });
  });

  // Submit suggestion
  app.post('/api/words/suggest', (req, res) => {
    const { word, category, submittedBy } = req.body;
    if (!word || !category) {
      return res.status(400).json({ error: 'Palavra e categoria são obrigatórias.' });
    }
    const id = wordEngine.addSuggestion(word, category, submittedBy || 'Anônimo');
    res.json({ success: true, id, message: 'Sugestão enviada com sucesso!' });
  });

  // Evaluate Termo Guess (apenas aceita palavras que realmente existam)
  app.post('/api/termo/evaluate', (req, res) => {
    const { guess, target } = req.body;
    if (!guess || !target) {
      return res.status(400).json({ error: 'Palpite e palavra-alvo são necessários.' });
    }
    const cleanGuess = String(guess).trim().toUpperCase();
    if (!isValidTermoWord(cleanGuess)) {
      return res.status(400).json({
        error: 'Palavra não encontrada no dicionário de Português.',
        inDictionary: false
      });
    }
    const result = wordEngine.evaluateTermoGuess(cleanGuess, target);
    res.json(result);
  });

  // Checagem rápida se uma palavra é válida no vocabulário de TERMO
  app.get('/api/termo/validate-word', (req, res) => {
    const word = String(req.query.word || '');
    const valid = isValidTermoWord(word);
    res.json({ word, isValid: valid });
  });

  // Image proxy for authentic Wikimedia / public domain pictures
  app.get('/api/image-proxy', async (req, res) => {
    try {
      const targetUrl = req.query.url ? String(req.query.url) : '';
      if (!targetUrl || !targetUrl.startsWith('https://')) {
        return res.status(400).send('Invalid image URL');
      }

      const imgRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      if (!imgRes.ok) {
        return res.status(imgRes.status).send('Failed to fetch image');
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      const buffer = await imgRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error('Error proxying image:', err);
      res.status(500).send('Proxy error');
    }
  });

  // Create room
  app.post('/api/rooms', (req, res) => {
    const { player, settings, forcedRoomId } = req.body;
    if (!player || !player.id || !player.name) {
      return res.status(400).json({ error: 'Dados do jogador host são necessários.' });
    }

    const hostPlayer: Player = {
      id: player.id,
      name: player.name,
      avatar: player.avatar || '🦊',
      isHost: true,
      score: 0,
      roundScore: 0,
      hasAnswered: false,
      isReady: true
    };

    const room = forcedRoomId
      ? gameManager.createRoomWithId(forcedRoomId, hostPlayer, settings)
      : gameManager.createRoom(hostPlayer, settings);
    res.json({ roomId: room.id, room: room.state });
  });

  // Get room
  app.get('/api/rooms/:id', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    res.json({ room: room.state });
  });

  // Join room
  app.post('/api/rooms/:id/join', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }

    const { player } = req.body;
    if (!player || !player.id || !player.name) {
      return res.status(400).json({ error: 'Dados do jogador são necessários.' });
    }

    let existing = room.state.players.find(p => p.id === player.id);
    if (!existing) {
      existing = {
        id: player.id,
        name: player.name,
        avatar: player.avatar || '🐻',
        isHost: false,
        score: 0,
        roundScore: 0,
        hasAnswered: false,
        isReady: true
      };
      room.state.players.push(existing);
      room.broadcastState();
    }

    res.json({ success: true, room: room.state });
  });

  // Leave room
  app.post('/api/rooms/:id/leave', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    const { playerId } = req.body;
    if (playerId) {
      room.removePlayer(playerId);
    }
    res.json({ success: true });
  });

  // Kick player from room (Host action)
  app.post('/api/rooms/:id/kick', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    const { playerId } = req.body;
    if (playerId) {
      room.kickPlayer(playerId);
    }
    res.json({ success: true, room: room.state });
  });

  // Update room settings
  app.post('/api/rooms/:id/settings', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }

    const { settings } = req.body;
    if (settings) {
      room.state.settings = { ...room.state.settings, ...settings };
      room.broadcastState();
    }
    res.json({ success: true, room: room.state });
  });

  // Start game
  app.post('/api/rooms/:id/start', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    room.startGame();
    res.json({ success: true, room: room.state });
  });

  // Submit answer
  app.post('/api/rooms/:id/submit', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }

    const { playerId, answer } = req.body;
    if (!playerId || !answer) {
      return res.status(400).json({ error: 'Player ID e resposta são obrigatórios.' });
    }

    const result = room.submitAnswer(playerId, answer);
    res.json(result);
  });

  // Cast vote on an answer
  app.post('/api/rooms/:id/vote', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }

    const { voterId, targetPlayerId, approve } = req.body;
    if (!voterId || !targetPlayerId) {
      return res.status(400).json({ error: 'Dados do voto inválidos.' });
    }

    const result = room.castVote(voterId, targetPlayerId, Boolean(approve));
    res.json(result);
  });

  // Conclude voting phase manually
  app.post('/api/rooms/:id/conclude-voting', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    room.concludeVoting();
    res.json({ success: true, room: room.state });
  });

  // Advance round or finish
  app.post('/api/rooms/:id/next', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    room.nextStep();
    res.json({ success: true, room: room.state });
  });

  // Reset to lobby
  app.post('/api/rooms/:id/reset', (req, res) => {
    const room = gameManager.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada.' });
    }
    room.resetToLobby();
    res.json({ success: true, room: room.state });
  });

  // Instant client validation preview (without submitting)
  app.post('/api/validate', (req, res) => {
    const { answer, round } = req.body;
    if (!round) {
      return res.status(400).json({ error: 'Round info necessária.' });
    }
    const result = wordEngine.validateAnswer(answer || '', round);
    res.json(result);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
