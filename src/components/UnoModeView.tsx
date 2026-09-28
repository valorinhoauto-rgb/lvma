/**
 * UnoModeView.tsx
 * Tela imersiva do Jogo de Cartas UNO com os assets oficiais,
 * mesa realista com background em degradê, pilha de descarte animada,
 * baralho de compras 3D, leque de cartas, grito e denúncia de UNO,
 * seleção de cores e suporte a bots e multiplayer.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { Player, RoundConfig, UnoCard, UnoColor, UnoGameState } from '../types.ts';
import { UnoCardComponent } from './UnoCard.tsx';
import { UNO_COLORS, UNO_COLOR_HEX, UNO_COLOR_NAMES, isValidUnoMove } from '../data/unoDeck.ts';
import { sound } from '../utils/audio.ts';
import { clientGameEngine } from '../utils/clientGameEngine.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface UnoModeViewProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  onPlayCard: (cardId: string, chosenColor?: UnoColor) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onCallUno: () => void;
  onCatchUno: (targetPlayerId: string) => void;
}

export const UnoModeView: React.FC<UnoModeViewProps> = ({
  round,
  players,
  currentUserId,
  onPlayCard,
  onDrawCard,
  onPassTurn,
  onCallUno,
  onCatchUno
}) => {
  const unoState = round.unoState;
  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [unoShoutAnimation, setUnoShoutAnimation] = useState(false);

  if (!unoState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="animate-spin text-4xl">🎴</div>
        <p className="text-slate-300 font-bold text-lg">Carregando partida de UNO...</p>
      </div>
    );
  }

  const {
    hands,
    drawDeck,
    topCard,
    currentColor,
    currentTurnPlayerId,
    direction,
    unoCalled,
    hasDrawnThisTurn,
    drawnCardId,
    lastAction
  } = unoState;

  const isMyTurn = currentTurnPlayerId === currentUserId;
  const myHand = hands[currentUserId] || [];
  const myPlayer = players.find(p => p.id === currentUserId);
  const opponents = players.filter(p => p.id !== currentUserId);

  // Carta comprada neste turno (se houver)
  const drawnCard = drawnCardId ? myHand.find(c => c.id === drawnCardId) : undefined;
  const canPlayDrawnCard = drawnCard ? isValidUnoMove(drawnCard, topCard, currentColor) : false;

  // Jogador atual da rodada
  const activeTurnPlayer = players.find(p => p.id === currentTurnPlayerId);

  // Som de distribuição de cartas ao carregar a partida
  useEffect(() => {
    sound.playCardDeal();
  }, []);

  // Notificação sonora quando for a vez do usuário
  const prevTurnRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentTurnPlayerId === currentUserId && prevTurnRef.current !== currentUserId) {
      sound.playTurnNotification();
    }
    prevTurnRef.current = currentTurnPlayerId;
  }, [currentTurnPlayerId, currentUserId]);

  // Vitória sonora quando alguém bate no UNO
  useEffect(() => {
    if (unoState.winnerId) {
      sound.playVictoryToken();
    }
  }, [unoState.winnerId]);

  // Efeitos sonoros contextuais quando um INIMIGO / OPONENTE joga carta ou executa ação
  const prevActionRef = useRef<typeof lastAction | undefined>(undefined);
  useEffect(() => {
    if (!lastAction) return;

    // Evita repetir o mesmo som caso a mesma referência de lastAction persista
    const prev = prevActionRef.current;
    if (
      prev &&
      prev.playerId === lastAction.playerId &&
      prev.action === lastAction.action &&
      prev.card?.id === lastAction.card?.id &&
      prev.message === lastAction.message
    ) {
      return;
    }
    prevActionRef.current = lastAction;

    // Se a ação foi executada pelo usuário local, o som já foi tocado na interação dele
    if (lastAction.playerId === currentUserId) return;

    // SONS DE AÇÕES DO INIMIGO / BOTS:
    if (lastAction.action === 'play' && lastAction.card) {
      const c = lastAction.card;
      if (c.value === 'skip') {
        sound.playCardStop();
      } else if (c.value === 'reverse') {
        sound.playCardUTurn();
      } else if (c.value === 'draw2' || c.value === 'wild_draw4') {
        sound.playCardPunish();
      } else if (c.color === 'wild' || c.value === 'wild') {
        sound.playCardWild();
      } else {
        // Carta numérica / comum jogada pelo inimigo
        sound.playCardPlay();
      }
    } else if (lastAction.action === 'draw') {
      sound.playCardDraw();
    } else if (lastAction.action === 'uno') {
      sound.playUnoShout();
    } else if (lastAction.action === 'catch_uno') {
      sound.playCardPunish();
    }
  }, [lastAction, currentUserId]);

  // Orquestrador e Watchdog de segurança da UI: garante que a IA dos bots nunca fique travada
  useEffect(() => {
    const isBotTurn = Boolean(activeTurnPlayer?.isBot || currentTurnPlayerId.startsWith('bot_'));
    if (!isBotTurn || unoState.winnerId) return;

    // Dispara a rotina de turno do bot imediatamente com executor definido
    clientGameEngine.setMyPlayerId(currentUserId);
    clientGameEngine.triggerBotUnoTurnIfNeeded(currentUserId);

    // Watchdog de segurança da UI: se por qualquer razão externa o turno persistir, força a execução
    const watchdog = setTimeout(() => {
      if (unoState.currentTurnPlayerId === currentTurnPlayerId && !unoState.winnerId) {
        console.warn('UI Watchdog: bot demorou para jogar, reativando rotina de turno');
        clientGameEngine.triggerBotUnoTurnIfNeeded(currentUserId);
      }
    }, 2200);

    return () => clearTimeout(watchdog);
  }, [currentTurnPlayerId, activeTurnPlayer?.isBot, unoState.winnerId, currentUserId]);

  // Manipula clique em uma carta da mão
  const handleCardClick = (card: UnoCard) => {
    if (!isMyTurn) return;

    if (!isValidUnoMove(card, topCard, currentColor)) {
      sound.playError();
      return;
    }

    // Se for Coringa ou Coringa +4, abre o modal de escolha de cor
    if (card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4') {
      sound.playCardPick();
      setSelectedWildCard(card);
      return;
    }

    // Efeitos de áudio contextuais para cada tipo de carta
    if (card.value === 'skip') {
      sound.playCardStop();
    } else if (card.value === 'reverse') {
      sound.playCardUTurn();
    } else if (card.value === 'draw2') {
      sound.playCardPunish();
    } else {
      sound.playCardPlay();
    }

    onPlayCard(card.id);
  };

  // Escolha de cor para carta Coringa
  const handleSelectWildColor = (color: UnoColor) => {
    if (!selectedWildCard) return;
    if (selectedWildCard.value === 'wild_draw4') {
      sound.playCardPunish();
    } else {
      sound.playWildSwitch();
    }
    onPlayCard(selectedWildCard.id, color);
    setSelectedWildCard(null);
  };

  // Compra carta do baralho
  const handleDrawClick = () => {
    if (!isMyTurn || hasDrawnThisTurn) return;
    sound.playCardDraw();
    onDrawCard();
  };

  // Grita UNO!
  const handleShoutUno = () => {
    sound.playUnoShout();
    setUnoShoutAnimation(true);
    setTimeout(() => setUnoShoutAnimation(false), 2000);
    onCallUno();
  };

  // Denuncia oponente que não gritou UNO
  const handleDenounceOpponent = (opponentId: string) => {
    sound.playCardPunish();
    onCatchUno(opponentId);
  };

  return (
    <div
      className="relative w-full min-h-[calc(100vh-80px)] rounded-3xl overflow-hidden flex flex-col justify-between p-3 sm:p-5 shadow-2xl border border-red-950/60"
      style={{
        backgroundImage: "url('/assets/uno/background.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* ================================================================= */}
      {/* TOPO: CABEÇALHO COM LOGO, RODADA, TURNO & REGRAS */}
      {/* ================================================================= */}
      <div className="flex items-center justify-between gap-3 z-10 bg-black/40 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
        {/* Logo UNO e info da rodada */}
        <div className="flex items-center gap-3">
          <img src="/assets/uno/logo.svg" alt="UNO Logo" className="h-8 sm:h-10 object-contain drop-shadow" />
          <div className="hidden sm:block">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
              Rodada {round.roundNumber} de {round.totalRounds}
            </span>
            <span className="text-xs text-slate-300 font-medium">Regras Oficiais</span>
          </div>
        </div>

        {/* Indicador central de Turno */}
        <div className="flex items-center gap-2">
          {isMyTurn ? (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400 px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider">
                👉 É A SUA VEZ DE JOGAR!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                Vez de: <strong className="text-amber-300">{activeTurnPlayer?.name || 'Aguardando...'}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Botão de Regras */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Regras</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* OPONENTES (DISTRIBUÍDOS NO TOPO DA MESA) */}
      {/* ================================================================= */}
      <div className="flex items-center justify-around gap-2 sm:gap-4 my-2 z-10 flex-wrap">
        {opponents.map((opp) => {
          const oppHand = hands[opp.id] || [];
          const isOppTurn = opp.id === currentTurnPlayerId;
          const hasOneCard = oppHand.length === 1;
          const oppCalledUno = Boolean(unoCalled[opp.id]);
          const canDenounce = hasOneCard && !oppCalledUno && opp.id !== currentUserId;

          return (
            <div
              key={opp.id}
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-300 relative ${
                isOppTurn
                  ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/30 scale-105 ring-2 ring-amber-400'
                  : 'bg-black/50 border-white/10 backdrop-blur-sm'
              }`}
            >
              {/* Avatar e Nome */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <PlayerAvatar avatar={opp.avatar} avatarColor={opp.avatarColor} size="sm" />
                  {isOppTurn && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="max-w-[85px] sm:max-w-[120px] truncate">{opp.name}</span>
                    {opp.isBot && (
                      <span className="text-[9px] bg-sky-500/30 text-sky-300 px-1 py-0.2 rounded font-semibold border border-sky-400/40">
                        BOT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <span>🃏 {oppHand.length}</span>
                    <span>{oppHand.length === 1 ? 'carta' : 'cartas'}</span>
                  </div>
                </div>
              </div>

              {/* Cartas do oponente (miniatura de cartas viradas) */}
              <div className="flex items-center justify-center -space-x-4 mt-2 h-10 overflow-hidden px-1">
                {oppHand.slice(0, Math.min(oppHand.length, 6)).map((_, idx) => (
                  <UnoCardComponent
                    key={idx}
                    faceDown
                    size="xs"
                    rotation={(idx - Math.min(oppHand.length, 6) / 2) * 5}
                    className="shadow-sm"
                  />
                ))}
                {oppHand.length > 6 && (
                  <span className="text-[10px] font-black text-amber-300 bg-black/80 px-1.5 py-0.5 rounded-full z-20 border border-amber-400 ml-1">
                    +{oppHand.length - 6}
                  </span>
                )}
              </div>

              {/* Alerta de 1 carta / Botão de Denunciar UNO */}
              {hasOneCard && (
                <div className="mt-1.5 flex flex-col items-center gap-1">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-md animate-bounce ${
                      oppCalledUno
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                        : 'bg-rose-500/40 text-rose-200 border-rose-400'
                    }`}
                  >
                    {oppCalledUno ? '📣 GRITOU UNO!' : '⚠️ 1 CARTA!'}
                  </span>

                  {canDenounce && (
                    <button
                      onClick={() => handleDenounceOpponent(opp.id)}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] px-2.5 py-1 rounded-lg shadow-lg shadow-rose-600/40 border border-rose-300 flex items-center gap-1 animate-pulse cursor-pointer transition-all active:scale-95"
                      title="Forçar oponente a comprar 2 cartas por não gritar UNO"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>DENUNCIAR!</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* CENTRO DA MESA: PILHA DE DESCARTE & BARALHO DE COMPRA COM ANIMAÇÕES */}
      {/* ================================================================= */}
      <div className="relative flex flex-col items-center justify-center my-3 sm:my-5 z-10">
        {/* Mensagem da última ação */}
        {lastAction && (
          <motion.div
            key={lastAction.message}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-1 bg-black/60 border border-amber-400/40 rounded-full text-xs font-semibold text-amber-200 shadow-lg text-center max-w-md truncate"
          >
            {lastAction.message}
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-6 sm:gap-12 relative">
          {/* BARALHO DE COMPRAS (DECK) */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <motion.div
                whileHover={isMyTurn && !hasDrawnThisTurn ? { scale: 1.08, y: -4 } : undefined}
                whileTap={isMyTurn && !hasDrawnThisTurn ? { scale: 0.95 } : undefined}
                onClick={handleDrawClick}
                className={`relative w-22 sm:w-28 h-32 sm:h-42 rounded-2xl cursor-${
                  isMyTurn && !hasDrawnThisTurn ? 'pointer' : 'default'
                } transition-all select-none ${
                  isMyTurn && !hasDrawnThisTurn
                    ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-2xl shadow-amber-500/40'
                    : 'opacity-90'
                }`}
              >
                <img
                  src="/assets/uno/deck.svg"
                  alt="Baralho de Compras UNO"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
                />

                {/* Badge de quantidade no baralho */}
                <div className="absolute -bottom-2 -right-2 bg-black/90 text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-400/50 shadow">
                  {drawDeck.length}
                </div>
              </motion.div>

              {/* Botão pulsante para comprar carta se for seu turno */}
              {isMyTurn && !hasDrawnThisTurn && (
                <button
                  onClick={handleDrawClick}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg border border-white animate-bounce cursor-pointer whitespace-nowrap"
                >
                  Comprar Carta
                </button>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-300 mt-2">Comprar</span>
          </div>

          {/* INDICADOR DE DIREÇÃO CENTRAL */}
          <div className="flex flex-col items-center justify-center relative">
            <div
              className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 flex items-center justify-center shadow-inner"
              title={direction === 1 ? 'Sentido Horário' : 'Sentido Anti-horário'}
            >
              {direction === 1 ? (
                <RotateCw className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              ) : (
                <RotateCcw className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">
              {direction === 1 ? 'Horário' : 'Anti-horário'}
            </span>
          </div>

          {/* PILHA DE DESCARTE (TOP CARD) */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Efeito de cartas embaixo simulando pilha real */}
              <div className="absolute inset-0 w-22 sm:w-28 h-32 sm:h-42 rounded-2xl bg-neutral-900 border border-white/20 rotate-6 translate-x-1.5 translate-y-1.5 shadow-md pointer-events-none" />
              <div className="absolute inset-0 w-22 sm:w-28 h-32 sm:h-42 rounded-2xl bg-neutral-800 border border-white/20 -rotate-3 -translate-x-1 translate-y-1 shadow-md pointer-events-none" />

              {/* Carta do topo */}
              <motion.div
                key={topCard.id}
                initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative z-10"
              >
                <UnoCardComponent card={topCard} size="md" className="shadow-2xl" />
              </motion.div>
            </div>

            {/* Indicador da Cor Ativa */}
            <div className="flex items-center gap-1.5 mt-2 bg-black/60 px-3 py-1 rounded-full border border-white/20 shadow">
              <span
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: UNO_COLOR_HEX[currentColor] }}
              />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {UNO_COLOR_NAMES[currentColor]}
              </span>
            </div>
          </div>
        </div>

        {/* Opção pós-compra: Se o jogador comprou carta, ele pode jogar ou passar */}
        {isMyTurn && hasDrawnThisTurn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-slate-900/90 border border-amber-400/50 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md"
          >
            {drawnCard && canPlayDrawnCard ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-300 font-bold">Carta comprada é jogável!</span>
                  <button
                    onClick={() => handleCardClick(drawnCard)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Jogar Carta Comprada
                  </button>
                </div>
                <div className="w-px h-5 bg-white/20" />
              </>
            ) : (
              <span className="text-xs text-slate-300 font-medium">Carta comprada não é jogável nesta rodada.</span>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onPassTurn();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>Passar a Vez</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* ================================================================= */}
      {/* BASE: MÃO DO JOGADOR + BOTÃO GRITAR UNO */}
      {/* ================================================================= */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Barra de Ações Rápidas do Jogador */}
        <div className="w-full flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full border border-white/10">
              Sua Mão: <strong className="text-amber-400 font-mono text-sm">{myHand.length}</strong> {myHand.length === 1 ? 'carta' : 'cartas'}
            </span>

            {/* Aviso se tem apenas 1 carta */}
            {myHand.length === 1 && (
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-md uppercase ${
                  unoCalled[currentUserId]
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                    : 'bg-rose-500/30 text-rose-200 border-rose-400 animate-pulse'
                }`}
              >
                {unoCalled[currentUserId] ? 'UNO Gritado! ✅' : 'Grite UNO antes que te peguem! ⚠️'}
              </span>
            )}
          </div>

          {/* BOTÃO GRITAR UNO */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleShoutUno}
            disabled={myHand.length > 2}
            className={`font-black text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-2xl shadow-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              myHand.length <= 2
                ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white border-amber-300 shadow-red-600/50 animate-bounce'
                : 'bg-black/60 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-current text-amber-300" />
            <span className="tracking-wider">GRITAR UNO!</span>
          </motion.button>
        </div>

        {/* CARTAS NA MÃO (LEQUE COM SCROLL HORIZONTAL SUAVE) */}
        <div className="w-full overflow-x-auto pb-3 pt-2 scrollbar-thin scrollbar-thumb-amber-500/40">
          <div className="flex items-end justify-center min-w-max px-4 -space-x-3 sm:-space-x-5">
            {myHand.map((card, idx) => {
              const isPlayable = isMyTurn && isValidUnoMove(card, topCard, currentColor);
              return (
                <div
                  key={card.id}
                  className="transition-transform hover:-translate-y-4 hover:z-30"
                  onMouseEnter={() => {
                    if (isPlayable) {
                      sound.playCardSelect();
                    }
                  }}
                >
                  <UnoCardComponent
                    card={card}
                    size="md"
                    isPlayable={isPlayable}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ANIMAÇÃO DE GRITO DE UNO */}
      {/* ================================================================= */}
      <AnimatePresence>
        {unoShoutAnimation && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            className="fixed inset-0 m-auto w-72 h-44 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-r from-red-600 to-amber-500 p-6 rounded-3xl border-4 border-white shadow-2xl text-center transform -rotate-6">
              <span className="font-black italic text-5xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-tighter">
                UNO!
              </span>
              <p className="text-white font-bold text-sm mt-1 drop-shadow">Gritou com sucesso!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL DE SELEÇÃO DE COR PARA CARTA CORINGA */}
      {/* ================================================================= */}
      <AnimatePresence>
        {selectedWildCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <span>🎨</span> Escolha a Nova Cor
              </h3>
              <p className="text-xs text-slate-300">
                Selecione a cor que os próximos jogadores deverão seguir na mesa:
              </p>

              {/* 4 Quadrantes de cores */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {UNO_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => handleSelectWildColor(col)}
                    className="p-4 rounded-2xl text-white font-black text-sm uppercase shadow-lg border-2 border-white/40 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    style={{ backgroundColor: UNO_COLOR_HEX[col] }}
                  >
                    <span>{UNO_COLOR_NAMES[col]}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedWildCard(null)}
                className="w-full text-xs text-slate-400 hover:text-white py-2 transition-colors cursor-pointer"
              >
                Cancelar Jogada
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* MODAL DE REGRAS OFICIAIS DO UNO */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <img src="/assets/uno/logo.svg" alt="UNO Logo" className="h-6 object-contain" />
                  <h3 className="text-base font-black text-white">Regras Oficiais do UNO</h3>
                </div>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <div>
                  <h4 className="font-bold text-amber-400 uppercase text-[11px]">Objetivo</h4>
                  <p>Ser o primeiro jogador a ficar sem cartas na mão, jogando cartas compatíveis com o descarte.</p>
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 uppercase text-[11px]">Cartas Especiais de Ação</h4>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                    <li><strong className="text-white">Bloqueio (Skip):</strong> O próximo jogador tem sua vez pulada.</li>
                    <li><strong className="text-white">Inverter (Reverse):</strong> Inverte o sentido do jogo (horário / anti-horário). Em 2 jogadores, age como Bloqueio.</li>
                    <li><strong className="text-white">Compre 2 (+2):</strong> O próximo jogador compra 2 cartas e perde a vez.</li>
                    <li><strong className="text-white">Coringa (Wild):</strong> Permite escolher qualquer uma das 4 cores para a mesa.</li>
                    <li><strong className="text-white">Coringa +4 (Wild Draw 4):</strong> Escolhe a cor e faz o próximo jogador comprar 4 cartas e perder a vez.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 uppercase text-[11px]">Gritar "UNO!"</h4>
                  <p>
                    Ao jogar sua penúltima carta (ficando com apenas 1 carta), você DEVE gritar <strong>UNO!</strong>. Se esquecer e outro jogador te denunciar antes do próximo turno, você recebe <strong>2 cartas de penalidade</strong>!
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-amber-400 uppercase text-[11px]">Pontuação Oficial</h4>
                  <p>
                    O vencedor da rodada soma os pontos de todas as cartas nas mãos dos adversários:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-slate-300">
                    <li>Cartas de 0 a 9: Valor de face (0 a 9 pontos)</li>
                    <li>Ações (Skip, Reverse, +2): 20 pontos cada</li>
                    <li>Coringas (+4 e Coringa): 50 pontos cada</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Entendi, Voltar ao Jogo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
