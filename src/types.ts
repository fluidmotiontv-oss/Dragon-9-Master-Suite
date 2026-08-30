export type WorkspaceTab = 
  | 'dashboard'
  | 'scripts'
  | 'network'
  | 'flasher'
  | 'ai_assistant'
  | 'media_arcade';

export type DeviceMode = 'laptop' | 'phone' | 'tablet_pc';

export interface SystemPort {
  port: number;
  service: string;
  status: 'LISTEN' | 'IDLE' | 'CONFLICT';
  pid: number;
}

export interface SystemStatus {
  status: string;
  serverName: string;
  version: string;
  uptimeSeconds: number;
  mode: DeviceMode;
  cpuUsage: number;
  ramUsage: number;
  ramTotalGb: number;
  ramUsedGb: number;
  diskUsage: number;
  diskTotalGb: number;
  diskUsedGb: number;
  thermalPackageC: number;
  batteryLevel: number;
  isAcCharging: boolean;
  lidClosedMode: boolean;
  tmuxSessions: string[];
  ports: SystemPort[];
  customClock54: {
    standardTime: string;
    customTime: string;
    cycleProgress: number;
  };
}

export interface TunnelInfo {
  id: string;
  provider: 'Cloudflare' | 'Serveo' | 'Localhost.run' | 'Custom';
  name: string;
  port: number;
  status: 'online' | 'standby' | 'offline';
  uptime: string;
  latency: number;
}

export interface LanDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  vendor: string;
  status: 'online' | 'offline';
  latency: string;
  type: 'server' | 'phone' | 'tablet' | 'media' | 'router' | 'desktop';
  openPorts: number[];
}

export interface NetworkDiagnostics {
  wanStatus: string;
  lanStatus: string;
  externalIp: string;
  localIp: string;
  gateway: string;
  dnsPrimary: string;
  dnsSecondary: string;
  ispName: string;
  currentLatencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  sslCertificate: string;
  tunnels: TunnelInfo[];
}

export interface BackupItem {
  id: string;
  filename: string;
  size: string;
  timestamp: string;
  sha256: string;
  type: 'Full Snapshot' | 'Config Only' | 'Media DB';
  status: 'Verified' | 'Pending' | 'Restored';
}

export interface ScriptOptions {
  portUi: number;
  portApi: number;
  includeSystemd: boolean;
  includeAutoTunnels: boolean;
  includeTermuxSupport: boolean;
  includeHealthWatchdog: boolean;
  includeAutoBackup: boolean;
  backupCron: string;
  tmuxSessionName: string;
}

export interface TerminalLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'command';
  timestamp: string;
}

export interface AdbDeviceStatus {
  connected: boolean;
  deviceName: string;
  serial: string;
  abi: string;
  androidVersion: string;
  batteryLevel: number;
  batteryTempC: number;
  connectionType: string;
  adbState: string;
  reversePort3000: boolean;
  reversePort5000: boolean;
  termuxMicroserver: {
    installed: boolean;
    running: boolean;
    port: number;
    nodeVersion: string;
    wakeLock: string;
    memoryMb: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  source?: string;
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: string;
  accentColor: string;
  glowColor: string;
  waveformPattern: number[];
}
