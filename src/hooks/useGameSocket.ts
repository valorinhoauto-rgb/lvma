/**
 * Hook para gerenciar conexão WebSocket e comunicação com o servidor de STOP + TERMO,
 * com fallback inteligente e resiliente para clientGameEngine no Netlify/ambientes estáticos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerAnswer, RoomSettings, RoomState, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { clientGameEngine } from '../utils/clientGameEngine.ts';

export interface ChatMessage {
  senderName: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export function useGameSocket(userProfile: UserProfile) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastValidationResult, setLastValidationResult] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const useClientEngineRef = useRef<boolean>(false);

  // Subscribe to clientGameEngine updates when in client mode
  useEffect(() => {
    const unsubRoom = clientGameEngine.subscribe((updatedRoom) => {
      if (useClientEngineRef.current) {
        setRoom({ ...updatedRoom });
      }
    });

    const unsubEvents = clientGameEngine.onEvent((event, payload) => {
      if (!useClientEngineRef.current) return;
      if (event === 'round:start') sound.playClick();
      else if (event === 'round:voting_start') sound.playClick();
      else if (event === 'round:vote_cast') sound.playKeypress();
      else if (event === 'juice:guess_result') {
        if (payload.playerId === userProfile.id) {
          if (payload.isCorrect) sound.playSuccess();
          else if (payload.isClose) sound.playTick();
          else sound.playError();
        }
      } else if (event === 'round:end') {
        if (payload.answers && payload.answers[userProfile.id]?.isValid) {
          sound.playSuccess();
        } else {
          sound.playError();
        }
      } else if (event === 'game:end') {
        sound.playVictory();
      }
    });

    return () => {
      unsubRoom();
      unsubEvents();
    };
  }, [userProfile]);

  const connectWebSocket = useCallback((roomId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (currentRoomIdRef.current === roomId) return;
      wsRef.current.close();
    }

    currentRoomIdRef.current = roomId;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({
          event: 'room:join',
          roomId,
          playerId: userProfile.id,
          name: userProfile.name,
          avatar: userProfile.avatar
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'room:update') {
            setRoom(data.room);
          } else if (data.event === 'round:start') {
            sound.playClick();
          } else if (data.event === 'round:voting_start') {
            sound.playClick();
          } else if (data.event === 'round:vote_cast') {
            sound.playKeypress();
          } else if (data.event === 'juice:guess_result') {
            if (data.playerId === userProfile.id) {
              if (data.isCorrect) sound.playSuccess();
              else if (data.isClose) sound.playTick();
              else sound.playError();
            }
          } else if (data.event === 'round:end') {
            if (data.answers && data.answers[userProfile.id]?.isValid) {
              sound.playSuccess();
            } else {
              sound.playError();
            }
          } else if (data.event === 'game:end') {
            sound.playVictory();
          } else if (data.event === 'chat:message') {
            setChatMessages((prev) => [...prev.slice(-40), data]);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        if (!useClientEngineRef.current) {
          setConnected(false);
          if (currentRoomIdRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (currentRoomIdRef.current && !useClientEngineRef.current) {
                connectWebSocket(currentRoomIdRef.current);
              }
            }, 3000);
          }
        }
      };

      ws.onerror = () => {
        // Silently handled; fallback to client engine will be active if needed
      };
    } catch {
      // Ignored
    }
  }, [userProfile]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // API Call: Create Room
  const createRoom = async (settings?: Partial<RoomSettings>): Promise<string | null> => {
    // Only attempt server if not explicitly on netlify or static domain without backend
    const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');

    if (!isNetlify) {
      try {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: userProfile, settings })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.roomId) {
            useClientEngineRef.current = false;
            setRoom(data.room);
            connectWebSocket(data.roomId);
            return data.roomId;
          }
        }
      } catch (err) {
        console.warn('Backend /api/rooms failed, switching to client engine:', err);
      }
    }

    // Client-side fallback engine (100% works on Netlify and offline)
    useClientEngineRef.current = true;
    const clientRoom = await clientGameEngine.createRoom(
      {
        id: userProfile.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
        isHost: true,
        score: 0,
        roundScore: 0,
        hasAnswered: false,
        isReady: true
      },
      settings
    );
    setRoom({ ...clientRoom });
    setConnected(true);
    return clientRoom.roomId;
  };

  // API Call: Join Room
  const joinRoom = async (roomId: string): Promise<boolean> => {
    const cleanCode = roomId.toUpperCase().trim();
    const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');

    if (!isNetlify) {
      try {
        const res = await fetch(`/api/rooms/${cleanCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: userProfile })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.room) {
            useClientEngineRef.current = false;
            setRoom(data.room);
            connectWebSocket(cleanCode);
            return true;
          }
        }
      } catch (err) {
        console.warn('Backend join failed, switching to client engine:', err);
      }
    }

    // Client-side / Firestore fallback
    useClientEngineRef.current = true;
    const clientRoom = await clientGameEngine.joinRoom(cleanCode, {
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      isHost: false,
      score: 0,
      roundScore: 0,
      hasAnswered: false,
      isReady: true
    });
    if (clientRoom) {
      setRoom({ ...clientRoom });
      setConnected(true);
      return true;
    }
    return false;
  };

  // Add simulated bot
  const addBot = async () => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.addBot();
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/bot`, { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.room) setRoom(data.room);
        return;
      }
    } catch {
      // Fallback
    }
    useClientEngineRef.current = true;
    const updated = clientGameEngine.addBot();
    if (updated) setRoom({ ...updated });
  };

  // Update room settings
  const updateSettings = async (newSettings: Partial<RoomSettings>) => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.updateSettings(newSettings);
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.room) setRoom(data.room);
        return;
      }
    } catch {
      // Fallback
    }
    useClientEngineRef.current = true;
    const updated = clientGameEngine.updateSettings(newSettings);
    if (updated) setRoom({ ...updated });
  };

  // Start game
  const startGame = async () => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.startRound();
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/start`, { method: 'POST' });
      if (res.ok) return;
    } catch {
      // Fallback
    }
    useClientEngineRef.current = true;
    const updated = clientGameEngine.startRound();
    if (updated) setRoom({ ...updated });
  };

  // Submit answer
  const submitAnswer = async (answer: string): Promise<any> => {
    if (!room) return null;
    if (useClientEngineRef.current) {
      const res = clientGameEngine.submitAnswer(userProfile.id, answer);
      if (res) {
        setRoom({ ...res.room });
        setLastValidationResult(res.validation);
        return res;
      }
      return null;
    }
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: userProfile.id, answer })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setLastValidationResult(data.validation);
        return data;
      }
    } catch {
      // Fallback
    }
    useClientEngineRef.current = true;
    const res = clientGameEngine.submitAnswer(userProfile.id, answer);
    if (res) {
      setRoom({ ...res.room });
      setLastValidationResult(res.validation);
      return res;
    }
    return null;
  };

  // Cast vote on player answer
  const castVote = async (targetPlayerId: string, approve: boolean) => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.castVote(userProfile.id, targetPlayerId, approve);
      if (updated) setRoom({ ...updated });
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'round:vote',
        roomId: room.roomId,
        voterId: userProfile.id,
        targetPlayerId,
        approve
      }));
    }
    try {
      await fetch(`/api/rooms/${room.roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: userProfile.id, targetPlayerId, approve })
      });
    } catch {
      const updated = clientGameEngine.castVote(userProfile.id, targetPlayerId, approve);
      if (updated) setRoom({ ...updated });
    }
  };

  // Conclude voting phase
  const concludeVoting = async () => {
    if (!room) return;
    if (useClientEngineRef.current) {
      clientGameEngine.concludeVoting();
      return;
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'round:conclude_voting',
        roomId: room.roomId
      }));
    }
    try {
      await fetch(`/api/rooms/${room.roomId}/conclude-voting`, { method: 'POST' });
    } catch {
      clientGameEngine.concludeVoting();
    }
  };

  // Next round
  const nextRound = async () => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.nextRound();
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      await fetch(`/api/rooms/${room.roomId}/next`, { method: 'POST' });
    } catch {
      const updated = clientGameEngine.nextRound();
      if (updated) setRoom({ ...updated });
    }
  };

  // Reset to lobby
  const resetToLobby = async () => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.resetToLobby();
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      await fetch(`/api/rooms/${room.roomId}/reset`, { method: 'POST' });
    } catch {
      const updated = clientGameEngine.resetToLobby();
      if (updated) setRoom({ ...updated });
    }
  };

  // Send chat message
  const sendChat = (text: string) => {
    if (!text.trim() || !room) return;
    const msg: ChatMessage = {
      senderName: userProfile.name,
      avatar: userProfile.avatar,
      text: text.trim(),
      timestamp: Date.now()
    };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:message',
        roomId: room.roomId,
        ...msg
      }));
    } else {
      setChatMessages((prev) => [...prev.slice(-40), msg]);
    }
  };

  // Leave room
  const leaveRoom = () => {
    currentRoomIdRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (useClientEngineRef.current) {
      clientGameEngine.leaveRoom();
      useClientEngineRef.current = false;
    }
    setRoom(null);
    setChatMessages([]);
  };

  return {
    room,
    connected,
    chatMessages,
    lastValidationResult,
    createRoom,
    joinRoom,
    addBot,
    updateSettings,
    startGame,
    submitAnswer,
    castVote,
    concludeVoting,
    nextRound,
    resetToLobby,
    sendChat,
    leaveRoom
  };
}
