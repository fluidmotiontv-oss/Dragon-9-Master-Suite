import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ScriptManagerView } from './components/ScriptManagerView';
import { NetworkDiagnosticView } from './components/NetworkDiagnosticView';
import { PhoneFlasherView } from './components/PhoneFlasherView';
import { NeuralAssistantView } from './components/NeuralAssistantView';
import { MediaArcadeView } from './components/MediaArcadeView';
import { GlobalQuickActions } from './components/GlobalQuickActions';
import { WorkspaceTab, DeviceMode, SystemStatus } from './types';
import { audioManager } from './utils/audioSynth';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: "online",
    serverName: "Dragon 9 Master Core",
    version: "9.4.2-ULTRA",
    uptimeSeconds: 342,
    mode: "laptop",
    cpuUsage: 26,
    ramUsage: 58,
    ramTotalGb: 16,
    ramUsedGb: 9.28,
    diskUsage: 36,
    diskTotalGb: 512,
    diskUsedGb: 184.3,
    thermalPackageC: 44.5,
    batteryLevel: 92,
    isAcCharging: true,
    lidClosedMode: true,
    tmuxSessions: ["dragon9-core", "adb-bridge-3000", "vite-frontend"],
    ports: [
      { port: 3000, service: "Dragon 9 Web UI / Express", status: "LISTEN", pid: 14092 },
      { port: 5000, service: "Node Microserver / Media Streamer", status: "LISTEN", pid: 14108 },
      { port: 8080, service: "ADB Reverse Gateway", status: "IDLE", pid: 14150 }
    ],
    customClock54: {
      standardTime: new Date().toLocaleTimeString("en-US", { hour12: false }),
      customTime: "14:28:09 (54m/hr)",
      cycleProgress: 52
    }
  });

  const fetchSystemStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      // Keep existing state on transient error
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchSystemStatus]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchSystemStatus();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleModeChange = async (newMode: DeviceMode) => {
    setSystemStatus(prev => ({
      ...prev,
      mode: newMode,
      cpuUsage: newMode === 'phone' ? 14 : newMode === 'laptop' ? 24 : 38,
      lidClosedMode: newMode === 'laptop'
    }));

    try {
      await fetch('/api/system/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
    } catch (e) {
      console.warn("Failed to persist mode change:", e);
    }
  };

  // Keyboard shortcut listeners (1-6 to switch workspaces)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') {
        audioManager.playSound('click');
        setActiveTab('dashboard');
      } else if (e.key === '2') {
        audioManager.playSound('click');
        setActiveTab('scripts');
      } else if (e.key === '3') {
        audioManager.playSound('click');
        setActiveTab('network');
      } else if (e.key === '4') {
        audioManager.playSound('click');
        setActiveTab('flasher');
      } else if (e.key === '5') {
        audioManager.playSound('click');
        setActiveTab('ai_assistant');
      } else if (e.key === '6') {
        audioManager.playSound('click');
        setActiveTab('media_arcade');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Cybernetic Grid & Lighting FX */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.25) 0%, transparent 60%),
            linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onModeChange={handleModeChange}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Workspace Container */}
      <main className="relative z-10 flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            systemStatus={systemStatus}
            onModeChange={handleModeChange}
            setActiveTab={setActiveTab}
            onRunQuickBootstrap={() => setActiveTab('scripts')}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptManagerView />
        )}

        {activeTab === 'network' && (
          <NetworkDiagnosticView />
        )}

        {activeTab === 'flasher' && (
          <PhoneFlasherView />
        )}

        {activeTab === 'ai_assistant' && (
          <NeuralAssistantView
            onModeChange={handleModeChange}
            setActiveTab={setActiveTab}
            currentMode={systemStatus.mode}
          />
        )}

        {activeTab === 'media_arcade' && (
          <MediaArcadeView />
        )}
      </main>

      {/* Footer System Status Bar */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-3 text-center text-xs font-mono text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span>Dragon 9 Master Suite v9.4.2</span>
            <span>•</span>
            <span className="text-slate-400">Arch: aarch64 / x86_64</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Shortcuts: [1-6] Workspaces</span>
            <span>•</span>
            <span className="text-emerald-400">Zero-Trust Tunnels: Ready</span>
            <span>•</span>
            <span className="text-violet-400">ADB Reverse: Active</span>
          </div>
        </div>
      </footer>
      
      {/* Global Quick Actions Floating Menu */}
      <GlobalQuickActions />
    </div>
  );
}

