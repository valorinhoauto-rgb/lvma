/**
 * How to Play Modal for STOP + TERMO
 * Manual visual claro e objetivo com as regras do jogo.
 */

import React from 'react';
import { X, HelpCircle, Check, Sparkles, ShieldCheck, Target, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-white text-base">Como Jogar no MALM</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1 leading-relaxed">
          {/* Concept */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              1. O Conceito Fundamental
            </h3>
            <p>
              A cada rodada você recebe um desafio triplo que deve ser satisfeito simultaneamente antes que o tempo se esgote:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Letra</span>
                <strong className="text-emerald-400 text-lg">M</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tema</span>
                <strong className="text-white text-xs">Animais</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tamanho</span>
                <strong className="text-amber-300 text-sm">6 Letras</strong>
              </div>
            </div>
            <p className="pt-1 text-slate-400">
              Exemplo de resposta perfeita: <strong className="text-white font-mono">MACACO</strong> (Começa com M, é animal, tem 6 letras).
            </p>
          </div>

          {/* Zero Impossible Rounds */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-1.5">
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Garantia de Rodadas Jogáveis
            </div>
            <p className="text-slate-300">
              Diferente de sorteios cegos tradicionais, o motor do jogo consulta um índice pré-processado. Toda combinação sorteada possui <strong>pelo menos uma palavra válida</strong> cadastrada no dicionário!
            </p>
          </div>

          {/* Scoring */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Como Funciona a Pontuação
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong className="text-white">Pontos Base:</strong> 100 pontos por qualquer resposta válida aceita.</li>
              <li><strong className="text-teal-300">Bônus de Velocidade:</strong> Até +50 pontos extras quanto mais rápido você responder.</li>
              <li><strong className="text-amber-300">Bônus de Raridade:</strong> +50 pontos caso nenhum outro jogador na sala tenha usado a mesma palavra.</li>
            </ul>
          </div>

          {/* Termo Mode */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              3. O Modo TERMO
            </h3>
            <p>
              No modo TERMO, o jogo escolhe uma palavra secreta. Você tem até 6 tentativas para adivinhá-la com o auxílio das cores:
            </p>
            <div className="space-y-1 font-mono text-[11px] pt-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center font-bold text-white">V</span>
                <span>Verde: Letra correta na posição certa.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center font-bold text-white">A</span>
                <span>Amarelo: Letra faz parte da palavra, mas em outra posição.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">C</span>
                <span>Cinza: Letra não existe na palavra secreta.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all"
          >
            Entendido, vamos jogar!
          </button>
        </div>
      </div>
    </div>
  );
};
