/**
 * Aplicação Principal: STOP + TERMO
 * Jogo multiplayer de palavras com:
 * 1. STOP + TERMO Híbrido com Votação da Galera (comunitária)
 * 2. TERMO Multiplayer Coletivo
 * 3. Modo Juice / Foto Desafio
 * 4. Autenticação com Google e sincronização Firestore
 */

import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { LobbyScreen } from './components/LobbyScreen.tsx';
import { RoundScreen } from './components/RoundScreen.tsx';
import { RoundVotingScreen } from './components/RoundVotingScreen.tsx';
import { JuicePhotoModeView } from './components/JuicePhotoModeView.tsx';
import { MultiplayerTermoView } from './components/MultiplayerTermoView.tsx';
import { RoundResultsScreen } from './components/RoundResultsScreen.tsx';
import { GameFinalScreen } from './components/GameFinalScreen.tsx';
import { TermoModeView } from './components/TermoModeView.tsx';
import { WordExplorerModal } from './components/WordExplorerModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { useGameSocket } from './hooks/useGameSocket.ts';
import { getOrCreateUserProfile, saveUserProfile } from './utils/profile.ts';
import { sound } from './utils/audio.ts';
import { auth, fetchUserProfile, recordGameHistory, syncUserProfileToDb } from './lib/firebase.ts';
import { GameMode } from './types.ts';

export default function App() {
  const [userProfile, setUserProfile] = useState(() => getOrCreateUserProfile());
  const [showProfile, setShowProfile] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [termoModeActive, setTermoModeActive] = useState(false);
  const [joinAlert, setJoinAlert] = useState<string | null>(null);
  const gameHistorySavedRef = useRef<string | null>(null);

  const {
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
  } = useGameSocket(userProfile);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Logged in with Google: Fetch cloud profile or initialize
        const remoteProfile = await fetchUserProfile(fbUser.uid);
        if (remoteProfile) {
          setUserProfile(remoteProfile);
          saveUserProfile(remoteProfile);
        } else {
          const syncedProfile = {
            ...userProfile,
            id: fbUser.uid,
            name: fbUser.displayName || userProfile.name,
          };
          setUserProfile(syncedProfile);
          saveUserProfile(syncedProfile);
          await syncUserProfileToDb(syncedProfile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save game to Firestore history when game_over triggers
  useEffect(() => {
    if (room && room.status === 'game_over' && room.roomId !== gameHistorySavedRef.current) {
      gameHistorySavedRef.current = room.roomId;
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      const myRank = sorted.findIndex(p => p.id === userProfile.id) + 1;
      const myScore = room.players.find(p => p.id === userProfile.id)?.score || 0;
      const xpEarned = Math.max(20, Math.round(myScore / 2));

      // Update XP in local profile & Firestore
      const updatedProfile = {
        ...userProfile,
        xp: userProfile.xp + xpEarned
      };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
      syncUserProfileToDb(updatedProfile);

      // Record to Firestore collection
      recordGameHistory(userProfile.id, {
        roomId: room.roomId,
        gameMode: room.settings.gameMode,
        score: myScore,
        rank: myRank || 1,
        totalPlayers: room.players.length,
        xpGained: xpEarned
      });
    }
  }, [room?.status, room?.roomId]);

  // Quick Play handler: creates a room with chosen mode, adds 1 bot, and starts
  const handleQuickPlay = async (mode: GameMode = 'stop_termo') => {
    sound.playClick();
    const roomId = await createRoom({
      gameMode: mode,
      totalRounds: 3,
      timeLimit: 30,
      scoringStyle: 'dynamic',
      juiceTheme: 'brasil_geral'
    });
    if (roomId) {
      setTimeout(async () => {
        await addBot();
      }, 300);
    }
  };

  // Create room with custom mode
  const handleCreateRoom = async (mode: GameMode = 'stop_termo') => {
    sound.playClick();
    await createRoom({ gameMode: mode, juiceTheme: 'brasil_geral' });
  };

  // Join Room with validation
  const handleJoinRoom = async (code: string) => {
    setJoinAlert(null);
    const success = await joinRoom(code);
    if (!success) {
      setJoinAlert('Sala não encontrada ou não foi possível conectar.');
      sound.playError();
    }
  };

  const handleUpdateProfile = (updated: typeof userProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  // Determine current active view
  const renderCurrentView = () => {
    if (termoModeActive) {
      return <TermoModeView onBack={() => setTermoModeActive(false)} />;
    }

    if (!room) {
      return (
        <HomeScreen
          userProfile={userProfile}
          onQuickPlay={handleQuickPlay}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartTermoMode={() => setTermoModeActive(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenDictionary={() => setShowDictionary(true)}
        />
      );
    }

    switch (room.status) {
      case 'lobby':
        return (
          <LobbyScreen
            room={room}
            currentUserId={userProfile.id}
            chatMessages={chatMessages}
            onStartGame={startGame}
            onAddBot={addBot}
            onUpdateSettings={updateSettings}
            onSendChat={sendChat}
            onLeaveRoom={leaveRoom}
          />
        );

      case 'countdown':
      case 'round_active': {
        if (!room.currentRound) return null;
        const myPlayer = room.players.find(p => p.id === userProfile.id);
        const myAnswer = room.roundAnswers[userProfile.id]?.rawAnswer;

        // Juice Photo Challenge Mode
        if (room.settings.gameMode === 'juice_photo') {
          return (
            <JuicePhotoModeView
              round={room.currentRound}
              players={room.players}
              currentUserId={userProfile.id}
              hasAnswered={Boolean(myPlayer?.hasAnswered)}
              userAnswer={myAnswer}
              guesses={room.roundAnswers[userProfile.id]?.juiceGuesses || []}
              onSubmitAnswer={submitAnswer}
            />
          );
        }

        // Multiplayer Termo Mode
        if (room.settings.gameMode === 'termo_multiplayer') {
          return (
            <MultiplayerTermoView
              round={room.currentRound}
              players={room.players}
              currentUserId={userProfile.id}
              hasAnswered={Boolean(myPlayer?.hasAnswered)}
              guesses={room.roundAnswers[userProfile.id]?.termoGuesses || []}
              onSubmitGuess={submitAnswer}
            />
          );
        }

        // Standard STOP + TERMO Mode
        return (
          <RoundScreen
            round={room.currentRound}
            players={room.players}
            currentUserId={userProfile.id}
            hasAnswered={Boolean(myPlayer?.hasAnswered)}
            userAnswer={myAnswer}
            lastValidation={lastValidationResult}
            onSubmitAnswer={submitAnswer}
          />
        );
      }

      case 'round_voting':
        return (
          <RoundVotingScreen
            room={room}
            currentUserId={userProfile.id}
            onVote={castVote}
            onConcludeVoting={concludeVoting}
          />
        );

      case 'round_results':
        return (
          <RoundResultsScreen
            room={room}
            currentUserId={userProfile.id}
            onNextRound={nextRound}
          />
        );

      case 'game_over':
        return (
          <GameFinalScreen
            room={room}
            currentUserId={userProfile.id}
            onPlayAgain={resetToLobby}
            onReturnHome={leaveRoom}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Header
        userProfile={userProfile}
        onOpenProfile={() => setShowProfile(true)}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenDictionary={() => setShowDictionary(true)}
        onLogoClick={() => {
          if (room) {
            if (window.confirm('Deseja realmente sair da sala atual e voltar ao menu principal?')) {
              leaveRoom();
              setTermoModeActive(false);
            }
          } else {
            setTermoModeActive(false);
          }
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col justify-start">
        {joinAlert && (
          <div className="max-w-md mx-auto mt-4 px-4 py-2.5 bg-rose-500/20 border border-rose-500 text-rose-300 rounded-xl text-xs font-bold text-center">
            {joinAlert}
          </div>
        )}
        {renderCurrentView()}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <WordExplorerModal
        isOpen={showDictionary}
        onClose={() => setShowDictionary(false)}
        playerName={userProfile.name}
      />
    </div>
  );
}
