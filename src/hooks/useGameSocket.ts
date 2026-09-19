/**
 * Hook para gerenciar conexão WebSocket e comunicação com o servidor de STOP + TERMO
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Player, PlayerAnswer, RoomSettings, RoomState, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);

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
        // Send join event
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
              if (data.isCorrect) {
                sound.playSuccess();
              } else if (data.isClose) {
                sound.playTick();
              } else {
                sound.playError();
              }
            }
          } else if (data.event === 'round:end') {
            // Check if player's answer was valid for sound effect
            if (data.answers && data.answers[userProfile.id]) {
              const myAnswer = data.answers[userProfile.id];
              if (myAnswer.isValid) {
                sound.playSuccess();
              } else {
                sound.playError();
              }
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
        setConnected(false);
        // Auto-reconnect if still in room
        if (currentRoomIdRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (currentRoomIdRef.current) {
              connectWebSocket(currentRoomIdRef.current);
            }
          }, 2000);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };
    } catch (err) {
      console.error('Could not initialize WebSocket:', err);
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
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: userProfile,
          settings
        })
      });
      const data = await res.json();
      if (data.roomId) {
        setRoom(data.room);
        connectWebSocket(data.roomId);
        return data.roomId;
      }
    } catch (err) {
      console.error('Error creating room:', err);
    }
    return null;
  };

  // API Call: Join Room
  const joinRoom = async (roomId: string): Promise<boolean> => {
    try {
      const cleanCode = roomId.toUpperCase().trim();
      const res = await fetch(`/api/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: userProfile })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
        connectWebSocket(cleanCode);
        return true;
      }
    } catch (err) {
      console.error('Error joining room:', err);
    }
    return false;
  };

  // Add simulated bot
  const addBot = async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/bot`, { method: 'POST' });
      const data = await res.json();
      if (data.room) setRoom(data.room);
    } catch (err) {
      console.error('Error adding bot:', err);
    }
  };

  // Update room settings
  const updateSettings = async (newSettings: Partial<RoomSettings>) => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      const data = await res.json();
      if (data.room) setRoom(data.room);
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  // Start game
  const startGame = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.roomId}/start`, { method: 'POST' });
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  // Submit answer
  const submitAnswer = async (answer: string): Promise<any> => {
    if (!room) return null;
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: userProfile.id,
          answer
        })
      });
      const data = await res.json();
      setLastValidationResult(data.validation);
      return data;
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
    return null;
  };

  // Cast vote on player answer
  const castVote = async (targetPlayerId: string, approve: boolean) => {
    if (!room) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'round:vote',
        roomId: room.roomId,
        voterId: userProfile.id,
        targetPlayerId,
        approve
      }));
    }
    // Also call REST fallback
    try {
      await fetch(`/api/rooms/${room.roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: userProfile.id,
          targetPlayerId,
          approve
        })
      });
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  // Conclude voting phase
  const concludeVoting = async () => {
    if (!room) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'round:conclude_voting',
        roomId: room.roomId
      }));
    }
    try {
      await fetch(`/api/rooms/${room.roomId}/conclude-voting`, { method: 'POST' });
    } catch (err) {
      console.error('Error concluding voting:', err);
    }
  };

  // Next round
  const nextRound = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.roomId}/next`, { method: 'POST' });
    } catch (err) {
      console.error('Error advancing round:', err);
    }
  };

  // Reset to lobby
  const resetToLobby = async () => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.roomId}/reset`, { method: 'POST' });
    } catch (err) {
      console.error('Error resetting room:', err);
    }
  };

  // Send chat message
  const sendChat = (text: string) => {
    if (!text.trim() || !room || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({
      event: 'chat:message',
      roomId: room.roomId,
      senderName: userProfile.name,
      avatar: userProfile.avatar,
      text: text.trim()
    }));
  };

  // Leave room
  const leaveRoom = () => {
    currentRoomIdRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
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
