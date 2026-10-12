/**
 * SupportModal Component
 * Sistema de Apoio Direto / "Pague um Café", Chave PIX Copia e Cola e Mural de Apoiadores
 */

import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Heart,
  Copy,
  Check,
  Sparkles,
  X,
  ShieldCheck,
  Award,
  Crown,
  QrCode,
  MessageSquare
} from 'lucide-react';
import { UserProfile, SupporterEntry } from '../types.ts';
import {
  SUPPORTER_TIERS,
  PIX_CONFIG,
  generatePixCopiaECola,
  activateSupporterStatus,
  subscribeSupportersWall,
  SupporterTierInfo
} from '../lib/supporterService.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface SupportModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  userProfile,
  isOpen,
  onClose,
  onUpdateProfile
}) => {
  const [selectedTier, setSelectedTier] = useState<SupporterTierInfo>(SUPPORTER_TIERS[0]);
  const [activeTab, setActiveTab] = useState<'donate' | 'wall'>('donate');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [supporterMessage, setSupporterMessage] = useState('');
  const [supportersWall, setSupportersWall] = useState<SupporterEntry[]>([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Assinatura em tempo real do mural de apoiadores
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeSupportersWall((items) => {
      setSupportersWall(items);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const pixCode = generatePixCopiaECola(selectedTier.priceBRL);

  const handleCopyPixKey = () => {
    sound.playClick();
    navigator.clipboard.writeText(PIX_CONFIG.keyValue);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyPixCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(pixCode);
    setCopiedPixCode(true);
    setTimeout(() => setCopiedPixCode(false), 2500);
  };

  const handleConfirmSupport = async () => {
    sound.playClick();
    setIsActivating(true);
    const res = await activateSupporterStatus(userProfile, selectedTier.id, supporterMessage);
    setIsActivating(false);

    if (res.success) {
      sound.playVictory();
      onUpdateProfile(res.updatedProfile);
      setFeedbackSuccess(res.message);
      setTimeout(() => {
        setFeedbackSuccess(null);
      }, 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white font-['Outfit'] tracking-tight">
                  Apoie o Projeto MALM
                </h2>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>COMUNIDADE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pague um cafézinho para os desenvolvedores e ajude a manter os servidores no ar sem anúncios chatos!
              </p>
            </div>
          </div>

          <button
            id="btn-close-support-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Success Banner */}
        {feedbackSuccess && (
          <div className="px-4 py-3 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 gap-1">
          <button
            id="tab-support-donate"
            onClick={() => {
              sound.playClick();
              setActiveTab('donate');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'donate'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Fazer Doação / Pagar Café</span>
          </button>

          <button
            id="tab-support-wall"
            onClick={() => {
              sound.playClick();
              setActiveTab('wall');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'wall'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mural de Apoiadores</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 ml-0.5">
              {supportersWall.length}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          {activeTab === 'donate' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Já é apoiador? Selo de reconhecimento */}
              {userProfile.isSupporter && (
                <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/15 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                      👑
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>Você é um {userProfile.supporterBadge || 'Apoiador Fundador'}!</span>
                        <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono text-amber-200">
                          ATIVO
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Seu apelido brilha em dourado no chat e nas salas. Muito obrigado pela força!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Escolha do Valor / Faixa */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Escolha como deseja apoiar
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {SUPPORTER_TIERS.map((tier) => {
                    const isSelected = selectedTier.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedTier(tier);
                        }}
                        className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <div>
                          <div className="text-2xl mb-1">{tier.icon}</div>
                          <div className="text-xs font-black text-white font-['Outfit']">{tier.name}</div>
                          <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                            {tier.formattedPrice}
                          </div>
                        </div>

                        <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded w-fit">
                          +{tier.coinsBonus} Moedas
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Benefícios da Faixa Selecionada */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Recompensas que você ganha com {selectedTier.name}:</span>
                  </div>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {selectedTier.formattedPrice}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 pt-1">
                  {selectedTier.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mensagem Opcional para o Mural */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mensagem para o Mural (Opcional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="Ex: Vida longa ao MALM! Ótimo jogo."
                  value={supporterMessage}
                  onChange={(e) => setSupporterMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Painel PIX Instantâneo */}
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-amber-950/20">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-xs">
                      PIX
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Pagamento Instantâneo via PIX</div>
                      <div className="text-[10px] text-slate-400">Banco Central do Brasil · Sem taxas</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Valor</div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      {selectedTier.formattedPrice}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 items-center">
                  {/* QR Code Simulado e Escaneável */}
                  <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                    <div className="w-36 h-36 bg-white rounded-xl p-2.5 shadow-inner flex flex-col items-center justify-center relative">
                      <QrCode className="w-full h-full text-slate-950" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-lg bg-teal-600 border border-white flex items-center justify-center text-[10px] font-black text-white shadow">
                          PIX
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">
                      Abra o app do seu banco e aponte a câmera
                    </span>
                  </div>

                  {/* Chave e Código Copia e Cola */}
                  <div className="space-y-3">
                    {/* Chave Pix */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Chave PIX (Email)</div>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 pl-3">
                        <span className="text-xs text-white font-mono truncate flex-1">{PIX_CONFIG.keyValue}</span>
                        <button
                          onClick={handleCopyPixKey}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Pix Copia e Cola */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Código Copia e Cola</div>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 pl-3">
                        <span className="text-xs text-slate-400 font-mono truncate flex-1">{pixCode}</span>
                        <button
                          onClick={handleCopyPixCode}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedPixCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPixCode ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Botão de Ativação Instantânea (Simulação de Confirmação) */}
                    <button
                      id="btn-confirm-pix-support"
                      onClick={handleConfirmSupport}
                      disabled={isActivating}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>Já fiz o PIX / Ativar Reconhecimento</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: MURAL DE APOIADORES */}
          {activeTab === 'wall' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Hall da Fama & Agradecimentos</span>
                </div>
                <h3 className="text-lg font-black text-white font-['Outfit']">Patronos da Comunidade MALM</h3>
                <p className="text-xs text-slate-400">
                  Jogadores que acreditaram e ajudaram a financiar o desenvolvimento deste projeto.
                </p>
              </div>

              <div className="space-y-2.5">
                {supportersWall.map((supporter, index) => {
                  return (
                    <div
                      key={supporter.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-sm hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <PlayerAvatar
                            avatar={supporter.avatar}
                            avatarColor={supporter.avatarColor}
                            size="md"
                          />
                          <div className="absolute -bottom-1 -right-1 text-xs">
                            {supporter.tier === 'servidor' ? '👑' : supporter.tier === 'pizza' ? '⭐' : '☕'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-amber-300 font-['Outfit']">
                              {supporter.nickname || supporter.name}
                            </span>
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                              {supporter.badge}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              · R$ {supporter.amountBRL.toFixed(2)}
                            </span>
                          </div>

                          {supporter.message && (
                            <p className="text-xs text-slate-300 italic bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-xl">
                              "{supporter.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 shrink-0">
                        #{index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
