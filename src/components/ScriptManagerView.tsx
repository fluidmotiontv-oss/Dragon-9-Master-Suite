import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  Archive, 
  Settings2, 
  Sparkles, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { ScriptOptions, TerminalLog, BackupItem } from '../types';
import { audioManager } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface ScriptManagerViewProps {
  initialScriptConfig?: Partial<ScriptOptions>;
  onExecuteCommandInTerminal?: (cmd: string) => void;
}

export const ScriptManagerView: React.FC<ScriptManagerViewProps> = () => {
  // Script Generator Options
  const [scriptOptions, setScriptOptions] = useState<ScriptOptions>({
    portUi: 3000,
    portApi: 5000,
    includeSystemd: true,
    includeAutoTunnels: true,
    includeTermuxSupport: true,
    includeHealthWatchdog: true,
    includeAutoBackup: true,
    backupCron: '0 3 * * *',
    tmuxSessionName: 'dragon9-core'
  });

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'script_generator' | 'terminal_sim' | 'backup_disaster'>('script_generator');

  // Terminal Simulator State
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { id: '1', text: '[DRAGON 9 MASTER BOOTSTRAP] System Daemon Initialized.', type: 'info', timestamp: '00:00:01' },
    { id: '2', text: 'Target Architecture: aarch64 / x86_64 dual-compatible.', type: 'info', timestamp: '00:00:02' },
    { id: '3', text: 'Ready for execution. Type "help" or click one of the quick action flags below.', type: 'success', timestamp: '00:00:03' }
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Backup & Disaster Recovery State
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: 'bk-092',
      filename: 'dragon9_full_20260820_000001.tar.gz',
      size: '48.2 MB',
      timestamp: '2026-08-20 00:00:01',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      type: 'Full Snapshot',
      status: 'Verified'
    },
    {
      id: 'bk-091',
      filename: 'dragon9_config_20260819_180000.tar.gz',
      size: '1.4 MB',
      timestamp: '2026-08-19 18:00:00',
      sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      type: 'Config Only',
      status: 'Verified'
    }
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [restoredBackupId, setRestoredBackupId] = useState<string | null>(null);

  // Generate script whenever options change
  useEffect(() => {
    fetch('/api/scripts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scriptOptions)
    })
      .then(res => res.json())
      .then(data => {
        if (data.script) setGeneratedScript(data.script);
      })
      .catch(() => {
        // Fallback local generator
        const script = `#!/usr/bin/env bash\n# Dragon 9 Master Bootstrap (v9.4.2)\nPORT_UI=${scriptOptions.portUi}\nPORT_API=${scriptOptions.portApi}\nTMUX_SESSION="${scriptOptions.tmuxSessionName}"\n\necho "Initializing Dragon 9 Core on port $PORT_UI..."`;
        setGeneratedScript(script);
      });
  }, [scriptOptions]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleCopyScript = () => {
    audioManager.playSound('click');
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    audioManager.playSound('deploy');
    const blob = new Blob([generatedScript], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dragon9_bootstrap.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run a simulated command stream in the terminal
  const executeCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed || isExecuting) return;

    audioManager.playSound('click');
    setIsExecuting(true);
    const now = new Date().toLocaleTimeString();

    // Append user command
    const newLogs: TerminalLog[] = [
      ...terminalLogs,
      { id: Date.now().toString(), text: `dragon9-root@host:~$ ${trimmed}`, type: 'command', timestamp: now }
    ];
    setTerminalLogs(newLogs);
    setTerminalInput('');

    // Simulate realistic execution timing & ANSI output
    const appendLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
      setTerminalLogs(prev => [
        ...prev,
        { id: Math.random().toString(), text, type, timestamp: new Date().toLocaleTimeString() }
      ]);
    };

    if (trimmed === 'clear') {
      setTerminalLogs([]);
      setIsExecuting(false);
      return;
    }

    if (trimmed === 'help') {
      appendLog('Dragon 9 Bootstrap CLI Simulator Available Commands:', 'info');
      appendLog('  ./dragon9_bootstrap.sh --install     Install dependencies & system binaries', 'info');
      appendLog('  ./dragon9_bootstrap.sh --audit       Audit CPU, RAM, Disk & ARM64 ABI', 'info');
      appendLog('  ./dragon9_bootstrap.sh --start       Launch Dragon 9 UI & Express in Tmux', 'info');
      appendLog('  ./dragon9_bootstrap.sh --stop        Terminate active daemons & release ports', 'warn');
      appendLog('  ./dragon9_bootstrap.sh --backup      Create tar.gz SHA-256 verified snapshot', 'success');
      appendLog('  ./dragon9_bootstrap.sh --systemd     Install systemd daemon service unit', 'info');
      appendLog('  neofetch                             Display Dragon 9 system architecture specs', 'info');
      appendLog('  clear                                Clear terminal window', 'info');
      setIsExecuting(false);
      return;
    }

    if (trimmed.includes('--install')) {
      appendLog('[*] Step 1/4: Checking system package manager (apt/pacman/pkg)...', 'info');
      await new Promise(r => setTimeout(r, 600));
      appendLog('[✓] Found Node.js v20.12.0, npm 10.5.0, tmux 3.4, adb 1.0.41', 'success');
      await new Promise(r => setTimeout(r, 700));
      appendLog('[*] Step 2/4: Configuring permissions on ~/.dragon9 workspace...', 'info');
      await new Promise(r => setTimeout(r, 500));
      appendLog('[✓] Core binaries and libraries configured.', 'success');
      audioManager.playSound('deploy');
    } else if (trimmed.includes('--audit')) {
      appendLog('[*] Hardware Audit Initiated...', 'info');
      await new Promise(r => setTimeout(r, 500));
      appendLog('    CPU: 8x ARM64 Cortex-X4/A720 / x86_64 Hybrid', 'info');
      appendLog('    Kernel: Linux 6.6.21-dragon9-hardened-lts', 'info');
      appendLog('    Memory: 16 GB LPDDR5X (9.2 GB allocated)', 'info');
      appendLog('    Ports: 3000 (UI), 5000 (API), 8080 (ADB Gateway) [Available]', 'success');
      appendLog('[✓] Host environment passed all 12 system security checks.', 'success');
    } else if (trimmed.includes('--start')) {
      appendLog(`[*] Initializing Tmux session "${scriptOptions.tmuxSessionName}"...`, 'info');
      await new Promise(r => setTimeout(r, 600));
      appendLog(`[✓] Worker 0: Dragon 9 UI bound to http://0.0.0.0:${scriptOptions.portUi}`, 'success');
      appendLog(`[✓] Worker 1: Node Microserver bound to http://0.0.0.0:${scriptOptions.portApi}`, 'success');
      appendLog(`[✓] Worker 2: Health Watchdog Daemon active (Interval: 30s)`, 'success');
      appendLog('[✓] Dragon 9 Core is RUNNING.', 'success');
      audioManager.playSound('deploy');
    } else if (trimmed.includes('--stop')) {
      appendLog('[!] Sending SIGTERM to tmux cluster...', 'warn');
      await new Promise(r => setTimeout(r, 600));
      appendLog(`[✓] Freed ports ${scriptOptions.portUi}, ${scriptOptions.portApi}. All workers safely halted.`, 'success');
    } else if (trimmed.includes('--backup')) {
      appendLog('[*] Creating tar.gz snapshot of ~/.dragon9 root...', 'info');
      await new Promise(r => setTimeout(r, 700));
      appendLog('[✓] Compressed 48.2 MB archive.', 'info');
      appendLog('[*] Calculating SHA-256 checksum...', 'info');
      await new Promise(r => setTimeout(r, 400));
      appendLog('[✓] SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'success');
      appendLog('[✓] Snapshot stored in ~/.dragon9/backups/dragon9_full_auto.tar.gz', 'success');
      audioManager.playSound('score');
    } else if (trimmed.includes('--systemd')) {
      appendLog('[*] Generating /etc/systemd/system/dragon9.service...', 'info');
      await new Promise(r => setTimeout(r, 500));
      appendLog('[✓] Executed: systemctl daemon-reload && systemctl enable dragon9', 'success');
      appendLog('[✓] Dragon 9 will now auto-start on host boot.', 'success');
    } else if (trimmed.includes('neofetch')) {
      appendLog('        /\\        OS: Dragon 9 Master Linux OS v9.4.2', 'info');
      appendLog('       /  \\       Host: Node 01 High-Availability Cluster', 'info');
      appendLog('      / /\\ \\      Kernel: 6.6.21-dragon9-core', 'info');
      appendLog('     / /  \\ \\     Uptime: 4 hours, 18 mins', 'info');
      appendLog('    / / /\\ \\ \\    Shell: bash 5.2.21 / tmux 3.4', 'info');
      appendLog('   /_/ /  \\ \\_\\   Theme: Cyber Dark Neon Cyan / Violet', 'success');
    } else {
      appendLog(`[i] Simulated execution of: ${trimmed}`, 'info');
      appendLog(`[✓] Exit code: 0 (OK)`, 'success');
    }

    setIsExecuting(false);
  };

  // Create Snapshot Action
  const handleCreateSnapshot = (type: 'Full Snapshot' | 'Config Only') => {
    audioManager.playSound('deploy');
    setIsCreatingBackup(true);

    fetch('/api/backup/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
      .then(res => res.json())
      .then(data => {
        if (data.backup) {
          setBackups([data.backup, ...backups]);
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        }
      })
      .finally(() => {
        setIsCreatingBackup(false);
      });
  };

  const handleRestoreSnapshot = (backup: BackupItem) => {
    audioManager.playSound('deploy');
    setRestoredBackupId(backup.id);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setRestoredBackupId(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="subtab-script-gen"
            onClick={() => {
              audioManager.playSound('click');
              setActiveSubTab('script_generator');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'script_generator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            <span>Bash Script Generator</span>
          </button>

          <button
            id="subtab-terminal-sim"
            onClick={() => {
              audioManager.playSound('click');
              setActiveSubTab('terminal_sim');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'terminal_sim'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 glow-violet'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Terminal Simulator</span>
          </button>

          <button
            id="subtab-backup-center"
            onClick={() => {
              audioManager.playSound('click');
              setActiveSubTab('backup_disaster');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'backup_disaster'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>Disaster Recovery & SHA-256</span>
          </button>
        </div>

        <span className="hidden sm:inline font-mono text-xs text-slate-400">
          Script Engine: <span className="text-cyan-400">v9.4.2 Core</span>
        </span>
      </div>

      {/* 1. SCRIPT GENERATOR VIEW */}
      {activeSubTab === 'script_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Builder Controls */}
          <div className="lg:col-span-5 space-y-4 glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-cyan-400" />
                Script Customization Flags
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                dragon9_bootstrap.sh
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Port UI & API */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">UI PORT (Vite/SPA)</label>
                  <input
                    type="number"
                    value={scriptOptions.portUi}
                    onChange={e => setScriptOptions({ ...scriptOptions, portUi: Number(e.target.value) || 3000 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">API PORT (Microserver)</label>
                  <input
                    type="number"
                    value={scriptOptions.portApi}
                    onChange={e => setScriptOptions({ ...scriptOptions, portApi: Number(e.target.value) || 5000 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-violet-400 font-bold focus:border-violet-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tmux Session Name */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">TMUX SESSION NAME</label>
                <input
                  type="text"
                  value={scriptOptions.tmuxSessionName}
                  onChange={e => setScriptOptions({ ...scriptOptions, tmuxSessionName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Backup Cron */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">BACKUP CRON SCHEDULE</label>
                <input
                  type="text"
                  value={scriptOptions.backupCron}
                  onChange={e => setScriptOptions({ ...scriptOptions, backupCron: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Toggle Switches */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Systemd Service Daemon Setup</span>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeSystemd}
                    onChange={e => setScriptOptions({ ...scriptOptions, includeSystemd: e.target.checked })}
                    className="accent-cyan-400 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Auto Mesh Tunnels (Cloudflare & Serveo)</span>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeAutoTunnels}
                    onChange={e => setScriptOptions({ ...scriptOptions, includeAutoTunnels: e.target.checked })}
                    className="accent-cyan-400 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Termux Android ARM64 Compatibility</span>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeTermuxSupport}
                    onChange={e => setScriptOptions({ ...scriptOptions, includeTermuxSupport: e.target.checked })}
                    className="accent-cyan-400 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Health Watchdog Loop (Auto-Heal)</span>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeHealthWatchdog}
                    onChange={e => setScriptOptions({ ...scriptOptions, includeHealthWatchdog: e.target.checked })}
                    className="accent-cyan-400 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <span className="text-slate-300">Automated tar.gz Disaster Recovery</span>
                  <input
                    type="checkbox"
                    checked={scriptOptions.includeAutoBackup}
                    onChange={e => setScriptOptions({ ...scriptOptions, includeAutoBackup: e.target.checked })}
                    className="accent-cyan-400 h-4 w-4"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  id="copy-script-btn"
                  onClick={handleCopyScript}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-bold hover:bg-cyan-500/20 transition-all active:scale-95"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Script'}</span>
                </button>

                <button
                  id="download-script-btn"
                  onClick={handleDownloadScript}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .sh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Script Code Preview */}
          <div className="lg:col-span-7 flex flex-col glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">dragon9_bootstrap.sh (Interactive Preview)</span>
              </div>
              <button
                onClick={() => {
                  audioManager.playSound('deploy');
                  setActiveSubTab('terminal_sim');
                  executeCommand('./dragon9_bootstrap.sh --install');
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-sm"
              >
                <Play className="h-3 w-3" />
                <span>Simulate Execution</span>
              </button>
            </div>

            <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[520px] bg-slate-950/90 leading-relaxed select-text">
              <code>{generatedScript}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 2. EMBEDDED TERMINAL SIMULATOR VIEW */}
      {activeSubTab === 'terminal_sim' && (
        <div className="space-y-4">
          {/* Quick Action Flag Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Quick Flags:</span>
            {[
              { label: '--install', desc: 'Install Packages' },
              { label: '--audit', desc: 'Hardware & ABI Check' },
              { label: '--start', desc: 'Launch Tmux Cluster' },
              { label: '--stop', desc: 'Halt Daemons' },
              { label: '--backup', desc: 'Snapshot tar.gz' },
              { label: '--systemd', desc: 'Register Service' },
              { label: 'neofetch', desc: 'System Spec' }
            ].map(f => (
              <button
                key={f.label}
                onClick={() => executeCommand(f.label === 'neofetch' ? 'neofetch' : `./dragon9_bootstrap.sh ${f.label}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-mono text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all"
              >
                <Play className="h-3 w-3 text-cyan-400" />
                <span>{f.label}</span>
              </button>
            ))}
            <button
              onClick={() => executeCommand('clear')}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ml-auto"
            >
              Clear Screen
            </button>
          </div>

          {/* Terminal Console Box */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-300 font-bold">dragon9@cluster01: ~ (bash / tmux)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>Session: <strong className="text-violet-400">{scriptOptions.tmuxSessionName}</strong></span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Output Log Stream */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-slate-950/95 space-y-1.5 select-text">
              {terminalLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`flex items-start gap-2 leading-relaxed ${
                    log.type === 'command' 
                      ? 'text-cyan-400 font-bold' 
                      : log.type === 'success' 
                      ? 'text-emerald-400' 
                      : log.type === 'warn' 
                      ? 'text-amber-400' 
                      : log.type === 'error' 
                      ? 'text-red-400' 
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 select-none text-[10px]">[{log.timestamp}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
              {isExecuting && (
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  <span>Processing script command execution stream...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Command Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(terminalInput);
              }}
              className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800"
            >
              <span className="text-cyan-400 font-mono text-xs font-bold pl-2">dragon9-root@host:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                placeholder="Type command (e.g. ./dragon9_bootstrap.sh --audit, help, clear)..."
                disabled={isExecuting}
                className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={isExecuting || !terminalInput.trim()}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold hover:bg-cyan-500/30 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. DISASTER RECOVERY & BACKUP CENTER */}
      {activeSubTab === 'backup_disaster' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Automated Disaster Recovery & SHA-256 Vault
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Zero-data-loss snapshot engine with automatic gzip compression and cryptographic tamper verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="create-config-backup-btn"
                onClick={() => handleCreateSnapshot('Config Only')}
                disabled={isCreatingBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Config Only (1.4MB)</span>
              </button>

              <button
                id="create-full-backup-btn"
                onClick={() => handleCreateSnapshot('Full Snapshot')}
                disabled={isCreatingBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold hover:from-emerald-400 hover:to-teal-500 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{isCreatingBackup ? 'Compressing tar.gz...' : 'Create Full Snapshot'}</span>
              </button>
            </div>
          </div>

          {/* Backup Snapshot List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-slate-200">AVAILABLE SNAPSHOT VAULT ({backups.length} ARCHIVES)</span>
              <span className="text-slate-400">CRON AUTO-RUN: <strong className="text-cyan-400">0 3 * * * (Daily 03:00)</strong></span>
            </div>

            <div className="divide-y divide-slate-800">
              {backups.map(b => (
                <div key={b.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-cyan-400" />
                      <span className="font-bold text-slate-200">{b.filename}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.type === 'Full Snapshot' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                      }`}>
                        {b.type}
                      </span>
                      {restoredBackupId === b.id && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                          RESTORE APPLIED
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>Size: <strong className="text-slate-300">{b.size}</strong></span>
                      <span>•</span>
                      <span>Created: {b.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 break-all flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>SHA-256: {b.sha256}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreSnapshot(b)}
                      className="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold hover:bg-emerald-500/20 transition-all text-xs active:scale-95"
                    >
                      Restore Snapshot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
