import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Flame, 
  Server, 
  Terminal, 
  Smartphone, 
  Laptop, 
  Tablet, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  Radio, 
  Clock, 
  Zap, 
  Play, 
  Copy, 
  CheckCircle2, 
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SystemStatus, DeviceMode, WorkspaceTab } from '../types';
import { audioManager } from '../utils/audioSynth';

interface DashboardViewProps {
  systemStatus: SystemStatus | null;
  onModeChange: (mode: DeviceMode) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  onRunQuickBootstrap: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  systemStatus,
  onModeChange,
  setActiveTab,
  onRunQuickBootstrap
}) => {
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

  const mode = systemStatus?.mode || 'laptop';
  const cpu = systemStatus?.cpuUsage || 28;
  const ram = systemStatus?.ramUsage || 58;
  const disk = systemStatus?.diskUsage || 36;
  const temp = systemStatus?.thermalPackageC || 44.5;

  const handleModeSelect = (newMode: DeviceMode) => {
    audioManager.playSound('deploy');
    onModeChange(newMode);
  };

  // Helper for Circular Gauge SVG calculations
  const renderGauge = (
    value: number, 
    max: number, 
    label: string, 
    sublabel: string, 
    color: 'cyan' | 'violet' | 'emerald' | 'amber',
    icon: any
  ) => {
    const IconComponent = icon;
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const strokeColors = {
      cyan: 'text-cyan-400 stroke-cyan-400',
      violet: 'text-violet-400 stroke-violet-400',
      emerald: 'text-emerald-400 stroke-emerald-400',
      amber: 'text-amber-400 stroke-amber-400'
    };

    const glowColors = {
      cyan: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
      violet: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
      emerald: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      amber: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    };

    return (
      <div className="glass-card glass-card-hover flex flex-col items-center justify-between rounded-2xl p-5 relative overflow-hidden">
        <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
            <IconComponent className="h-4 w-4 text-cyan-400" />
            {label}
          </span>
          <span className="font-semibold">{sublabel}</span>
        </div>

        {/* Circular Gauge Graphic */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background track */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Value fill track */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`${strokeColors[color]} ${glowColors[color]} transition-all duration-700 ease-out`}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Value overlay in center */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black tracking-tight text-slate-100 font-mono">
              {value}
              <span className="text-xs font-normal text-slate-400 ml-0.5">{label === 'Thermal State' ? '°C' : '%'}</span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              {percentage > 85 ? 'HIGH' : percentage > 50 ? 'OPTIMAL' : 'NOMINAL'}
            </span>
          </div>
        </div>

        {/* Footer mini meter bar */}
        <div className="w-full mt-2">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                color === 'cyan' ? 'bg-cyan-400' : color === 'violet' ? 'bg-violet-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner & System Status */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient background elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DRAGON 9 SERVER CLUSTER • NODE 01 ULTRA
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Master Command Center & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Media OS</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unified control hub for Linux daemons, ADB Android reverse bridges, automated Cloudflare tunnels, and real-time neural system diagnostics.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 border border-slate-700">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Std: {systemStatus?.customClock54.standardTime || '00:00:00'}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 border border-violet-500/40 text-violet-300">
                <Radio className="h-3.5 w-3.5 text-violet-400" />
                <span>Custom: {systemStatus?.customClock54.customTime || '14:28:09 (54m/hr)'}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 border border-emerald-500/40 text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>SHA-256 Disaster Recovery Ready</span>
              </div>
            </div>
          </div>

          {/* Fast Deploy & Workstation Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[240px]">
            <button
              id="dash-run-bootstrap-btn"
              onClick={() => {
                audioManager.playSound('deploy');
                onRunQuickBootstrap();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>Launch Bootstrap Engine</span>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <button
                id="dash-open-terminal-btn"
                onClick={() => {
                  audioManager.playSound('click');
                  setActiveTab('scripts');
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/80 hover:text-white transition-all"
              >
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Open Server Terminal</span>
              </button>
              <button
                id="dash-toggle-fullscreen-btn"
                onClick={handleToggleFullscreen}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-mono font-bold transition-all active:scale-95 ${
                  isFullscreen
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
                title="Toggle Fullscreen Command Center (F11/Esc)"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4 text-cyan-400" />
                    <span>Exit Fullscreen Mode</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 text-cyan-400" />
                    <span>Toggle Fullscreen Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Speedometer / Circular Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderGauge(cpu, 100, 'CPU Core Load', '8-Core Multi-Thread', cpu > 80 ? 'amber' : 'cyan', Cpu)}
        {renderGauge(ram, 100, 'RAM Allocation', `${systemStatus?.ramUsedGb || 9.2} / ${systemStatus?.ramTotalGb || 16} GB`, 'violet', Layers)}
        {renderGauge(disk, 100, 'NVMe Storage', `${systemStatus?.diskUsedGb || 184} / ${systemStatus?.diskTotalGb || 512} GB`, 'emerald', HardDrive)}
        {renderGauge(Math.round(temp), 100, 'Thermal State', temp > 70 ? 'Throttle Risk' : 'Optimal Cooling', temp > 75 ? 'amber' : 'cyan', Flame)}
      </div>

      {/* 3. Quick Action Single-Click Deployment Profiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            Hardware Deployment Profiles
          </h3>
          <span className="text-xs text-slate-400 font-mono">1-Click Auto Reconfiguration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Laptop Mode */}
          <div 
            id="deploy-profile-laptop"
            onClick={() => handleModeSelect('laptop')}
            className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${
              mode === 'laptop' 
                ? 'border-cyan-400/60 bg-cyan-950/20 glow-cyan ring-1 ring-cyan-500/40' 
                : 'hover:border-cyan-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Laptop className="h-6 w-6" />
              </div>
              {mode === 'laptop' && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <CheckCircle2 className="h-3 w-3" /> ACTIVE
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-100">Laptop Server Mode</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Enables lid-close server daemon, sets conservative thermal governor, disables display sleep during heavy I/O tasks.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span>Lid State: Continuous Run</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Phone Mode */}
          <div 
            id="deploy-profile-phone"
            onClick={() => handleModeSelect('phone')}
            className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${
              mode === 'phone' 
                ? 'border-violet-400/60 bg-violet-950/20 glow-violet ring-1 ring-violet-500/40' 
                : 'hover:border-violet-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Smartphone className="h-6 w-6" />
              </div>
              {mode === 'phone' && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                  <CheckCircle2 className="h-3 w-3" /> ACTIVE
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-100">Phone & ADB Tether Mode</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Binds reverse ports (tcp:3000 & tcp:5000) over USB ADB. Pushes Termux Node.js microserver payloads seamlessly.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-violet-300">
              <span>ADB Reverse: Active</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Tablet / PC Mode */}
          <div 
            id="deploy-profile-tablet"
            onClick={() => handleModeSelect('tablet_pc')}
            className={`glass-card p-5 rounded-2xl cursor-pointer transition-all ${
              mode === 'tablet_pc' 
                ? 'border-emerald-400/60 bg-emerald-950/20 glow-emerald ring-1 ring-emerald-500/40' 
                : 'hover:border-emerald-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Tablet className="h-6 w-6" />
              </div>
              {mode === 'tablet_pc' && (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> ACTIVE
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-100">Tablet / Remote LAN Mode</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Enables local network multi-cast broadcast, remote touch interface controls, and media stream proxy.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-300">
              <span>LAN Broadcast: 0.0.0.0</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Tmux Sessions & Port Conflict Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tmux Supervisor Panel */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Active Tmux Sessions
            </h4>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              3 Workers
            </span>
          </div>

          <div className="space-y-2">
            {(systemStatus?.tmuxSessions || ['dragon9-core', 'adb-bridge-3000', 'vite-frontend']).map((session, idx) => (
              <div 
                key={session}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-200 font-semibold">{session}</span>
                </div>
                <span className="text-[10px] text-slate-400">Attach :#{idx}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('scripts')}
            className="w-full text-center py-2 text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-1"
          >
            <span>Attach to Tmux in Terminal Simulator</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Port Status & Conflict Detector */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-violet-400" />
              Port Allocation & Conflict Guard
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Clear (No Overlaps)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-medium">PORT</th>
                  <th className="pb-2 font-medium">SERVICE DEPLOYED</th>
                  <th className="pb-2 font-medium">STATUS</th>
                  <th className="pb-2 font-medium">PID</th>
                  <th className="pb-2 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(systemStatus?.ports || [
                  { port: 3000, service: "Dragon 9 Web UI / Express Engine", status: "LISTEN", pid: 14092 },
                  { port: 5000, service: "Node Microserver / Media Streamer", status: "LISTEN", pid: 14108 },
                  { port: 8080, service: "ADB Reverse Gateway Bridge", status: "IDLE", pid: 14150 }
                ]).map((p) => (
                  <tr key={p.port} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-bold text-cyan-400">{p.port}</td>
                    <td className="py-2.5 text-slate-300">{p.service}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'LISTEN' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : p.status === 'CONFLICT'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{p.pid}</td>
                    <td className="py-2.5 text-right">
                      <button 
                        onClick={() => {
                          audioManager.playSound('click');
                          setActiveTab('network');
                        }}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        Inspect Route →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
