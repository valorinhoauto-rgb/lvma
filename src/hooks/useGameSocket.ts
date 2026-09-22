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
  avatarColor?: string;
  text: string;
  timestamp: number;
}

export function useGameSocket(userProfile: UserProfile) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastValidationResult, setLastValidationResult] = useState<any>(null);
  const [hostLeftMessage, setHostLeftMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const useClientEngineRef = useRef<boolean>(false);

  // Subscribe to clientGameEngine updates
  useEffect(() => {
    const unsubRoom = clientGameEngine.subscribe((updatedRoom) => {
      if (updatedRoom.kickedPlayerIds?.includes(userProfile.id)) {
        sound.playError();
        setHostLeftMessage('Você foi removido da sala pelo anfitrião.');
        currentRoomIdRef.current = null;
        clientGameEngine.leaveRoom();
        setRoom(null);
        setChatMessages([]);
        return;
      }
      setRoom({ ...updatedRoom });
      if (updatedRoom.chatMessages && updatedRoom.chatMessages.length > 0) {
        setChatMessages(updatedRoom.chatMessages);
      }
    });

    const unsubEvents = clientGameEngine.onEvent((event, payload) => {
      if (event === 'round:start') sound.playClick();
      else if (event === 'round:voting_start') sound.playClick();
      else if (event === 'round:vote_cast') sound.playKeypress();
      else if (event === 'player:kicked') {
        if (payload?.playerId === userProfile.id) {
          sound.playError();
          setHostLeftMessage('Você foi removido da sala pelo anfitrião.');
          currentRoomIdRef.current = null;
          clientGameEngine.leaveRoom();
          setRoom(null);
          setChatMessages([]);
        }
      } else if (event === 'juice:guess_result') {
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
      } else if (event === 'room:host_left' || event === 'room:closed') {
        sound.playError();
        setHostLeftMessage(payload?.reason || 'O anfitrião saiu da sala. A partida foi encerrada.');
        setRoom(null);
        setChatMessages([]);
      } else if (event === 'chat:message') {
        setChatMessages((prev) => {
          if (prev.some(m => m.timestamp === payload.timestamp && m.senderName === payload.senderName)) {
            return prev;
          }
          return [...prev.slice(-39), payload];
        });
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
          if (data.event === 'player:kicked' && data.playerId === userProfile.id) {
            sound.playError();
            setHostLeftMessage('Você foi removido da sala pelo anfitrião.');
            currentRoomIdRef.current = null;
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            clientGameEngine.leaveRoom();
            setRoom(null);
            setChatMessages([]);
            return;
          }
          if (data.event === 'room:update') {
            if (data.room?.kickedPlayerIds?.includes(userProfile.id)) {
              sound.playError();
              setHostLeftMessage('Você foi removido da sala pelo anfitrião.');
              currentRoomIdRef.current = null;
              if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
              }
              clientGameEngine.leaveRoom();
              setRoom(null);
              setChatMessages([]);
              return;
            }
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
          } else if (data.event === 'room:host_left' || data.event === 'room:closed') {
            sound.playError();
            setHostLeftMessage(data.reason || 'O anfitrião saiu da sala. A partida foi encerrada.');
            currentRoomIdRef.current = null;
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            clientGameEngine.leaveRoom();
            setRoom(null);
            setChatMessages([]);
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
    useClientEngineRef.current = true;

    // 1. Create client-side room with instant Firestore synchronization
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

    // 2. Also register room with backend server if available
    try {
      fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: userProfile, settings, forcedRoomId: clientRoom.roomId })
      }).catch(() => {});
    } catch {
      // Ignored
    }

    connectWebSocket(clientRoom.roomId);
    return clientRoom.roomId;
  };

  // API Call: Join Room
  const joinRoom = async (roomId: string): Promise<boolean> => {
    const cleanCode = roomId.toUpperCase().trim();
    if (!cleanCode) return false;

    // 1. First attempt join via clientGameEngine & Firestore (global sync across all devices & instances)
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
      useClientEngineRef.current = true;
      setRoom({ ...clientRoom });
      setConnected(true);

      // Also notify backend server
      try {
        fetch(`/api/rooms/${cleanCode}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: userProfile })
        }).catch(() => {});
      } catch {
        // Ignored
      }

      connectWebSocket(cleanCode);
      return true;
    }

    // 2. Backend server fallback if room was created in server memory
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
          await clientGameEngine.syncToFirestore(data.room);
          clientGameEngine.listenToFirestoreRoom(cleanCode);
          useClientEngineRef.current = true;
          setRoom(data.room);
          setConnected(true);
          connectWebSocket(cleanCode);
          return true;
        }
      }
    } catch (err) {
      console.warn('Backend join fallback failed:', err);
    }

    return false;
  };

  // Kick player from room (Host action)
  const kickPlayer = async (targetPlayerId: string) => {
    if (!room) return;
    if (useClientEngineRef.current) {
      const updated = clientGameEngine.kickPlayer(targetPlayerId);
      if (updated) setRoom({ ...updated });
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${room.roomId}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: targetPlayerId })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.room) setRoom(data.room);
        return;
      }
    } catch {
      // Fallback to client engine
    }
    useClientEngineRef.current = true;
    const updated = clientGameEngine.kickPlayer(targetPlayerId);
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
    clientGameEngine.sendChatMessage(msg);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          event: 'chat:message',
          roomId: room.roomId,
          ...msg
        }));
      } catch {
        // Ignored
      }
    }
  };

  // Leave room
  const leaveRoom = () => {
    const rId = currentRoomIdRef.current || room?.roomId;
    currentRoomIdRef.current = null;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (rId) {
      try {
        fetch(`/api/rooms/${rId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: userProfile.id })
        }).catch(() => {});
      } catch {}
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
    hostLeftMessage,
    clearHostLeftMessage: () => setHostLeftMessage(null),
    createRoom,
    joinRoom,
    kickPlayer,
    updateSettings,
    startGame,
    submitAnswer,
    castVote,
    concludeVoting,
    nextRound,
    resetToLobby,
    handleTimeUp: () => {
      if (useClientEngineRef.current) {
        clientGameEngine.handleRoundTimeUp();
      }
    },
    sendChat,
    leaveRoom
  };
}
