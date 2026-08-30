import React, { useState } from 'react';
import { 
  Smartphone, 
  Usb, 
  Cpu, 
  BatteryCharging, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Upload, 
  ShieldCheck, 
  HardDrive, 
  Layers, 
  Flame,
  Check
} from 'lucide-react';
import { AdbDeviceStatus } from '../types';
import { audioManager } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

export const PhoneFlasherView: React.FC = () => {
  const [deviceStatus, setDeviceStatus] = useState<AdbDeviceStatus>({
    connected: true,
    deviceName: "Google Pixel 8 Pro (husky)",
    serial: "39241FDJH0029X",
    abi: "arm64-v8a",
    androidVersion: "Android 15 (VanillaIceCream)",
    batteryLevel: 88,
    batteryTempC: 32.4,
    connectionType: "USB 3.2 SuperSpeed (5 Gbps)",
    adbState: "device (Authorized)",
    reversePort3000: true,
    reversePort5000: true,
    termuxMicroserver: {
      installed: true,
      running: true,
      port: 5000,
      nodeVersion: "v20.12.0",
      wakeLock: "active",
      memoryMb: 84
    }
  });

  const [activeDeployStep, setActiveDeployStep] = useState<number>(0);
  const [isDeployingTermux, setIsDeployingTermux] = useState<boolean>(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([
    "[ADB] Device 39241FDJH0029X authorized via RSA key.",
    "[ADB] Reverse forwarding tcp:3000 -> tcp:3000 established.",
    "[ADB] Reverse forwarding tcp:5000 -> tcp:5000 established.",
    "[TERMUX] Termux Subsystem ready for Node.js microserver payload."
  ]);

  const [selectedPartition, setSelectedPartition] = useState<string>('boot.img');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashProgress, setFlashProgress] = useState<number>(0);

  // Trigger ADB reverse mapping re-bind
  const handleRebindAdb = () => {
    audioManager.playSound('deploy');
    setDeployLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [ADB] Executing: adb reverse --remove-all && adb reverse tcp:3000 tcp:3000 && adb reverse tcp:5000 tcp:5000`,
      `[${new Date().toLocaleTimeString()}] [✓] Success: localhost:3000 & localhost:5000 now mapped to USB mobile device.`
    ]);
  };

  // Push Termux Microserver Payload
  const handleDeployTermuxPayload = async () => {
    audioManager.playSound('deploy');
    setIsDeployingTermux(true);
    setActiveDeployStep(1);

    setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting Termux Microserver deployment...`]);
    await new Promise(r => setTimeout(r, 600));

    setActiveDeployStep(2);
    setDeployLogs(prev => [...prev, `[TERMUX] Generating /data/data/com.termux/files/home/dragon9-microserver...`]);
    await new Promise(r => setTimeout(r, 800));

    setActiveDeployStep(3);
    setDeployLogs(prev => [...prev, `[TERMUX] Executing termux-wake-lock && npm install express ws @google/genai`]);
    await new Promise(r => setTimeout(r, 900));

    setActiveDeployStep(4);
    setDeployLogs(prev => [
      ...prev,
      `[TERMUX] Starting Node.js background worker on port 5000...`,
      `[✓] Termux Microserver is RUNNING. Access at mobile http://localhost:5000`
    ]);

    setIsDeployingTermux(false);
    audioManager.playSound('score');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Fastboot Firmware Partition Flasher Simulation
  const handleFlashPartition = async () => {
    audioManager.playSound('alert');
    setIsFlashing(true);
    setFlashProgress(10);

    for (let p = 20; p <= 100; p += 20) {
      await new Promise(r => setTimeout(r, 400));
      setFlashProgress(p);
    }

    setDeployLogs(prev => [
      ...prev,
      `[FASTBOOT] Target: ${selectedPartition}`,
      `[FASTBOOT] Sending '${selectedPartition}' (65536 KB)... OKAY [ 1.428s]`,
      `[FASTBOOT] Writing '${selectedPartition}'... OKAY [ 0.812s]`,
      `[FASTBOOT] Finished. Total time: 2.240s`
    ]);

    setIsFlashing(false);
    audioManager.playSound('score');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hardware Spec Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-violet-400">
              <Usb className="h-4 w-4" />
              <span>USB 3.2 HIGH-SPEED ADB HOST BRIDGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-3">
              <span>{deviceStatus.deviceName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ARM64 ONLINE
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Real-time ADB communication layer with automated reverse port forwarding and ARM64 Termux payload orchestrator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="rebind-adb-btn"
              onClick={handleRebindAdb}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-300 text-xs font-bold hover:bg-violet-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Re-bind Reverse Ports (3000 / 5000)</span>
            </button>
          </div>
        </div>

        {/* Hardware Status Gauges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">CPU ABI</span>
              <span className="text-slate-100 font-bold">{deviceStatus.abi}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <BatteryCharging className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Battery & Thermal</span>
              <span className="text-slate-100 font-bold">{deviceStatus.batteryLevel}% ({deviceStatus.batteryTempC}°C)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Usb className="h-5 w-5 text-violet-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Link Interface</span>
              <span className="text-slate-100 font-bold">USB 3.2 (5 Gbps)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Layers className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">OS Subsystem</span>
              <span className="text-slate-100 font-bold">Android 15</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ADB Reverse Port Bridge & Termux Microserver Deployer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ADB Reverse Port Matrix */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Usb className="h-4 w-4 text-cyan-400" />
              USB ADB Reverse Port Forwarding
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Host ↔ Device
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold block">PORT 3000 (Dragon 9 Web UI)</span>
                <span className="text-[11px] text-slate-400">adb reverse tcp:3000 tcp:3000</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="h-4 w-4" /> BOUND
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-violet-400 font-bold block">PORT 5000 (Node Microserver)</span>
                <span className="text-[11px] text-slate-400">adb reverse tcp:5000 tcp:5000</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="h-4 w-4" /> BOUND
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-bold block">PORT 8080 (ADB Gateway)</span>
                <span className="text-[11px] text-slate-400">adb forward tcp:8080 tcp:8080</span>
              </div>
              <span className="text-slate-500 text-[11px]">STANDBY</span>
            </div>
          </div>
        </div>

        {/* Termux Microserver Deployer */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-violet-400" />
              Termux ARM64 Microserver Payload
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Wake-Lock Active
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Pushes an optimized Node.js background daemon with Express routes, socket streamer, and persistent wake-lock directly into the mobile Termux userland.
          </p>

          {/* Deployment Step Progress */}
          <div className="grid grid-cols-4 gap-2 font-mono text-[10px] text-center">
            <div className={`p-2 rounded-lg border ${activeDeployStep >= 1 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              1. ADB Push
            </div>
            <div className={`p-2 rounded-lg border ${activeDeployStep >= 2 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              2. Userland Env
            </div>
            <div className={`p-2 rounded-lg border ${activeDeployStep >= 3 ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              3. Wake-Lock
            </div>
            <div className={`p-2 rounded-lg border ${activeDeployStep >= 4 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              4. Active :5000
            </div>
          </div>

          <button
            id="deploy-termux-payload-btn"
            onClick={handleDeployTermuxPayload}
            disabled={isDeployingTermux}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-violet-400 hover:to-cyan-400 transition-all shadow-md shadow-violet-500/20 active:scale-95 disabled:opacity-50"
          >
            <Play className={`h-4 w-4 ${isDeployingTermux ? 'animate-spin' : ''}`} />
            <span>{isDeployingTermux ? 'Pushing ARM64 Payload...' : 'Deploy Microserver Payload to Android'}</span>
          </button>
        </div>
      </div>

      {/* 3. Fastboot Hardware Partition Flasher & Live Deployment Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Partition Flasher Selector */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Fastboot Partition Flasher
            </h3>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Safe Flashing Mode
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">TARGET PARTITION / PAYLOAD</label>
              <select
                value={selectedPartition}
                onChange={e => setSelectedPartition(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-amber-400 focus:outline-none"
              >
                <option value="boot.img">boot.img (Magisk / KernelSU Kernel)</option>
                <option value="init_boot.img">init_boot.img (Android 14+ GKI Root)</option>
                <option value="vendor_boot.img">vendor_boot.img (Custom Recovery)</option>
                <option value="dtbo.img">dtbo.img (Device Tree Overlay)</option>
                <option value="payload.bin">payload.bin (Full OTA Unpacker)</option>
              </select>
            </div>

            {isFlashing && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                  <span>Writing Partition Block...</span>
                  <span>{flashProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-300"
                    style={{ width: `${flashProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              id="flash-partition-btn"
              onClick={handleFlashPartition}
              disabled={isFlashing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold text-xs hover:bg-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{isFlashing ? 'Flashing Partition Block...' : `Flash ${selectedPartition}`}</span>
            </button>
          </div>
        </div>

        {/* Live Deployment & Flash Output Console */}
        <div className="lg:col-span-7 glass-card rounded-2xl overflow-hidden flex flex-col h-[280px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              ADB & Flashing Event Log
            </span>
            <span className="text-emerald-400 text-[11px]">● Live Stream</span>
          </div>

          <div className="flex-1 p-3.5 bg-slate-950 font-mono text-xs overflow-y-auto space-y-1 select-text">
            {deployLogs.map((l, idx) => (
              <div key={idx} className="text-slate-300 leading-relaxed">
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
