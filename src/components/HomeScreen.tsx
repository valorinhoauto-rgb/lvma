import React, { useState } from 'react';
import { Play, PlusCircle, Users, Target, Sparkles, ArrowRight, Camera, Award, Coffee, Heart } from 'lucide-react';
import { GameMode, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface HomeScreenProps {
  userProfile: UserProfile;
  onQuickPlay: (mode?: GameMode) => void;
  onCreateRoom: (mode?: GameMode) => void;
  onJoinRoom: (code: string) => void;
  onStartTermoMode: () => void;
  onOpenHowToPlay: () => void;
  onOpenDictionary: () => void;
  onOpenForcaDuoModal: () => void;
  onOpenTournaments?: () => void;
  onOpenSupport?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onQuickPlay,
  onCreateRoom,
  onJoinRoom,
  onStartTermoMode,
  onOpenHowToPlay,
  onOpenDictionary,
  onOpenForcaDuoModal,
  onOpenTournaments,
  onOpenSupport
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = roomCodeInput.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setJoinError('Insira um código válido.');
      sound.playError();
      return;
    }
    setJoinError('');
    sound.playClick();
    onJoinRoom(clean);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Hero Presentation */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MALM • STOP, TERMO & Desafio Juice</span>
        </div>

        <div className="flex items-center justify-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-xl shadow-emerald-500/20 border border-slate-700/80 bg-slate-950 p-0.5 shrink-0">
            <img src="/favicon.svg" alt="MALM Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-['Outfit']">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">MALM</span>
          </h1>
        </div>

        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-normal">
          Jogos multiplayer de palavras e adivinhação: STOP + TERMO com votação da galera, Modo Juice fotográfico e TERMO coletivo!
        </p>
      </div>

      {/* Competitive Tournaments Arena Hero Card */}
      {onOpenTournaments && (
        <div className="max-w-2xl mx-auto">
          <button
            id="btn-home-tournaments-arena"
            onClick={() => {
              sound.playClick();
              onOpenTournaments();
            }}
            className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-950/20 group transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0 transform group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black font-['Outfit'] text-white group-hover:text-amber-200 transition-colors">
                    ARENA DE TORNEIOS
                  </span>
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                    NOVO
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 font-medium">
                  Dispute copas de UNO, Stop e Termo com premiação em moedas para o Top 3!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-500/20">
              <div className="bg-slate-950/80 border border-amber-500/40 px-3 py-1.5 rounded-xl text-left">
                <div className="text-[9px] uppercase font-bold text-slate-400 leading-none">Seu Saldo</div>
                <div className="text-xs font-black text-amber-300 font-mono mt-0.5">
                  🪙 {userProfile.malmCoins ?? 250}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-colors group-hover:translate-x-0.5 shrink-0">
                <span>Acessar Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Main Action Buttons Grid */}
      <div className="grid sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto">
        {/* Quick Play CTA - STOP + TERMO with Voting */}
        <button
          id="btn-home-quick-play"
          onClick={() => {
            sound.playClick();
            onQuickPlay('stop_termo');
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black p-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-between transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-slate-950/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="text-base font-black font-['Outfit'] leading-tight">STOP + TERMO</div>
              <div className="text-xs font-semibold text-slate-900/80">Com Votação da Galera nas respostas</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-950 transform group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Juice Mode Photo Challenge */}
        <button
          id="btn-home-juice-mode"
          onClick={() => {
            sound.playClick();
            onQuickPlay('juice_photo');
          }}
          className="w-full bg-gradient-to-r from-pink-500/20 via-rose-500/15 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/40 text-white font-bold p-4 rounded-2xl flex items-center justify-between transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <Camera className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-['Outfit'] text-pink-300 leading-tight">MODO JUICE / FOTOS</span>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-bold border border-pink-500/40">
                  🇧🇷 Temas BR
                </span>
              </div>
              <div className="text-xs font-medium text-slate-300">Lençóis Maranhenses, bandas, cantores, atores e marcas do Brasil</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-pink-300 transform group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Multiplayer Termo Mode */}
        <button
          id="btn-home-termo-multiplayer"
          onClick={() => {
            sound.playClick();
            onQuickPlay('termo_multiplayer');
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-white font-bold p-4 rounded-2xl flex items-center justify-between transition-all duration-200 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-base font-black font-['Outfit'] text-amber-300 leading-tight">TERMO MULTIPLAYER</div>
              <div className="text-xs font-medium text-slate-400">Todos adivinham a mesma palavra secreta</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-300 transform group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Jogo da Forca (Nostalgia da Infância • Multiplayer & Dupla) */}
        <div className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/10 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between gap-2.5 shadow-lg shadow-amber-950/20">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
              🪢
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-['Outfit'] text-amber-300 leading-tight">JOGO DA FORCA</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/40">
                  Infância
                </span>
              </div>
              <div className="text-xs font-medium text-slate-300 truncate">
                6 vidas, adivinhe letra por letra ou arrisque a palavra
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              id="btn-home-forca-multiplayer"
              onClick={() => {
                sound.playClick();
                onQuickPlay('forca');
              }}
              className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jogar Online</span>
            </button>

            <button
              id="btn-home-forca-duo"
              onClick={() => {
                sound.playClick();
                onOpenForcaDuoModal();
              }}
              className="py-2 px-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Duelo Dupla</span>
            </button>
          </div>
        </div>

        {/* Jogo UNO (Cartas & Ação • Regras Oficiais) */}
        <div className="w-full bg-gradient-to-r from-red-600/25 via-amber-600/20 to-emerald-600/20 hover:from-red-600/35 hover:to-emerald-600/30 border border-red-500/50 rounded-2xl p-4 flex flex-col justify-between gap-2.5 shadow-xl shadow-red-950/30 transition-all duration-200">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-black/50 border border-red-500/40 p-1 flex items-center justify-center shrink-0">
              <img src="/assets/uno/logo.svg" alt="UNO Logo" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-['Outfit'] text-red-400 leading-tight">JOGO UNO</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-bold border border-red-500/40">
                  Cartas Oficiais
                </span>
              </div>
              <div className="text-xs font-medium text-slate-300 truncate">
                108 cartas, Bloqueio, Inverter, +2, Coringas, Grito de UNO e Bots!
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              id="btn-home-uno-multiplayer"
              onClick={() => {
                sound.playClick();
                onQuickPlay('uno');
              }}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jogar UNO Online</span>
            </button>

            <button
              id="btn-home-uno-bots"
              onClick={() => {
                sound.playClick();
                onQuickPlay('uno');
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Jogar com Bots</span>
            </button>
          </div>
        </div>

        {/* Create Private Room */}
        <button
          id="btn-home-create-room"
          onClick={() => {
            sound.playClick();
            onCreateRoom();
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold p-4 rounded-2xl flex items-center justify-between transition-all duration-200 group active:scale-[0.98] sm:col-span-2"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-base font-extrabold font-['Outfit'] leading-tight">CRIAR SALA CUSTOM</div>
              <div className="text-xs font-medium text-slate-400">Escolha modos, categorias, rodadas e tempo</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Join Room Form & Solo Practice */}
      <div className="grid sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto">
        <form
          onSubmit={handleJoinSubmit}
          className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-2.5"
        >
          <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase">
            <Users className="w-4 h-4 text-teal-400" />
            <span>Entrar com Código</span>
          </div>

          <div className="flex gap-2">
            <input
              id="input-room-code"
              type="text"
              maxLength={6}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Código (ex: X7K9P)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              id="btn-submit-join-room"
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shrink-0"
            >
              Entrar
            </button>
          </div>
          {joinError && <p className="text-rose-400 text-xs font-semibold">{joinError}</p>}
        </form>

        {/* Solo Termo Practice Mode */}
        <button
          id="btn-home-termo-mode"
          onClick={() => {
            sound.playClick();
            onStartTermoMode();
          }}
          className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Treino Solo (TERMO)</div>
              <div className="text-xs text-slate-400">Jogue sem tempo para praticar palavras</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-center">
          <div className="text-emerald-400 font-bold text-xs mb-0.5">Votação da Galera</div>
          <p className="text-slate-400 text-[11px]">Respostas zoeiras e gírias contextuais são validadas por voto comunitário.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-center">
          <div className="text-pink-400 font-bold text-xs mb-0.5">Modo Juice / Fotos</div>
          <p className="text-slate-400 text-[11px]">Adivinhe artistas, espécies e pontos turísticos a partir de imagens.</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-center">
          <div className="text-amber-400 font-bold text-xs mb-0.5">TERMO Multiplayer</div>
          <p className="text-slate-400 text-[11px]">Adivinhe palavras secretas de 5 e 6 letras em competição simultânea.</p>
        </div>
      </div>

      {/* Community & Donation Footer Banner */}
      {onOpenSupport && (
        <div className="max-w-2xl mx-auto pt-2">
          <button
            id="btn-home-support-banner"
            onClick={() => {
              sound.playClick();
              onOpenSupport();
            }}
            className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>Gostou do jogo? Pague um cafézinho aos desenvolvedores</span>
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Ajude a manter os servidores ativos sem propagandas. Ganhe badge exclusivo e nome dourado!
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 hidden sm:inline">
              Apoiar via PIX →
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
