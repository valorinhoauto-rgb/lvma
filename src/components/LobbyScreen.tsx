/**
 * Lobby Screen for STOP + TERMO
 */

import React, { useState } from 'react';
import { Copy, Check, Users, Bot, Settings, Play, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/words.ts';
import { JUICE_THEMES } from '../data/juicePhotos.ts';
import { ChatMessage } from '../hooks/useGameSocket.ts';
import { Player, RoomSettings, RoomState } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface LobbyScreenProps {
  room: RoomState;
  currentUserId: string;
  chatMessages: ChatMessage[];
  onStartGame: () => void;
  onAddBot: () => void;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onSendChat: (text: string) => void;
  onLeaveRoom: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  currentUserId,
  chatMessages,
  onStartGame,
  onAddBot,
  onUpdateSettings,
  onSendChat,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const isHost = room.hostId === currentUserId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleCategory = (catId: string) => {
    if (!isHost) return;
    const current = room.settings.selectedCategories;
    let next: string[];
    if (current.includes(catId)) {
      if (current.length <= 1) return; // keep at least 1 category
      next = current.filter(c => c !== catId);
    } else {
      next = [...current, catId];
    }
    sound.playClick();
    onUpdateSettings({ selectedCategories: next });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  const sendQuickReaction = (reaction: string) => {
    sound.playClick();
    onSendChat(reaction);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with Leave & Code */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          id="btn-lobby-leave"
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Sair da Sala
        </button>

        {/* Room Code Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/10">
          <span className="text-xs text-slate-400 font-semibold uppercase">Código da Sala:</span>
          <span className="font-mono text-lg font-black text-emerald-400 tracking-wider">{room.roomId}</span>
          <button
            id="btn-copy-room-code"
            onClick={handleCopyCode}
            title="Copiar código"
            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors ml-1"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Players & Start CTA */}
        <div className="md:col-span-2 space-y-6">
          {/* Players Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-base text-white">Jogadores na Sala ({room.players.length})</h2>
              </div>

              {isHost && (
                <button
                  id="btn-add-bot"
                  onClick={() => {
                    sound.playClick();
                    onAddBot();
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                  <span>+ Adicionar Bot</span>
                </button>
              )}
            </div>

            {/* Players Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {room.players.map((p) => {
                const isCurrent = p.id === currentUserId;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isHost && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                              👑 Host
                            </span>
                          )}
                          {p.isBot && (
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-semibold">
                              BOT
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {isCurrent ? 'Você' : p.isBot ? 'Simulado' : 'Online'}
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary of Current Match Settings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-4 flex-wrap">
              <div><span className="text-slate-500 font-semibold">Rodadas:</span> <strong className="text-white">{room.settings.totalRounds}</strong></div>
              <div><span className="text-slate-500 font-semibold">Tempo:</span> <strong className="text-white">{room.settings.timeLimit}s</strong></div>
              <div><span className="text-slate-500 font-semibold">Categorias:</span> <strong className="text-emerald-400">{room.settings.selectedCategories.length} ativas</strong></div>
              {room.settings.allowRestrictions && (
                <div className="text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Modo Restrições TERMO
                </div>
              )}
            </div>

            {isHost && (
              <button
                id="btn-toggle-settings"
                onClick={() => setShowSettings(!showSettings)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                {showSettings ? 'Fechar Configurações' : 'Editar Regras'}
              </button>
            )}
          </div>

          {/* Start CTA */}
          {isHost ? (
            <button
              id="btn-lobby-start-game"
              onClick={() => {
                sound.playSuccess();
                onStartGame();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black p-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 text-base sm:text-lg transition-all active:scale-[0.98]"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>COMEÇAR PARTIDA</span>
            </button>
          ) : (
            <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              Aguardando o anfitrião iniciar a partida...
            </div>
          )}
        </div>

        {/* Right Col: Settings & Chat */}
        <div className="space-y-6">
          {/* Settings Panel (always expandable, or if showSettings is true) */}
          {(showSettings || isHost) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Configurações da Sala</span>
              </div>

              {/* Game Mode Selector */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Modo de Jogo</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ gameMode: 'stop_termo' })}
                    className={`p-2 rounded-lg text-center text-xs border transition-colors ${
                      room.settings.gameMode === 'stop_termo'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">STOP+TERMO</div>
                    <div className="text-[10px] text-slate-400">Com Votação</div>
                  </button>

                  <button
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ gameMode: 'termo_multiplayer' })}
                    className={`p-2 rounded-lg text-center text-xs border transition-colors ${
                      room.settings.gameMode === 'termo_multiplayer'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">TERMO Coop</div>
                    <div className="text-[10px] text-slate-400">Mesma Palavra</div>
                  </button>

                  <button
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ gameMode: 'juice_photo' })}
                    className={`p-2 rounded-lg text-center text-xs border transition-colors ${
                      room.settings.gameMode === 'juice_photo'
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">Juice / Fotos</div>
                    <div className="text-[10px] text-slate-400">Adivinhe a Imagem</div>
                  </button>
                </div>
              </div>

              {/* Tema Temático do Modo Juice (Com foco no Brasil) */}
              {room.settings.gameMode === 'juice_photo' && (
                <div className="bg-pink-950/20 border border-pink-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-pink-300 font-bold flex items-center gap-1.5">
                      <span>📸 Tema das Imagens</span>
                    </label>
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold border border-pink-500/30">
                      Brasil em Destaque 🇧🇷
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {JUICE_THEMES.map((theme) => {
                      const isSelected = (room.settings.juiceTheme || 'brasil_geral') === theme.id;
                      return (
                        <button
                          key={theme.id}
                          disabled={!isHost}
                          onClick={() => onUpdateSettings({ juiceTheme: theme.id })}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-pink-500/25 border-pink-400 text-pink-200 font-bold shadow-sm shadow-pink-500/20'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <span>{theme.emoji}</span>
                            <span className="truncate">{theme.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                            {theme.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rounds count */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Quantidade de Rodadas</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 5, 7, 10].map((num) => (
                    <button
                      key={num}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ totalRounds: num })}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        room.settings.totalRounds === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Tempo por Rodada</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 20, 30, 45].map((sec) => (
                    <button
                      key={sec}
                      disabled={!isHost}
                      onClick={() => onUpdateSettings({ timeLimit: sec })}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        room.settings.timeLimit === sec
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Scoring Style */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Sistema de Pontuação</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ scoringStyle: 'dynamic' })}
                    className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                      room.settings.scoringStyle === 'dynamic'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Dinâmica</div>
                    <div className="text-[10px] text-slate-400">100 + Velocidade + Raridade</div>
                  </button>

                  <button
                    disabled={!isHost}
                    onClick={() => onUpdateSettings({ scoringStyle: 'classic_stop' })}
                    className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                      room.settings.scoringStyle === 'classic_stop'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>STOP Clássico</div>
                    <div className="text-[10px] text-slate-400">10 Único / 5 Repetido</div>
                  </button>
                </div>
              </div>

              {/* Hybrid TERMO Restrictions Mode toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isHost}
                    checked={room.settings.allowRestrictions}
                    onChange={(e) => onUpdateSettings({ allowRestrictions: e.target.checked })}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-950"
                  />
                  <span className="text-xs font-semibold text-amber-300">
                    Ativar Restrições TERMO (Letra proibida/obrigatória)
                  </span>
                </label>
              </div>

              {/* Categories Pills */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Categorias Permitidas</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  {CATEGORIES.map((cat) => {
                    const active = room.settings.selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        disabled={!isHost}
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Chat Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-64">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Chat da Sala</div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-slate-500 text-center py-8">Nenhuma mensagem ainda. Diga oi! 👋</div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
                    <span className="font-bold text-emerald-400 mr-1.5">{msg.avatar} {msg.senderName}:</span>
                    <span className="text-slate-200">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Reactions */}
            <div className="flex gap-1 py-2 overflow-x-auto">
              {['STOP! ✋', 'Boa sorte! 🍀', 'Quase! ⚡', 'Valendo! 🔥'].map((rec, i) => (
                <button
                  key={i}
                  onClick={() => sendQuickReaction(rec)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 whitespace-nowrap"
                >
                  {rec}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-1.5 mt-1">
              <input
                id="input-chat-message"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar mensagem..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold text-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
