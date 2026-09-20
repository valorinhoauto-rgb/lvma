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
import { FriendsModal } from './components/FriendsModal.tsx';
import { NicknameSetupModal } from './components/NicknameSetupModal.tsx';
import { useGameSocket } from './hooks/useGameSocket.ts';
import { getOrCreateUserProfile, saveUserProfile, createGuestProfile } from './utils/profile.ts';
import { getSuggestedNickname } from './utils/avatarData.ts';
import { sound } from './utils/audio.ts';
import { auth, fetchUserProfile, recordGameHistory, syncUserProfileToDb, fetchFriendsFromDb, saveFriendToDb, removeFriendFromDb } from './lib/firebase.ts';
import { GameMode, Friend, Player } from './types.ts';

export default function App() {
  const [userProfile, setUserProfile] = useState(() => getOrCreateUserProfile());
  const [showProfile, setShowProfile] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showNicknameSetup, setShowNicknameSetup] = useState(false);
  const [termoModeActive, setTermoModeActive] = useState(false);
  const [joinAlert, setJoinAlert] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const stored = localStorage.getItem('malm_friends');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const gameHistorySavedRef = useRef<string | null>(null);

  const {
    room,
    connected,
    chatMessages,
    lastValidationResult,
    hostLeftMessage,
    clearHostLeftMessage,
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
    sendChat,
    leaveRoom
  } = useGameSocket(userProfile);

  // Sync Firebase Auth State and Cloud Friends
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Logged in with Google: Fetch cloud profile or initialize
        const remoteProfile = await fetchUserProfile(fbUser.uid);
        if (remoteProfile) {
          const merged = {
            ...remoteProfile,
            isGoogleAuth: true
          };
          setUserProfile(merged);
          saveUserProfile(merged);
          if (!merged.nicknameLocked) {
            setShowNicknameSetup(true);
          } else {
            setShowNicknameSetup(false);
          }
        } else {
          const suggestedNick = getSuggestedNickname(fbUser.displayName || fbUser.email || '');
          const syncedProfile = {
            ...userProfile,
            id: fbUser.uid,
            name: suggestedNick,
            nickname: suggestedNick,
            email: fbUser.email || undefined,
            photoURL: fbUser.photoURL || undefined,
            isGoogleAuth: true,
            nicknameLocked: false,
            hasConfiguredProfile: false
          };
          setUserProfile(syncedProfile);
          saveUserProfile(syncedProfile);
          await syncUserProfileToDb(syncedProfile);
          setShowNicknameSetup(true);
        }

        // Fetch cloud friends
        const cloudFriends = await fetchFriendsFromDb(fbUser.uid);
        if (cloudFriends && cloudFriends.length > 0) {
          setFriends(cloudFriends);
          localStorage.setItem('malm_friends', JSON.stringify(cloudFriends));
        }
      } else {
        // Guest or logged out
        setShowNicknameSetup(false);
        if (userProfile.isGoogleAuth) {
          const guest = createGuestProfile();
          setUserProfile(guest);
          saveUserProfile(guest);
          setFriends([]);
          localStorage.removeItem('malm_friends');
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

  // Add friend handler
  const handleAddFriend = (friend: Friend) => {
    if (friends.some(f => f.id === friend.id || (friend.nickname && f.nickname?.toLowerCase() === friend.nickname.toLowerCase()))) {
      return;
    }
    const updated = [friend, ...friends];
    setFriends(updated);
    localStorage.setItem('malm_friends', JSON.stringify(updated));
    saveFriendToDb(userProfile.id, friend);
  };

  const handleAddFriendFromPlayer = (player: Player) => {
    if (!userProfile.isGoogleAuth && !auth.currentUser) {
      sound.playClick();
      setShowFriends(true);
      return;
    }
    const friendData: Friend = {
      id: player.id,
      nickname: player.nickname || player.name,
      name: player.name,
      avatar: player.avatar,
      avatarColor: player.avatarColor,
      level: 1,
      addedAt: new Date().toISOString()
    };
    handleAddFriend(friendData);
  };

  // Remove friend handler
  const handleRemoveFriend = (friendId: string) => {
    const updated = friends.filter(f => f.id !== friendId);
    setFriends(updated);
    localStorage.setItem('malm_friends', JSON.stringify(updated));
    removeFriendFromDb(userProfile.id, friendId);
  };

  // Quick Play handler: creates a room with chosen mode and enters lobby
  const handleQuickPlay = async (mode: GameMode = 'stop_termo') => {
    sound.playClick();
    await createRoom({
      gameMode: mode,
      totalRounds: 3,
      timeLimit: 30,
      scoringStyle: 'dynamic',
      juiceTheme: 'brasil_geral'
    });
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
            friends={friends}
            onStartGame={startGame}
            onKickPlayer={kickPlayer}
            onAddFriend={handleAddFriendFromPlayer}
            onOpenFriendsModal={() => setShowFriends(true)}
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
              roundAnswers={room.roundAnswers}
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
        friendsCount={friends.length}
        onOpenFriends={() => setShowFriends(true)}
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
        {hostLeftMessage && (
          <div className="max-w-lg mx-auto mt-4 px-4 py-3 bg-amber-500/20 border border-amber-500 text-amber-200 rounded-xl text-xs font-bold text-center flex items-center justify-between gap-3 shadow-lg shadow-amber-950/40 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">👋</span>
              <span>{hostLeftMessage}</span>
            </div>
            <button
              onClick={clearHostLeftMessage}
              className="px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 text-[11px] transition-colors"
            >
              OK
            </button>
          </div>
        )}
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

      <FriendsModal
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
        currentUser={userProfile}
        friends={friends}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
        currentRoomId={room?.roomId}
      />

      <NicknameSetupModal
        isOpen={showNicknameSetup}
        onClose={() => setShowNicknameSetup(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          handleUpdateProfile(updated);
          setShowNicknameSetup(false);
        }}
        isFirstLogin={!userProfile.nicknameLocked}
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
