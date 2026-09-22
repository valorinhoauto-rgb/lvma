/**
 * Word Explorer & Suggestion Modal for STOP + TERMO
 * Permite explorar o banco de palavras e sugerir novas palavras conforme itens 28 e 29 da especificação.
 */

import React, { useEffect, useState } from 'react';
import { X, PlusCircle, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../data/words.ts';
import { sound } from '../utils/audio.ts';

interface WordExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export const WordExplorerModal: React.FC<WordExplorerModalProps> = ({
  isOpen,
  onClose,
  playerName
}) => {
  const [tab, setTab] = useState<'explorer' | 'suggest'>('explorer');
  const [selectedCat, setSelectedCat] = useState<string>('animal');
  const [combinations, setCombinations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Suggestion Form state
  const [suggestWord, setSuggestWord] = useState('');
  const [suggestCat, setSuggestCat] = useState('animal');
  const [suggestSent, setSuggestSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/words/stats')
      .then(r => r.json())
      .then(data => setStats(data.stats))
      .catch(console.error);

    fetchCombinations(selectedCat);
  }, [isOpen, selectedCat]);

  const fetchCombinations = (category: string) => {
    fetch(`/api/words/combinations?category=${category}`)
      .then(r => r.json())
      .then(data => setCombinations(data.combinations || []))
      .catch(console.error);
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestWord.trim()) return;

    try {
      const res = await fetch('/api/words/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: suggestWord.trim(),
          category: suggestCat,
          submittedBy: playerName
        })
      });
      const data = await res.json();
      if (data.success) {
        sound.playSuccess();
        setSuggestSent(true);
        setSuggestWord('');
        setTimeout(() => setSuggestSent(false), 3000);
      }
    } catch {
      sound.playError();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-white text-base">Banco de Palavras & Dicionário</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2 gap-4">
          <button
            onClick={() => setTab('explorer')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              tab === 'explorer'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Explorador de Combinações
          </button>
          <button
            onClick={() => setTab('suggest')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              tab === 'suggest'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Sugerir Palavra
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === 'explorer' ? (
            <>
              {/* Stats overview */}
              {stats && (
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Total de Palavras</span>
                    <strong className="text-white text-sm">{stats.totalWords}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Categorias</span>
                    <strong className="text-emerald-400 text-sm">{stats.totalCategories}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Combinações Válidas</span>
                    <strong className="text-amber-300 text-sm">{stats.totalCombinations}</strong>
                  </div>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">Escolha o Tema</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCat(c.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedCat === c.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Combinations List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Combinações Jogáveis Encontradas ({combinations.length})</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Zero Impossíveis
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950/60">
                  {combinations.map((comb, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center border border-emerald-500/30">
                          {comb.letter}
                        </span>
                        <span className="text-slate-400">{comb.length} letras</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300 truncate max-w-[200px]">
                          {comb.sampleWords.join(', ')}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold font-mono">
                        {comb.wordCount} {comb.wordCount === 1 ? 'palavra' : 'palavras'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Suggestion Form */
            <form onSubmit={handleSendSuggestion} className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-slate-300">
                Acha que uma palavra legítima está faltando em nosso banco? Envie sua sugestão para revisão e expansão contínua!
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Palavra Sugerida</label>
                <input
                  type="text"
                  value={suggestWord}
                  onChange={(e) => setSuggestWord(e.target.value.toUpperCase())}
                  placeholder="Ex: MURIQUI, ACARAJÉ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Categoria Correspondente</label>
                <select
                  value={suggestCat}
                  onChange={(e) => setSuggestCat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all"
              >
                Enviar Sugestão
              </button>

              {suggestSent && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Sugestão registrada com sucesso!
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
