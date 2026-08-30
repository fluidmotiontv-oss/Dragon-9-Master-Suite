import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  Wifi, 
  Smartphone, 
  Bot, 
  Gamepad2, 
  Laptop, 
  Tablet, 
  Volume2, 
  VolumeX, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Flame,
  Layers,
  Cpu,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { WorkspaceTab, DeviceMode, SystemStatus } from '../types';
import { audioManager } from '../utils/audioSynth';

interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  systemStatus: SystemStatus | null;
  onModeChange: (mode: DeviceMode) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onModeChange,
  isMuted,
  setIsMuted,
  onRefresh,
  isRefreshing
}) => {
  const [show54MinClock, setShow54MinClock] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    audioManager.playSound('click');
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle restricted or blocked in iframe:", err);
    }
  };

  const tabs: { id: WorkspaceTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'scripts', label: 'Server & Scripts', icon: Terminal, badge: 'v9.4' },
    { id: 'network', label: 'ISP & Network', icon: Wifi, badge: '3 Tunnels' },
    { id: 'flasher', label: 'Phone & Flasher', icon: Smartphone, badge: 'ADB' },
    { id: 'ai_assistant', label: 'Neural AI', icon: Bot, badge: 'Live' },
    { id: 'media_arcade', label: 'Media & Arcade', icon: Gamepad2 }
  ];

  const handleTabClick = (tab: WorkspaceTab) => {
    audioManager.playSound('click');
    setActiveTab(tab);
  };

  const handleModeToggle = (mode: DeviceMode) => {
    audioManager.playSound('deploy');
    onModeChange(mode);
  };

  const toggleAudio = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioManager.setMuted(nextMute);
    if (!nextMute) {
      audioManager.playSound('click');
    }
  };

  const currentMode = systemStatus?.mode || 'laptop';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl transition-all">
      {/* Top Bar: Brand, Status Badges, Clocks, Mode Selectors */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        
        {/* Brand & Crest */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 via-violet-600/30 to-slate-900 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
            <span className="text-xl font-black text-cyan-400 select-none">🐉</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-100 uppercase">
                Dragon <span className="text-cyan-400 font-extrabold text-glow-cyan">9</span> <span className="text-violet-400 text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30">MASTER SUITE</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                CORE ACTIVE
              </span>
              <span>•</span>
              <span className="text-slate-400 hidden sm:inline">Uptime: {Math.floor((systemStatus?.uptimeSeconds || 120) / 60)}m</span>
              <span>•</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {systemStatus?.tmuxSessions.length || 3} Tmux
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Server Clock (Standard / 54m cycle toggle) */}
        <div 
          onClick={() => {
            setShow54MinClock(!show54MinClock);
            audioManager.playSound('click');
          }}
          className="group cursor-pointer flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 shadow-inner hover:border-cyan-500/40 transition-all select-none"
          title="Click to toggle between Standard 24h Clock and Dragon 9 54-Minute Hour Clock"
        >
          <Clock className={`h-4 w-4 transition-colors ${show54MinClock ? 'text-violet-400 animate-spin' : 'text-cyan-400'}`} style={{ animationDuration: '10s' }} />
          <div className="text-left font-mono">
            <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
              {show54MinClock 
                ? (systemStatus?.customClock54.customTime || '14:28:09 (54m/hr)')
                : (systemStatus?.customClock54.standardTime || new Date().toLocaleTimeString())
              }
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span>{show54MinClock ? '54-Min Cycle' : 'Standard 24h'}</span>
              <div className="h-1.5 w-10 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                  style={{ width: `${systemStatus?.customClock54.cycleProgress || 52}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Controls: Device Mode Switcher & Global Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Device Modes */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              id="mode-laptop-btn"
              onClick={() => handleModeToggle('laptop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentMode === 'laptop'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Optimize for laptop lid-close server operations"
            >
              <Laptop className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Laptop</span>
            </button>

            <button
              id="mode-phone-btn"
              onClick={() => handleModeToggle('phone')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentMode === 'phone'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 glow-violet shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="USB ADB Reverse tethering & Mobile Web UI"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Phone</span>
            </button>

            <button
              id="mode-tablet-btn"
              onClick={() => handleModeToggle('tablet_pc')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentMode === 'tablet_pc'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="LAN sharing & Remote Tablet screen"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tablet / PC</span>
            </button>
          </div>

          {/* Fullscreen Workstation Toggle */}
          <button
            id="navbar-fullscreen-btn"
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-xl border border-slate-800 bg-slate-900/80 transition-all ${
              isFullscreen 
                ? 'text-cyan-300 border-cyan-500/50 bg-cyan-500/20 glow-cyan' 
                : 'text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={isFullscreen ? "Exit Fullscreen Mode" : "Toggle Fullscreen Mode (F11/Esc)"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-cyan-400" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Audio Mute/Unmute */}
          <button
            id="audio-toggle-btn"
            onClick={toggleAudio}
            className={`p-2 rounded-xl border border-slate-800 bg-slate-900/80 transition-all ${
              isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-cyan-400 hover:text-cyan-200 glow-cyan'
            }`}
            title={isMuted ? "Enable Synth & Sound Effects" : "Mute Sound Effects"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Sync Refresh */}
          <button
            id="sync-refresh-btn"
            onClick={() => {
              audioManager.playSound('click');
              onRefresh();
            }}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh system state telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 pt-1 sm:px-6 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-slate-800 to-violet-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                  isActive 
                    ? 'bg-cyan-500/30 border-cyan-400/50 text-cyan-200' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
