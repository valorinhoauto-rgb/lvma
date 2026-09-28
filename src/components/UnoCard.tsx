/**
 * Componente UnoCard
 * Renderiza fielmente as cartas do UNO utilizando os assets oficiais em SVG
 * (red_base, blue_base, green_base, yellow_base + _0 a _9, _draw2, _interdit, _revers, _wild, _wild_draw, back)
 */

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { UnoCard, UnoColor } from '../types.ts';
import { UNO_COLOR_HEX } from '../data/unoDeck.ts';

interface UnoCardProps {
  card?: UnoCard;
  faceDown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  rotation?: number; // Ângulo em graus para a pilha de descarte realista
  disabled?: boolean;
}

const SIZE_CONFIGS = {
  xs: { w: 'w-10 sm:w-12', h: 'h-15 sm:h-18' },
  sm: { w: 'w-14 sm:w-16', h: 'h-21 sm:h-24' },
  md: { w: 'w-20 sm:w-24', h: 'h-30 sm:h-36' },
  lg: { w: 'w-26 sm:w-30', h: 'h-39 sm:h-45' },
  xl: { w: 'w-32 sm:w-38', h: 'h-48 sm:h-57' }
};

export const UnoCardComponent: React.FC<UnoCardProps> = memo(({
  card,
  faceDown = false,
  size = 'md',
  isPlayable = false,
  isSelected = false,
  onClick,
  className = '',
  rotation = 0,
  disabled = false
}) => {
  const sizeConf = SIZE_CONFIGS[size];

  // Helper para obter o arquivo de overlay de acordo com o valor da carta
  const getOverlayAsset = (value: string): string => {
    switch (value) {
      case 'skip':
        return '/assets/uno/_interdit.svg';
      case 'reverse':
        return '/assets/uno/_revers.svg';
      case 'draw2':
        return '/assets/uno/_draw2.svg';
      default:
        // Números de 0 a 9
        return `/assets/uno/_${value}.svg`;
    }
  };

  // Verso da carta (Face down / Back)
  if (faceDown || !card) {
    return (
      <motion.div
        whileHover={onClick && !disabled ? { scale: 1.06, y: -4 } : undefined}
        whileTap={onClick && !disabled ? { scale: 0.96 } : undefined}
        onClick={!disabled ? onClick : undefined}
        style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        className={`relative ${sizeConf.w} ${sizeConf.h} select-none shrink-0 transition-transform ${
          onClick && !disabled ? 'cursor-pointer' : 'cursor-default'
        } ${className}`}
      >
        <img
          src="/assets/uno/back.svg"
          alt="Verso da Carta UNO"
          className="w-full h-full object-contain pointer-events-none drop-shadow-lg"
          loading="eager"
        />
      </motion.div>
    );
  }

  // Carta Coringa (Wild ou Wild Draw 4)
  const isWild = card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4';
  const wildAsset = card.value === 'wild_draw4' ? '/assets/uno/_wild_draw.svg' : '/assets/uno/_wild.svg';

  // Carta Colorida
  const baseAsset = `/assets/uno/${card.color}_base.svg`;
  const overlayAsset = getOverlayAsset(card.value);

  return (
    <motion.div
      whileHover={onClick && isPlayable && !disabled ? { scale: 1.1, y: -10, zIndex: 40 } : undefined}
      whileTap={onClick && isPlayable && !disabled ? { scale: 0.95 } : undefined}
      onClick={isPlayable && !disabled ? onClick : undefined}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined
      }}
      className={`relative ${sizeConf.w} ${sizeConf.h} select-none shrink-0 transition-all duration-150 ${
        isPlayable && !disabled
          ? 'cursor-pointer ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-xl sm:rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-2xl'
          : disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-default opacity-85'
      } ${isSelected ? 'ring-4 ring-emerald-400 scale-105' : ''} ${className}`}
    >
      {/* Indicador pulsante dourado para cartas jogáveis */}
      {isPlayable && !disabled && (
        <span className="absolute -top-1 -right-1 z-30 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-white" />
        </span>
      )}

      {isWild ? (
        // Coringa completo
        <img
          src={wildAsset}
          alt={card.value === 'wild_draw4' ? 'Coringa Compre 4' : 'Coringa Mudar Cor'}
          className="w-full h-full object-contain pointer-events-none drop-shadow-md rounded-xl sm:rounded-2xl"
          loading="eager"
        />
      ) : (
        // Composição de base colorida + overlay do símbolo/número
        <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden drop-shadow-md">
          {/* Base Colorida */}
          <img
            src={baseAsset}
            alt={`Base ${card.color}`}
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
          />
          {/* Overlay do Símbolo / Número */}
          <img
            src={overlayAsset}
            alt={card.value}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            loading="eager"
          />
        </div>
      )}
    </motion.div>
  );
});

UnoCardComponent.displayName = 'UnoCardComponent';
