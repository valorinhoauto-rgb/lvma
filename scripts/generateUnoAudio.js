import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/assets/uno/audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function writeWavFile(filepath, sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // audioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(intVal), offset);
    offset += 2;
  }

  fs.writeFileSync(filepath, buffer);
}

const SR = 44100;

function createNoise(duration) {
  const len = Math.floor(duration * SR);
  const arr = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = (Math.random() * 2 - 1);
  }
  return arr;
}

// 1. Card Deal (friction slide + soft tap)
function genCardDeal(pitchOffset = 0) {
  const duration = 0.22;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const progress = t / duration;
    // filtered noise envelope for paper sliding
    const noiseEnv = Math.pow(1 - progress, 1.8) * Math.sin(progress * Math.PI);
    const noise = (Math.random() * 2 - 1) * noiseEnv * 0.4;

    // soft body tap
    const freq = (180 + pitchOffset) * (1 - progress * 0.6);
    const body = Math.sin(2 * Math.PI * freq * t) * Math.exp(-progress * 15) * 0.5;

    // quick snap at t=0.08
    let snap = 0;
    if (t > 0.06 && t < 0.12) {
      const snapT = (t - 0.06) / 0.06;
      snap = Math.sin(2 * Math.PI * (520 + pitchOffset) * (t - 0.06)) * Math.exp(-snapT * 12) * 0.4;
    }

    out[i] = (noise + body + snap) * 0.85;
  }
  return out;
}

// 2. Card Draw (crisp slide + pickup pop)
function genCardDraw(variation = 1) {
  const duration = 0.24 + variation * 0.02;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  const baseFreq = 220 + variation * 35;

  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;

    // Paper friction whoosh rising
    const frictionEnv = Math.sin(p * Math.PI * 0.8) * Math.exp(-p * 2);
    const noise = (Math.random() * 2 - 1) * frictionEnv * 0.35;

    // Sliding frequency ramp
    const currentFreq = baseFreq + p * 380;
    const tone = Math.sin(2 * Math.PI * currentFreq * t) * Math.exp(-p * 4) * 0.35;

    // Click at the start
    const click = Math.sin(2 * Math.PI * (800 + variation * 50) * t) * Math.exp(-p * 30) * 0.3;

    out[i] = (noise + tone + click) * 0.8;
  }
  return out;
}

// 3. Card Pick / Select (tactile feedback)
function genCardSelect() {
  const duration = 0.08;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    const freq = 650 - p * 350;
    const click = Math.sin(2 * Math.PI * freq * t) * Math.exp(-p * 25);
    out[i] = click * 0.5;
  }
  return out;
}

function genCardPick() {
  const duration = 0.14;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    const freq = 420 - p * 200;
    const body = Math.sin(2 * Math.PI * freq * t) * Math.exp(-p * 14) * 0.6;
    const noise = (Math.random() * 2 - 1) * Math.exp(-p * 20) * 0.25;
    out[i] = (body + noise) * 0.8;
  }
  return out;
}

// 4. Card Play Normal
function genCardPlayNorm() {
  const duration = 0.20;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    // satisfying table felt thud + snap
    const thud = Math.sin(2 * Math.PI * (160 - p * 80) * t) * Math.exp(-p * 12) * 0.65;
    const snap = Math.sin(2 * Math.PI * (480 - p * 220) * t) * Math.exp(-p * 18) * 0.35;
    const air = (Math.random() * 2 - 1) * Math.exp(-p * 22) * 0.2;
    out[i] = (thud + snap + air) * 0.9;
  }
  return out;
}

// 5. Open Deck / Shuffle
function genOpenDeck() {
  const duration = 0.38;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    // Riffle ripple effect: pulse train of card snaps
    const rippleCount = 8;
    const rippleFreq = Math.sin(p * rippleCount * 2 * Math.PI);
    const envelope = Math.sin(p * Math.PI) * Math.exp(-p * 1.5);
    const noise = (Math.random() * 2 - 1) * (0.3 + 0.3 * rippleFreq) * envelope;
    const tone = Math.sin(2 * Math.PI * (300 + p * 300) * t) * envelope * 0.25;
    out[i] = (noise + tone) * 0.8;
  }
  return out;
}

// 6. Punish (+2, +4, denúncia)
function genCardPunish() {
  const duration = 0.55;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  // Dramatic minor chord sting (A4, C5, Eb5, F#5)
  const notes = [220, 261.63, 311.13, 370.0];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    let chord = 0;
    notes.forEach((freq, idx) => {
      const harm = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
      chord += harm * Math.exp(-p * (4 + idx));
    });
    // Impact punch at start
    const punch = Math.sin(2 * Math.PI * (120 - p * 60) * t) * Math.exp(-p * 15) * 0.8;
    out[i] = (chord * 0.3 + punch * 0.5) * 0.85;
  }
  return out;
}

// 7. Stop / Skip
function genCardStop() {
  const duration = 0.32;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    // metallic brake sound + square drop
    const freq = 480 - p * 260;
    const sq = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.35;
    const sine = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.45;
    const env = Math.exp(-p * 7);
    out[i] = (sq + sine) * env * 0.75;
  }
  return out;
}

// 8. ZeroSeven Switch / Wild Color Change
function genWildSwitch() {
  const duration = 0.48;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  // magical ascending arpeggio sweep
  const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    let shimmer = 0;
    freqs.forEach((freq, idx) => {
      const delay = idx * 0.05;
      if (t >= delay) {
        const localT = t - delay;
        const env = Math.exp(-localT * 8);
        shimmer += Math.sin(2 * Math.PI * freq * localT) * env * 0.25;
      }
    });
    out[i] = shimmer * 0.9;
  }
  return out;
}

// 9. Arrow Switch / U-Turn Reverse
function genArrowSwitch() {
  const duration = 0.35;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    // Doppler whoosh: low to high then back down
    const freq = 320 + Math.sin(p * Math.PI) * 450;
    const tone = Math.sin(2 * Math.PI * freq * t) * Math.sin(p * Math.PI);
    const noise = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * 0.3;
    out[i] = (tone * 0.6 + noise * 0.4) * 0.8;
  }
  return out;
}

function genUTurn() {
  const duration = 0.38;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    // Reverse swoosh: high pitch dive then quick bounce
    const freq = 680 - p * 380 + (p > 0.5 ? (p - 0.5) * 300 : 0);
    const tone = Math.sin(2 * Math.PI * freq * t) * Math.sin(p * Math.PI);
    out[i] = tone * 0.7;
  }
  return out;
}

// 10. Gamestart (Fanfare chord)
function genGamestart() {
  const duration = 0.70;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  const notes = [
    { f: 523.25, start: 0, dur: 0.2 },     // C5
    { f: 659.25, start: 0.1, dur: 0.2 },   // E5
    { f: 783.99, start: 0.2, dur: 0.25 },  // G5
    { f: 1046.50, start: 0.32, dur: 0.38 } // C6
  ];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let val = 0;
    notes.forEach(n => {
      if (t >= n.start && t < n.start + n.dur) {
        const localT = t - n.start;
        const p = localT / n.dur;
        const env = Math.exp(-p * 3.5);
        const wave = Math.sin(2 * Math.PI * n.f * localT) + 0.25 * Math.sin(2 * Math.PI * n.f * 2 * localT);
        val += wave * env * 0.3;
      }
    });
    out[i] = val * 0.85;
  }
  return out;
}

// 11. Countdown beeps 1-5 and End
function genCountdown(freq, duration = 0.14) {
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    const wave = Math.sin(2 * Math.PI * freq * t);
    const env = Math.exp(-p * 6);
    out[i] = wave * env * 0.5;
  }
  return out;
}

function genCountdownEnd() {
  const duration = 0.45;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  // Major triadic burst (G5 -> C6)
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const p = t / duration;
    const f1 = 783.99;
    const f2 = 1046.50;
    const wave = (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t)) * 0.4;
    const env = Math.exp(-p * 4.5);
    out[i] = wave * env * 0.85;
  }
  return out;
}

// 12. Victory Token
function genVictoryToken() {
  const duration = 0.85;
  const len = Math.floor(duration * SR);
  const out = new Float32Array(len);
  const arpeggio = [
    { f: 523.25, t: 0, d: 0.15 },
    { f: 659.25, t: 0.08, d: 0.15 },
    { f: 783.99, t: 0.16, d: 0.2 },
    { f: 1046.50, t: 0.24, d: 0.25 },
    { f: 1318.51, t: 0.32, d: 0.5 }
  ];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let sample = 0;
    arpeggio.forEach(n => {
      if (t >= n.t) {
        const localT = t - n.t;
        const p = localT / n.d;
        if (p <= 1) {
          const env = Math.exp(-p * 4);
          const tone = Math.sin(2 * Math.PI * n.f * localT) + 0.3 * Math.sin(2 * Math.PI * n.f * 2 * localT);
          sample += tone * env * 0.25;
        }
      }
    });
    // Metallic chime / coin sparkle
    if (t > 0.32) {
      const sparkleT = t - 0.32;
      const shimmer = Math.sin(2 * Math.PI * 3200 * sparkleT) * Math.exp(-sparkleT * 8) * 0.15;
      sample += shimmer;
    }
    out[i] = sample * 0.85;
  }
  return out;
}

// Generate all 25 files
const filesToGenerate = [
  { name: 'SFX_Card_Deal_Comm_New.wav', gen: () => genCardDeal(0) },
  { name: 'Uno_SFX_Card_Deal_Comm_01.wav', gen: () => genCardDeal(15) },
  { name: 'Uno_SFX_Card_Deal_Comm_02.wav', gen: () => genCardDeal(-15) },
  { name: 'Uno_SFX_Card_Deal_Comm_04.wav', gen: () => genCardDeal(30) },
  { name: 'SFX_Card_Draw_Comm_1_New.wav', gen: () => genCardDraw(1) },
  { name: 'SFX_Card_Draw_Comm_2_New.wav', gen: () => genCardDraw(2) },
  { name: 'SFX_Card_Draw_Comm_3_New.wav', gen: () => genCardDraw(3) },
  { name: 'SFX_Card_Draw_Comm_4_New.wav', gen: () => genCardDraw(4) },
  { name: 'SFX_Card_OpenDeck.wav', gen: () => genOpenDeck() },
  { name: 'SFX_Card_Pick.wav', gen: () => genCardPick() },
  { name: 'SFX_Card_Select.wav', gen: () => genCardSelect() },
  { name: 'SFX_Card_Effect_Show_Norm_Comm_New.wav', gen: () => genCardPlayNorm() },
  { name: 'SFX_Card_Effect_Show_Punish_Comm_New.wav', gen: () => genCardPunish() },
  { name: 'SFX_Card_Effect_Stop_New.wav', gen: () => genCardStop() },
  { name: 'SFX_Card_Effect_ZeroSeven_Switch_New.wav', gen: () => genWildSwitch() },
  { name: 'Uno_SFX_ArrowSwitch_012.wav', gen: () => genArrowSwitch() },
  { name: 'Uno_SFX_Card_Effect_UTurn_01.wav', gen: () => genUTurn() },
  { name: 'Uno_SFX_Gamestart_02.wav', gen: () => genGamestart() },
  { name: 'SFX_GameStart_1.wav', gen: () => genCountdown(440) },
  { name: 'SFX_GameStart_2.wav', gen: () => genCountdown(520) },
  { name: 'SFX_GameStart_3.wav', gen: () => genCountdown(660) },
  { name: 'SFX_GameStart_4.wav', gen: () => genCountdown(780) },
  { name: 'SFX_GameStart_5.wav', gen: () => genCountdown(880) },
  { name: 'SFX_GameStart_End.wav', gen: () => genCountdownEnd() },
  { name: 'SFX_UI_Victory_Token_04.wav', gen: () => genVictoryToken() }
];

console.log(`Generating ${filesToGenerate.length} audio assets in ${outDir}...`);
for (const item of filesToGenerate) {
  const samples = item.gen();
  const filePath = path.join(outDir, item.name);
  writeWavFile(filePath, SR, samples);
  console.log(`Generated: ${item.name} (${samples.length} samples)`);
}
console.log('Audio generation completed successfully!');
