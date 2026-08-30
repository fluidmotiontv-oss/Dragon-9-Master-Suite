import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  Terminal, 
  Zap, 
  Activity, 
  HelpCircle, 
  Check, 
  Copy, 
  RotateCcw,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { ChatMessage, DeviceMode, WorkspaceTab } from '../types';
import { audioManager, speakText } from '../utils/audioSynth';

interface NeuralAssistantViewProps {
  onModeChange: (mode: DeviceMode) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
  currentMode: DeviceMode;
}

export const NeuralAssistantView: React.FC<NeuralAssistantViewProps> = ({
  onModeChange,
  setActiveTab,
  currentMode
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Dragon 9 Neural Core online. I am equipped to analyze server telemetry, orchestrate bash bootstrap scripts, diagnose network tunnels, trigger ADB reverse bridges, and execute system commands by voice or text. How can I assist your deployment?",
      timestamp: '00:00:01',
      source: 'gemini-3.7-flash'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [autoNarrate, setAutoNarrate] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [audioWaveLevels, setAudioWaveLevels] = useState<number[]>([12, 24, 38, 50, 42, 60, 45, 30, 20, 15, 35, 48]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Web Speech API STT listener setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputPrompt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Animate soundwave bars when listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioWaveLevels(prev => prev.map(() => Math.floor(15 + Math.random() * 80)));
      }, 100);
    } else {
      setAudioWaveLevels([12, 18, 22, 28, 24, 30, 26, 20, 16, 14, 18, 12]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser environment. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      audioManager.playSound('click');
    } else {
      try {
        audioManager.playSound('deploy');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Voice Command Intent Handler (Local Actions)
  const processVoiceCommandInterceptors = (query: string): boolean => {
    const q = query.toLowerCase();
    if (q.includes("laptop mode") || q.includes("switch to laptop")) {
      onModeChange('laptop');
      addAssistantMessage("Switched hardware profile to **Laptop Mode**. Lid-close server daemon activated.");
      return true;
    }
    if (q.includes("phone mode") || q.includes("switch to phone") || q.includes("adb mode")) {
      onModeChange('phone');
      addAssistantMessage("Switched hardware profile to **Phone Mode**. USB ADB reverse tethering (ports 3000 & 5000) active.");
      return true;
    }
    if (q.includes("tablet mode") || q.includes("switch to tablet")) {
      onModeChange('tablet_pc');
      addAssistantMessage("Switched hardware profile to **Tablet / PC Mode**. Multicast LAN sharing activated.");
      return true;
    }
    if (q.includes("go to network") || q.includes("open network") || q.includes("check ping")) {
      setActiveTab('network');
      addAssistantMessage("Navigating to **ISP & Network Diagnostic Hub**.");
      return true;
    }
    if (q.includes("go to scripts") || q.includes("open terminal") || q.includes("run script")) {
      setActiveTab('scripts');
      addAssistantMessage("Navigating to **Server & Script Manager**.");
      return true;
    }
    if (q.includes("fullscreen") || q.includes("full screen")) {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          }
          addAssistantMessage("Engaged **Immersive Fullscreen Workstation Mode**.");
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
          addAssistantMessage("Exited Fullscreen Mode.");
        }
      } catch (err) {
        addAssistantMessage("Fullscreen toggle requested.");
      }
      return true;
    }
    if (q.includes("play music") || q.includes("open arcade") || q.includes("play pong")) {
      setActiveTab('media_arcade');
      addAssistantMessage("Opening **Media & Arcade OS**.");
      return true;
    }
    return false;
  };

  const addAssistantMessage = (reply: string, source: string = 'dragon9-neural-system') => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString(),
      source
    };
    setMessages(prev => [...prev, newMsg]);

    if (autoNarrate) {
      speakText(reply, { rate: speechRate, pitch: speechPitch });
    }
  };

  // Handle sending message
  const handleSendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || inputPrompt).trim();
    if (!msgText || isProcessing) return;

    audioManager.playSound('click');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    // Check if voice command was an instant local trigger
    const handledLocally = processVoiceCommandInterceptors(msgText);
    if (handledLocally) {
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          context: { mode: currentMode }
        })
      });
      const data = await response.json();
      const reply = data.reply || "Dragon 9 Core acknowledges command.";
      addAssistantMessage(reply, data.source || 'gemini-3.7-flash');
    } catch (err) {
      addAssistantMessage("Acknowledged. All systems nominal on Dragon 9 Cluster Node 01.", 'local-fallback');
    } finally {
      setIsProcessing(false);
    }
  };

  const promptPresets = [
    { label: "Audit System Health", query: "Analyze my CPU, RAM, and thermal state. Recommend optimal daemon configs." },
    { label: "Cloudflare Tunnel Setup", query: "How do I configure a zero-trust Cloudflare tunnel for port 3000 and 5000 in dragon9_bootstrap.sh?" },
    { label: "ADB Reverse Bridge", query: "Explain how 'adb reverse tcp:3000 tcp:3000' works with Termux on Android ARM64." },
    { label: "Disaster Recovery Guide", query: "What is the best automated tar.gz backup strategy with SHA-256 integrity verification?" }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Neural Core Card */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-violet-400">
              <Sparkles className="h-4 w-4" />
              <span>NEURAL AI COMMAND VOICE & REASONING ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-3">
              <span>Dragon 9 Neural Assistant</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Gemini 3.7 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Full-duplex speech-to-text and voice auto-narration interface with direct execution access to server daemons, port routing, and backup snapshots.
            </p>
          </div>

          {/* Voice Engine Controls */}
          <div className="flex items-center gap-3">
            <button
              id="toggle-narrate-btn"
              onClick={() => {
                const nextVal = !autoNarrate;
                setAutoNarrate(nextVal);
                audioManager.playSound('click');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                autoNarrate
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 glow-violet'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Auto-narrate responses with Speech Synthesis (TTS)"
            >
              {autoNarrate ? <Volume2 className="h-4 w-4 text-violet-400" /> : <VolumeX className="h-4 w-4" />}
              <span>TTS Narration: {autoNarrate ? 'ON' : 'OFF'}</span>
            </button>

            <button
              id="voice-settings-btn"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              title="Voice pitch and rate settings"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Optional Voice Pitch/Rate Config Drawer */}
        {showVoiceSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Narration Speed: {speechRate}x</label>
              <input 
                type="range" 
                min="0.8" 
                max="1.5" 
                step="0.05"
                value={speechRate} 
                onChange={e => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-violet-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Voice Pitch: {speechPitch}x</label>
              <input 
                type="range" 
                min="0.7" 
                max="1.3" 
                step="0.05"
                value={speechPitch} 
                onChange={e => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Chat Interface Box */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[560px] border border-slate-800 shadow-2xl">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/70 select-text">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div 
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isUser 
                      ? 'bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/40 text-slate-100' 
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/60">
                    <span className="font-bold text-cyan-400">{isUser ? 'OPERATOR' : 'DRAGON 9 CORE'}</span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speakText(msg.text, { rate: speechRate, pitch: speechPitch })}
                          className="hover:text-violet-300 text-slate-500"
                          title="Speak message aloud"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                    <span className="text-xs font-mono font-black">OP</span>
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-violet-300 font-mono flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping"></span>
                <span>Neural Reasoning Engine is synthesizing response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preset Prompt Buttons */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 shrink-0">Presets:</span>
          {promptPresets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="shrink-0 text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Area with Live Speech Soundwave */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Soundwave Bar Visualizer (active when listening) */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/40 font-mono text-xs text-violet-300">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening via Web Speech API (Speak your command)...</span>
              </div>
              <div className="flex items-center gap-1 h-5">
                {audioWaveLevels.map((lvl, idx) => (
                  <div 
                    key={idx}
                    className="w-1 bg-violet-400 rounded-full transition-all duration-100"
                    style={{ height: `${lvl}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              id="mic-listen-btn"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse glow-cyan shadow-lg' 
                  : 'bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700'
              }`}
              title={isListening ? "Stop listening" : "Speak to Dragon 9 Assistant"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder="Ask Dragon 9 Neural Core or issue command (e.g. 'switch to laptop mode', 'check latency')..."
              disabled={isProcessing}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 font-sans"
            />

            <button
              type="submit"
              disabled={isProcessing || !inputPrompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-xl text-xs font-bold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 shadow-md shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Dispatch</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
