import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Globe, 
  Radio, 
  Layers, 
  Activity, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Play, 
  Pause, 
  QrCode, 
  Zap, 
  Sliders
} from 'lucide-react';
import { NetworkDiagnostics, TunnelInfo, LanDevice } from '../types';
import { audioManager } from '../utils/audioSynth';

export const NetworkDiagnosticView: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics>({
    wanStatus: "connected",
    lanStatus: "connected",
    externalIp: "104.28.192.88",
    localIp: "192.168.1.109",
    gateway: "192.168.1.1",
    dnsPrimary: "1.1.1.1 (Cloudflare Secure)",
    dnsSecondary: "8.8.8.8 (Google Public)",
    ispName: "Fiber Gigabit Xstream",
    currentLatencyMs: 22,
    jitterMs: 1.4,
    packetLossPercent: 0.0,
    downloadSpeedMbps: 840.5,
    uploadSpeedMbps: 620.2,
    sslCertificate: "Valid (ECDSA 384-bit TLS 1.3)",
    tunnels: [
      { id: "cf-1", provider: "Cloudflare", name: "dragon9.trycloudflare.com", port: 3000, status: "online", uptime: "4h 12m", latency: 24 },
      { id: "ser-1", provider: "Serveo", name: "dragon9-server.serveo.net", port: 5000, status: "standby", uptime: "0m", latency: 48 },
      { id: "lh-1", provider: "Localhost.run", name: "d9-mesh.lhr.life", port: 3000, status: "offline", uptime: "0m", latency: 0 }
    ]
  });

  const [latencyHistory, setLatencyHistory] = useState<number[]>([20, 24, 22, 19, 23, 21, 26, 22, 18, 24, 21, 23, 20]);
  const [lanDevices, setLanDevices] = useState<LanDevice[]>([
    { id: "dev-1", name: "Dragon-9-Host (This Server)", ip: "192.168.1.109", mac: "DC:A6:32:8B:11:4F", vendor: "Workstation Core", status: "online", latency: "< 1ms", type: "server", openPorts: [22, 3000, 5000] },
    { id: "dev-2", name: "Pixel-8-Pro (USB ADB ARM64)", ip: "192.168.1.144", mac: "52:54:00:12:34:56", vendor: "Google Pixel", status: "online", latency: "2ms", type: "phone", openPorts: [8080, 5000] },
    { id: "dev-3", name: "iPad-Pro-M2 (AirPlay Remote)", ip: "192.168.1.115", mac: "F0:18:98:AA:BC:11", vendor: "Apple", status: "online", latency: "4ms", type: "tablet", openPorts: [7000] },
    { id: "dev-4", name: "Smart-Living-Audio-DAC", ip: "192.168.1.180", mac: "00:11:22:33:44:55", vendor: "HiFi Streamer", status: "online", latency: "6ms", type: "media", openPorts: [4444] },
    { id: "dev-5", name: "Gateway Router Mesh-01", ip: "192.168.1.1", mac: "30:91:8F:CC:01:29", vendor: "Wi-Fi 7 Core", status: "online", latency: "1ms", type: "router", openPorts: [53, 80, 443] }
  ]);

  const [copiedTunnelId, setCopiedTunnelId] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);
  const [isScanningLan, setIsScanningLan] = useState<boolean>(false);
  const [selectedQrTunnel, setSelectedQrTunnel] = useState<TunnelInfo | null>(null);

  // Live periodic latency update
  useEffect(() => {
    const interval = setInterval(() => {
      const newLatency = Math.round(18 + Math.random() * 8);
      setLatencyHistory(prev => [...prev.slice(-19), newLatency]);
      setDiagnostics(prev => ({
        ...prev,
        currentLatencyMs: newLatency
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTestLink = () => {
    audioManager.playSound('click');
    setIsTestingPing(true);
    setTimeout(() => {
      audioManager.playSound('score');
      setIsTestingPing(false);
      const newLatency = Math.round(16 + Math.random() * 6);
      setDiagnostics(prev => ({
        ...prev,
        currentLatencyMs: newLatency,
        jitterMs: parseFloat((1.1 + Math.random() * 0.5).toFixed(1)),
        downloadSpeedMbps: parseFloat((820 + Math.random() * 60).toFixed(1))
      }));
    }, 1200);
  };

  const handleScanLan = () => {
    audioManager.playSound('deploy');
    setIsScanningLan(true);
    setTimeout(() => {
      setIsScanningLan(false);
      audioManager.playSound('click');
    }, 1400);
  };

  const toggleTunnelStatus = (tunnelId: string) => {
    audioManager.playSound('click');
    setDiagnostics(prev => ({
      ...prev,
      tunnels: prev.tunnels.map(t => {
        if (t.id === tunnelId) {
          const nextStatus = t.status === 'online' ? 'offline' : 'online';
          return {
            ...t,
            status: nextStatus,
            uptime: nextStatus === 'online' ? '1m' : '0m'
          };
        }
        return t;
      })
    }));
  };

  const copyTunnelUrl = (tunnel: TunnelInfo) => {
    audioManager.playSound('click');
    const url = `https://${tunnel.name}`;
    navigator.clipboard.writeText(url);
    setCopiedTunnelId(tunnel.id);
    setTimeout(() => setCopiedTunnelId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Diagnostics Overview Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <Globe className="h-4 w-4" />
              <span>ISP TELEMETRY & WAN/LAN GATEWAY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100">
              Network Mesh & Tunnel Manager
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Real-time monitoring of round-trip latency, public IPv4/IPv6 routing, SSL certificate validity, and automated Cloudflare/Serveo reverse tunnels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="test-network-link-btn"
              onClick={handleTestLink}
              disabled={isTestingPing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isTestingPing ? 'animate-spin' : ''}`} />
              <span>{isTestingPing ? 'Pinging ISP Route...' : 'Run Diagnostics Ping'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostics Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Public IP</span>
            <span className="text-cyan-400 font-bold">{diagnostics.externalIp}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Local IP</span>
            <span className="text-slate-200 font-bold">{diagnostics.localIp}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Ping / Latency</span>
            <span className="text-emerald-400 font-bold">{diagnostics.currentLatencyMs} ms</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Jitter / Loss</span>
            <span className="text-slate-200 font-bold">{diagnostics.jitterMs}ms / 0.0%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Download Bandwidth</span>
            <span className="text-cyan-300 font-bold">{diagnostics.downloadSpeedMbps} Mbps</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">ISP Core</span>
            <span className="text-violet-300 font-bold truncate">{diagnostics.ispName}</span>
          </div>
        </div>
      </div>

      {/* 2. Latency History Live Graph Card */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-slate-200 uppercase flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Live Round-Trip Latency Oscilloscope (ms)
          </span>
          <span className="text-slate-400">Current: <strong className="text-cyan-400">{diagnostics.currentLatencyMs} ms</strong></span>
        </div>

        {/* Real-time Bar / Wave Graph */}
        <div className="h-28 w-full flex items-end gap-1.5 pt-4 pb-2 px-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
          {latencyHistory.map((val, idx) => {
            const heightPercent = Math.min(100, (val / 50) * 100);
            const isLast = idx === latencyHistory.length - 1;
            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
              >
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    isLast 
                      ? 'bg-cyan-400 glow-cyan' 
                      : val > 30 
                      ? 'bg-amber-400/80' 
                      : 'bg-gradient-to-t from-slate-700 to-cyan-500/60'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] font-mono text-slate-500 hidden group-hover:block absolute -top-5 bg-slate-900 px-1 rounded border border-slate-700">
                  {val}ms
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Automated Tunnel Mesh (Cloudflare, Serveo, Localhost.run) */}
      <div className="glass-card rounded-2xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Radio className="h-5 w-5 text-violet-400" />
              1-Click Mesh Tunnel Manager
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely expose Dragon 9 ports (3000 & 5000) to the public web without port forwarding on your router.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 self-start sm:self-auto">
            Zero-Trust Protected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diagnostics.tunnels.map(tunnel => {
            const isOnline = tunnel.status === 'online';
            return (
              <div 
                key={tunnel.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isOnline 
                    ? 'bg-slate-900/90 border-cyan-500/40 glow-cyan' 
                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase font-mono">{tunnel.provider} Tunnel</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tunnel.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold text-cyan-300 break-all p-2 bg-slate-950 rounded-lg border border-slate-800">
                    https://{tunnel.name}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Forward Port: <strong className="text-slate-200">:{tunnel.port}</strong></span>
                    <span>Latency: <strong className="text-slate-200">{tunnel.latency}ms</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => copyTunnelUrl(tunnel)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all"
                  >
                    {copiedTunnelId === tunnel.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedTunnelId === tunnel.id ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={() => {
                      audioManager.playSound('click');
                      setSelectedQrTunnel(tunnel);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 transition-all"
                    title="Show Mobile QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => toggleTunnelStatus(tunnel.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                      isOnline 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isOnline ? 'Stop' : 'Launch'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. LAN Device Scanner */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Local Area Network (LAN) Device Map
            </h3>
            <p className="text-xs text-slate-400">
              Discovered devices on subnet 192.168.1.0/24 with active MAC addresses & open socket ports.
            </p>
          </div>

          <button
            id="scan-lan-btn"
            onClick={handleScanLan}
            disabled={isScanningLan}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-mono font-semibold text-slate-200 hover:bg-slate-700 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanningLan ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isScanningLan ? 'Scanning Subnet ARP...' : 'Scan Subnet'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2 font-medium">DEVICE NAME</th>
                <th className="pb-2 font-medium">LOCAL IP</th>
                <th className="pb-2 font-medium">MAC ADDRESS</th>
                <th className="pb-2 font-medium">VENDOR / HARDWARE</th>
                <th className="pb-2 font-medium">OPEN PORTS</th>
                <th className="pb-2 font-medium text-right">LATENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lanDevices.map(dev => (
                <tr key={dev.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 font-bold text-slate-200 flex items-center gap-2">
                    {dev.type === 'server' ? <Server className="h-4 w-4 text-cyan-400" /> :
                     dev.type === 'phone' ? <Smartphone className="h-4 w-4 text-violet-400" /> :
                     dev.type === 'tablet' ? <Tablet className="h-4 w-4 text-emerald-400" /> :
                     <Radio className="h-4 w-4 text-amber-400" />}
                    <span>{dev.name}</span>
                  </td>
                  <td className="py-2.5 text-cyan-300 font-semibold">{dev.ip}</td>
                  <td className="py-2.5 text-slate-400">{dev.mac}</td>
                  <td className="py-2.5 text-slate-300">{dev.vendor}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      {dev.openPorts.map(p => (
                        <span key={p} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                          :{p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-400">{dev.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal for Mobile Quick Test */}
      {selectedQrTunnel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full space-y-4 border border-cyan-500/40 glow-cyan">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-cyan-400" />
                Mobile Access QR
              </h4>
              <button 
                onClick={() => setSelectedQrTunnel(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl">
              {/* Synthetic QR Code graphic representation */}
              <div className="w-48 h-48 bg-slate-950 p-2 rounded-lg flex flex-col items-center justify-center text-center">
                <QrCode className="w-36 h-36 text-cyan-400 animate-pulse" />
                <span className="text-[10px] text-cyan-300 font-mono mt-1">SCAN WITH PHONE CAMERA</span>
              </div>
            </div>

            <div className="text-center font-mono text-xs text-slate-300 break-all">
              https://{selectedQrTunnel.name}
            </div>

            <button
              onClick={() => setSelectedQrTunnel(null)}
              className="w-full py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
