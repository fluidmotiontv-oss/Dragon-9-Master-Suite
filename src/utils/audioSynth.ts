// Web Audio API Synthesizer and Sound FX Engine for Dragon 9 Master Suite

class DragonAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentMusicNodes: { oscs: OscillatorNode[]; gains: GainNode[] } | null = null;
  private isMusicPlaying: boolean = false;
  private currentBpm: number = 120;
  private intervalId: any = null;
  public onBeat?: (step: number) => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Play synthetic retro-futuristic sound effects
  public playSound(type: 'paddle' | 'wall' | 'score' | 'loss' | 'click' | 'deploy' | 'alert') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
      } else if (type === 'paddle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(660, t + 0.08);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (type === 'wall') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
      } else if (type === 'score') {
        // Arpeggiated high chime
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.07); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.14); // G5
        osc.frequency.setValueAtTime(1046.50, t + 0.21); // C6
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      } else if (type === 'loss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
      } else if (type === 'deploy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === 'alert') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(440, t + 0.1);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      }
    } catch (e) {
      console.warn("Audio FX error:", e);
    }
  }

  // Cyber Ambient Synthwave loop generator
  public playAmbientMusic(genre: string = 'Cyberpunk', bpm: number = 120) {
    if (this.isMuted) return;
    this.stopAmbientMusic();
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.currentBpm = bpm;
    const stepDuration = (60 / bpm) / 4; // 16th notes

    const bassScale = genre === 'Synthwave' 
      ? [110, 130.81, 146.83, 164.81] // A2, C3, D3, E3
      : [82.41, 98.00, 110.00, 123.47]; // E2, G2, A2, B2

    const chordScale = genre === 'Synthwave'
      ? [440, 523.25, 659.25, 783.99] // A4, C5, E5, G5
      : [329.63, 392.00, 493.88, 587.33]; // E4, G4, B4, D5

    let step = 0;

    this.intervalId = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;

      if (this.onBeat) {
        this.onBeat(step % 16);
      }

      // Play bassline on every 2nd 16th note
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);

        bassOsc.type = 'sawtooth';
        const noteIndex = Math.floor((step / 4) % bassScale.length);
        bassOsc.frequency.setValueAtTime(bassScale[noteIndex], t);

        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.8);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 2);
      }

      // Play arpeggiated synth lead on 16th notes
      if (step % 4 === 0 || step % 4 === 2) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';

        const leadIndex = (step / 2) % chordScale.length;
        leadOsc.frequency.setValueAtTime(chordScale[leadIndex], t);

        leadGain.gain.setValueAtTime(0.08, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 2.5);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(t);
        leadOsc.stop(t + stepDuration * 3);
      }

      step++;
    }, stepDuration * 1000);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }
}

export const audioManager = new DragonAudioEngine();

// Text to Speech synthesis helper
export function speakText(text: string, voiceSettings?: { rate?: number; pitch?: number; voiceName?: string }) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown symbols for natural narration
  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = voiceSettings?.rate || 1.05;
  utterance.pitch = voiceSettings?.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voiceSettings?.voiceName) {
    const selectedVoice = voices.find(v => v.name.includes(voiceSettings.voiceName!));
    if (selectedVoice) utterance.voice = selectedVoice;
  } else {
    // Pick an English voice
    const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (engVoice) utterance.voice = engVoice;
  }

  window.speechSynthesis.speak(utterance);
}
