/**
 * Sistema de Áudio para STOP + TERMO + UNO
 * Reproduz os assets de áudio oficiais em WAV com cache de baixa latência
 * e suporte a fallback sintetizado via Web Audio API.
 */

const AUDIO_BASE_PATH = '/assets/uno/audio';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement[]> = new Map();
  private maxPoolSize = 4;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('stop_termo_muted') === 'true';
      // Pré-carrega os sons mais frequentes
      this.preloadCommonSounds();
    }
  }

  private preloadCommonSounds() {
    const common = [
      'SFX_Card_Deal_Comm_New.wav',
      'SFX_Card_Draw_Comm_1_New.wav',
      'SFX_Card_Draw_Comm_2_New.wav',
      'SFX_Card_Effect_Show_Norm_Comm_New.wav',
      'SFX_Card_Select.wav',
      'SFX_Card_Pick.wav',
      'SFX_Card_Effect_Stop_New.wav',
      'Uno_SFX_Card_Effect_UTurn_01.wav',
      'SFX_Card_Effect_ZeroSeven_Switch_New.wav',
      'SFX_Card_Effect_Show_Punish_Comm_New.wav',
      'Uno_SFX_Gamestart_02.wav',
      'SFX_UI_Victory_Token_04.wav'
    ];

    common.forEach(filename => {
      this.getAudioElement(filename);
    });
  }

  private getAudioElement(filename: string): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    let pool = this.audioCache.get(filename);
    if (!pool) {
      pool = [];
      this.audioCache.set(filename, pool);
    }

    // Procura um elemento de áudio que não esteja tocando
    for (const audio of pool) {
      if (audio.paused || audio.ended) {
        audio.currentTime = 0;
        return audio;
      }
    }

    // Se todos do pool estiverem ocupados e não atingiu o limite, cria um novo
    if (pool.length < this.maxPoolSize) {
      try {
        const audio = new Audio(`${AUDIO_BASE_PATH}/${filename}`);
        audio.preload = 'auto';
        pool.push(audio);
        return audio;
      } catch {
        return null;
      }
    }

    // Se excedeu o pool, reaproveita o primeiro
    const audio = pool[0];
    if (audio) {
      audio.currentTime = 0;
      return audio;
    }
    return null;
  }

  private playSoundFile(filename: string, volume = 0.7, fallback?: () => void) {
    if (this.isMuted) return;

    try {
      const audio = this.getAudioElement(filename);
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume));
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Em caso de restrição do navegador, usa o fallback sintetizado
            if (fallback) fallback();
          });
        }
        return;
      }
    } catch {
      // Ignora erro e chama fallback
    }

    if (fallback) fallback();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('stop_termo_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // SONS DO JOGO UNO (25 Assets Oficiais)
  // =========================================================================

  /**
   * Distribuir cartas na mesa (início do jogo / início da rodada)
   */
  public playCardDeal(variation = 0) {
    const files = [
      'SFX_Card_Deal_Comm_New.wav',
      'Uno_SFX_Card_Deal_Comm_01.wav',
      'Uno_SFX_Card_Deal_Comm_02.wav',
      'Uno_SFX_Card_Deal_Comm_04.wav'
    ];
    const file = files[variation % files.length];
    this.playSoundFile(file, 0.65, () => this.synthCardDeal());
  }

  /**
   * Puxar carta do baralho de compras (slide suave com 4 variações dinâmicas)
   */
  public playCardDraw() {
    const idx = Math.floor(Math.random() * 4) + 1;
    const file = `SFX_Card_Draw_Comm_${idx}_New.wav`;
    this.playSoundFile(file, 0.7, () => this.synthCardDraw());
  }

  /**
   * Jogar carta na mesa (impacto e feltro)
   */
  public playCardPlay() {
    this.playSoundFile('SFX_Card_Effect_Show_Norm_Comm_New.wav', 0.75, () => this.synthCardPlay());
  }

  /**
   * Selecionar / Passar mouse por cima da carta na mão
   */
  public playCardSelect() {
    this.playSoundFile('SFX_Card_Select.wav', 0.35, () => this.synthClick(600, 0.03));
  }

  /**
   * Pegar carta na mão
   */
  public playCardPick() {
    this.playSoundFile('SFX_Card_Pick.wav', 0.55, () => this.synthClick(400, 0.05));
  }

  /**
   * Abrir baralho / Baralho de compras clicado
   */
  public playCardOpenDeck() {
    this.playSoundFile('SFX_Card_OpenDeck.wav', 0.65, () => this.synthCardDraw());
  }

  /**
   * Carta de Bloqueio (Skip / Proibido)
   */
  public playCardStop() {
    this.playSoundFile('SFX_Card_Effect_Stop_New.wav', 0.8, () => this.synthSkip());
  }

  /**
   * Inverter Sentido (Reverse / Sentido Horário & Anti-horário)
   */
  public playCardUTurn() {
    const file = Math.random() < 0.5 ? 'Uno_SFX_Card_Effect_UTurn_01.wav' : 'Uno_SFX_ArrowSwitch_012.wav';
    this.playSoundFile(file, 0.75, () => this.synthReverse());
  }

  /**
   * Efeito Punitivo (+2, Coringa +4, denúncia de UNO)
   */
  public playCardPunish() {
    this.playSoundFile('SFX_Card_Effect_Show_Punish_Comm_New.wav', 0.8, () => this.synthPunish());
  }

  /**
   * Troca de cor com Coringa / Efeito Mágico
   */
  public playWildSwitch() {
    this.playSoundFile('SFX_Card_Effect_ZeroSeven_Switch_New.wav', 0.75, () => this.synthWild());
  }

  public playCardWild() {
    this.playWildSwitch();
  }

  /**
   * Fanfarra de Início de Partida de UNO
   */
  public playUnoGamestart() {
    this.playSoundFile('Uno_SFX_Gamestart_02.wav', 0.85, () => this.playSuccess());
  }

  /**
   * Fim de Rodada / Vitória / Ficha comemorativa
   */
  public playVictoryToken() {
    this.playSoundFile('SFX_UI_Victory_Token_04.wav', 0.85, () => this.playVictory());
  }

  /**
   * Gritar UNO! (Fanfarra épica + voz emocional)
   */
  public playUnoShout() {
    this.playSoundFile('Uno_SFX_Gamestart_02.wav', 0.9, () => this.synthUnoShout());
  }

  /**
   * Notificação sutil quando for a vez do jogador
   */
  public playTurnNotification() {
    this.playSoundFile('SFX_Card_Select.wav', 0.6, () => this.playTick());
  }

  /**
   * Contagem regressiva de jogo (1, 2, 3, 4, 5, End)
   */
  public playGameCountdown(step: 1 | 2 | 3 | 4 | 5 | 'end') {
    if (step === 'end') {
      this.playSoundFile('SFX_GameStart_End.wav', 0.8, () => this.playSuccess());
    } else {
      this.playSoundFile(`SFX_GameStart_${step}.wav`, 0.65, () => this.playCountdownBeep(step >= 4));
    }
  }

  // =========================================================================
  // SONS GERAIS (Interface, Termo, Stop, Cliques)
  // =========================================================================

  public playClick() {
    this.playSoundFile('SFX_Card_Select.wav', 0.45, () => this.synthClick(550, 0.04));
  }

  public playTick() {
    this.playCountdownBeep(true);
  }

  public playKeypress() {
    this.playClick();
  }

  public playCountdownBeep(isLastSeconds = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = isLastSeconds ? 880 : 520;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.playSoundFile('SFX_UI_Victory_Token_04.wav', 0.75, () => {
      this.initContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.35);
        });
      } catch {}
    });
  }

  public playError() {
    if (this.isMuted) return;
    this.playSoundFile('SFX_Card_Effect_Stop_New.wav', 0.6, () => {
      this.initContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.22);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } catch {}
    });
  }

  public playFlip(isCorrect: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isCorrect ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isCorrect ? 600 : 400, now);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  public playVictory() {
    this.playSoundFile('SFX_UI_Victory_Token_04.wav', 0.85, () => {
      this.initContext();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const melody = [
          { f: 523.25, d: 0.12, t: 0 },
          { f: 659.25, d: 0.12, t: 0.12 },
          { f: 783.99, d: 0.15, t: 0.24 },
          { f: 1046.50, d: 0.45, t: 0.40 }
        ];

        melody.forEach(item => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(item.f, now + item.t);
          gain.gain.setValueAtTime(0.18, now + item.t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + item.t);
          osc.stop(now + item.t + item.d);
        });
      } catch {}
    });
  }

  // =========================================================================
  // SINTETIZADORES DE FALLBACK (Web Audio API)
  // =========================================================================

  private synthClick(freq = 600, duration = 0.04) {
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  private synthCardDeal() {
    this.synthClick(320, 0.08);
  }

  private synthCardDraw() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  private synthCardPlay() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  private synthSkip() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.setValueAtTime(250, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  private synthReverse() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  private synthPunish() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [220, 261, 311].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch {}
  }

  private synthWild() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [700, 900, 1100, 1300].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.1, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.12);
      });
    } catch {}
  }

  private synthUnoShout() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [
        { f: 523.25, d: 0.35, t: 0 },
        { f: 659.25, d: 0.35, t: 0.04 },
        { f: 783.99, d: 0.45, t: 0.08 },
        { f: 1046.50, d: 0.6, t: 0.12 }
      ];

      chord.forEach(item => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(item.f, now + item.t);
        gain.gain.setValueAtTime(0.12, now + item.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + item.t);
        osc.stop(now + item.t + item.d);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
