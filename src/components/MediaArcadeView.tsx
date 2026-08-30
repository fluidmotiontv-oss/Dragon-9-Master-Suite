import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Gamepad2, 
  Disc3, 
  Music, 
  Sparkles, 
  Trophy, 
  RotateCcw,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { TrackItem } from '../types';
import { audioManager } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

export const MediaArcadeView: React.FC = () => {
  // 1. Music Player State
  const tracks: TrackItem[] = [
    {
      id: 't-1',
      title: 'Dragon 9 Core Cyberpunk',
      artist: 'Neural Synthesizer Core',
      genre: 'Cyberpunk',
      bpm: 128,
      duration: '3:45',
      accentColor: 'from-cyan-500 to-blue-600',
      glowColor: 'rgba(6, 182, 212, 0.5)',
      waveformPattern: [20, 45, 60, 30, 80, 95, 40, 70, 85, 55, 90, 100, 65, 40, 80, 50]
    },
    {
      id: 't-2',
      title: 'Midnight Neon Highway Drive',
      artist: 'Aetheric Outrun 84',
      genre: 'Synthwave',
      bpm: 116,
      duration: '4:12',
      accentColor: 'from-violet-500 to-fuchsia-600',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      waveformPattern: [15, 30, 50, 75, 60, 40, 85, 90, 70, 50, 65, 80, 90, 45, 35, 60]
    },
    {
      id: 't-3',
      title: 'Terminal Lo-Fi Diagnostics',
      artist: 'Subsystem Echoes',
      genre: 'Lo-Fi Chill',
      bpm: 86,
      duration: '2:58',
      accentColor: 'from-emerald-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      waveformPattern: [10, 20, 35, 25, 40, 30, 50, 45, 35, 60, 40, 30, 25, 35, 20, 15]
    },
    {
      id: 't-4',
      title: 'Quantum Overclock Frequency',
      artist: 'Silicon Warp Engine',
      genre: 'Darksynth',
      bpm: 140,
      duration: '3:20',
      accentColor: 'from-amber-500 to-rose-600',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      waveformPattern: [40, 80, 95, 70, 100, 85, 90, 95, 60, 80, 100, 90, 75, 85, 90, 60]
    }
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [equalizerPreset, setEqualizerPreset] = useState<'Cyber Glow' | 'Bass Boost' | 'Flat' | 'Lo-Fi'>('Cyber Glow');
  const [visualizerBars, setVisualizerBars] = useState<number[]>([30, 50, 70, 45, 90, 60, 40, 80, 65, 85, 50, 75, 95, 40, 60, 30]);

  const currentTrack = tracks[currentTrackIndex];

  // Visualizer bar animation loop when music is playing
  useEffect(() => {
    let interval: any;
    if (isPlayingMusic) {
      interval = setInterval(() => {
        setVisualizerBars(prev => prev.map(() => Math.floor(15 + Math.random() * 85)));
      }, 120);
    } else {
      setVisualizerBars([20, 25, 30, 25, 35, 30, 25, 40, 35, 30, 25, 35, 30, 25, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isPlayingMusic]);

  const handlePlayPause = () => {
    audioManager.playSound('click');
    if (isPlayingMusic) {
      audioManager.stopAmbientMusic();
      setIsPlayingMusic(false);
    } else {
      audioManager.playAmbientMusic(currentTrack.genre, currentTrack.bpm);
      setIsPlayingMusic(true);
    }
  };

  const handleNextTrack = () => {
    audioManager.playSound('click');
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlayingMusic) {
      audioManager.playAmbientMusic(tracks[nextIdx].genre, tracks[nextIdx].bpm);
    }
  };

  const handlePrevTrack = () => {
    audioManager.playSound('click');
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    if (isPlayingMusic) {
      audioManager.playAmbientMusic(tracks[prevIdx].genre, tracks[prevIdx].bpm);
    }
  };

  // 2. Neural Pong Game State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<'Novice' | 'Neural Core' | 'Overclocked'>('Neural Core');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [gameWinner, setGameWinner] = useState<'player' | 'ai' | null>(null);

  // Pong Game Physics Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = 640);
    let height = (canvas.height = 360);

    // Positions & Velocities
    const paddleHeight = 70;
    const paddleWidth = 10;
    let playerY = height / 2 - paddleHeight / 2;
    let aiY = height / 2 - paddleHeight / 2;

    let ballX = width / 2;
    let ballY = height / 2;
    let ballSpeedX = 4.5 * (Math.random() > 0.5 ? 1 : -1);
    let ballSpeedY = (Math.random() * 4 - 2);

    let pScore = playerScore;
    let aScore = aiScore;

    // AI Tracking Speed mapping
    const aiSpeedMap = {
      'Novice': 2.8,
      'Neural Core': 4.4,
      'Overclocked': 6.2
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = (e.clientY - rect.top) * (height / rect.height);
      playerY = Math.max(0, Math.min(height - paddleHeight, mouseY - paddleHeight / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touchY = (e.touches[0].clientY - rect.top) * (height / rect.height);
        playerY = Math.max(0, Math.min(height - paddleHeight, touchY - paddleHeight / 2));
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    const gameLoop = () => {
      if (!isGameRunning) {
        // Draw idle screen
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK "LAUNCH NEURAL PONG" TO ENGAGE', width / 2, height / 2);
        return;
      }

      // Update AI Position
      const targetAiY = ballY - paddleHeight / 2;
      const aiSpeed = aiSpeedMap[aiDifficulty];
      if (aiY < targetAiY - 4) {
        aiY += aiSpeed;
      } else if (aiY > targetAiY + 4) {
        aiY -= aiSpeed;
      }
      aiY = Math.max(0, Math.min(height - paddleHeight, aiY));

      // Move Ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Top / Bottom Wall Collision
      if (ballY <= 6 || ballY >= height - 6) {
        ballSpeedY = -ballSpeedY;
        audioManager.playSound('wall');
      }

      // Player Paddle Collision
      if (
        ballX <= 24 + paddleWidth &&
        ballX >= 20 &&
        ballY >= playerY &&
        ballY <= playerY + paddleHeight
      ) {
        ballSpeedX = Math.abs(ballSpeedX) * 1.04;
        const deltaY = ballY - (playerY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.25;
        audioManager.playSound('paddle');
      }

      // AI Paddle Collision
      if (
        ballX >= width - 24 - paddleWidth &&
        ballX <= width - 20 &&
        ballY >= aiY &&
        ballY <= aiY + paddleHeight
      ) {
        ballSpeedX = -Math.abs(ballSpeedX) * 1.04;
        const deltaY = ballY - (aiY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.25;
        audioManager.playSound('paddle');
      }

      // Point Scored by Player
      if (ballX >= width) {
        pScore += 1;
        setPlayerScore(pScore);
        audioManager.playSound('score');
        if (pScore >= 7) {
          setIsGameRunning(false);
          setGameWinner('player');
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        }
        // Reset Ball
        ballX = width / 2;
        ballY = height / 2;
        ballSpeedX = -4.5;
        ballSpeedY = (Math.random() * 4 - 2);
      }

      // Point Scored by AI
      if (ballX <= 0) {
        aScore += 1;
        setAiScore(aScore);
        audioManager.playSound('loss');
        if (aScore >= 7) {
          setIsGameRunning(false);
          setGameWinner('ai');
        }
        // Reset Ball
        ballX = width / 2;
        ballY = height / 2;
        ballSpeedX = 4.5;
        ballSpeedY = (Math.random() * 4 - 2);
      }

      // Rendering Frame
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Center Divider line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Player Paddle (Cyan)
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillRect(20, playerY, paddleWidth, paddleHeight);

      // Draw AI Paddle (Violet)
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.fillRect(width - 20 - paddleWidth, aiY, paddleWidth, paddleHeight);

      // Draw Glowing Ball
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isGameRunning, aiDifficulty]);

  const handleStartGame = () => {
    audioManager.playSound('deploy');
    setPlayerScore(0);
    setAiScore(0);
    setGameWinner(null);
    setIsGameRunning(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Cyberpunk Synthwave Music Player & 3D Artwork View */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        {/* Dynamic ambient blur glow backdrop matching current track accent */}
        <div 
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-700"
          style={{ backgroundColor: currentTrack.glowColor }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 3D Perspective Track Artwork Cover with Breathing CSS animation */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group cursor-pointer perspective-1000">
              <div 
                className={`w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 bg-gradient-to-br ${currentTrack.accentColor} border border-white/20 animate-pulse-glow hover:scale-105`}
                style={{
                  transform: 'rotateY(-8deg) rotateX(6deg)',
                  boxShadow: `0 20px 50px -10px ${currentTrack.glowColor}`
                }}
              >
                <div className="flex items-center justify-between text-white font-mono text-xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Disc3 className={`h-5 w-5 ${isPlayingMusic ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                    DRAGON 9 OS
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm">
                    {currentTrack.genre}
                  </span>
                </div>

                <div className="text-center my-auto space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
                    {currentTrack.title}
                  </h3>
                  <p className="text-xs font-mono text-white/80">
                    {currentTrack.artist}
                  </p>
                </div>

                <div className="flex items-center justify-between text-white/90 font-mono text-xs pt-2 border-t border-white/20">
                  <span>BPM: {currentTrack.bpm}</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Controls, Waveform Equalizer & Playlist */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                <Music className="h-4 w-4" />
                <span>CYBERNETIC WEB AUDIO SYNTHESIZER</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 mt-1">
                {currentTrack.title}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Real-time generated 44.1kHz polyphonic synthesizer audio tracks.
              </p>
            </div>

            {/* Live Audio Visualizer Frequency Bars */}
            <div className="h-20 w-full flex items-end gap-1.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              {visualizerBars.map((lvl, idx) => (
                <div 
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-violet-400 rounded-t transition-all duration-100"
                  style={{ height: `${lvl}%` }}
                />
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                id="music-prev-btn"
                onClick={handlePrevTrack}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-95"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                id="music-play-btn"
                onClick={handlePlayPause}
                className={`p-4 rounded-2xl font-bold text-slate-950 shadow-xl transition-all hover:scale-105 active:scale-95 ${
                  isPlayingMusic 
                    ? 'bg-amber-400 text-slate-950 glow-cyan' 
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950'
                }`}
              >
                {isPlayingMusic ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
              </button>

              <button
                id="music-next-btn"
                onClick={handleNextTrack}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-95"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              {/* Equalizer Profile Switcher */}
              <div className="ml-auto flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
                {(['Cyber Glow', 'Bass Boost', 'Flat'] as const).map(eq => (
                  <button
                    key={eq}
                    onClick={() => {
                      audioManager.playSound('click');
                      setEqualizerPreset(eq);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      equalizerPreset === eq
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Neural Pong Arcade Game Mode */}
      <div className="glass-card rounded-3xl p-6 space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-cyan-400" />
              Neural Pong Arcade & Canvas Physics Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the left paddle with mouse or touch. Compete against the adaptive Dragon 9 predictive AI core to 7 points.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Difficulty Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
              {(['Novice', 'Neural Core', 'Overclocked'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    audioManager.playSound('click');
                    setAiDifficulty(diff);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    aiDifficulty === diff
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 glow-violet'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <button
              id="start-pong-btn"
              onClick={handleStartGame}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              {isGameRunning ? 'Restart Match' : 'Launch Neural Pong'}
            </button>
          </div>
        </div>

        {/* Score Board Header */}
        <div className="flex items-center justify-around p-3 bg-slate-950/80 rounded-2xl border border-slate-800 font-mono">
          <div className="text-center">
            <span className="text-xs text-cyan-400 font-bold block uppercase">PLAYER (CYAN)</span>
            <span className="text-3xl font-black text-slate-100">{playerScore}</span>
          </div>

          <div className="text-center text-xs text-slate-500 font-bold">
            FIRST TO 7
          </div>

          <div className="text-center">
            <span className="text-xs text-violet-400 font-bold block uppercase">AI ({aiDifficulty})</span>
            <span className="text-3xl font-black text-slate-100">{aiScore}</span>
          </div>
        </div>

        {/* Canvas Game Stage */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center items-center shadow-2xl">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[640px] h-[320px] sm:h-[360px] cursor-none touch-none"
          />

          {/* Victory / Defeat Overlay */}
          {gameWinner && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3 z-20">
              <Trophy className={`h-12 w-12 ${gameWinner === 'player' ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <h4 className="text-2xl font-black text-white">
                {gameWinner === 'player' ? 'VICTORY ACHIEVED!' : 'NEURAL CORE DEFEAT'}
              </h4>
              <p className="text-xs font-mono text-slate-300">
                Final Score: {playerScore} - {aiScore}
              </p>
              <button
                onClick={handleStartGame}
                className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition-all"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
