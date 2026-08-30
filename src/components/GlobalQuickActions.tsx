import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  X, 
  RefreshCw, 
  Trash2, 
  Moon, 
  Sun,
  Smartphone
} from 'lucide-react';
import { audioManager } from '../utils/audioSynth';

export const GlobalQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNightShift, setIsNightShift] = useState(false);
  const [isRestartingAdb, setIsRestartingAdb] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const toggleMenu = () => {
    audioManager.playSound('click');
    setIsOpen(!isOpen);
  };

  const handleRestartAdb = () => {
    audioManager.playSound('deploy');
    setIsRestartingAdb(true);
    setTimeout(() => {
      setIsRestartingAdb(false);
      audioManager.playSound('score');
      setIsOpen(false);
    }, 1500);
  };

  const handleClearCache = () => {
    audioManager.playSound('alert');
    setIsClearingCache(true);
    setTimeout(() => {
      setIsClearingCache(false);
      audioManager.playSound('click');
      setIsOpen(false);
    }, 1000);
  };

  const handleToggleNightShift = () => {
    audioManager.playSound('click');
    setIsNightShift(!isNightShift);
    setIsOpen(false);
  };

  return (
    <>
      {/* Night Shift Global Overlay */}
      {isNightShift && (
        <div 
          className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-1000"
          style={{ 
            backgroundColor: 'rgba(255, 140, 0, 0.12)', 
            mixBlendMode: 'multiply',
            backdropFilter: 'sepia(20%) hue-rotate(-10deg)'
          }} 
        />
      )}

      {/* Floating Action Button Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {/* Expanded Menu Actions */}
        <div 
          className={`flex flex-col gap-3 transition-all duration-300 origin-bottom right-0 ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Action: Toggle Night Shift */}
          <button 
            onClick={handleToggleNightShift} 
            className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs font-bold transition-all group w-48 justify-between"
          >
            <span>{isNightShift ? 'Disable Night Shift' : 'Enable Night Shift'}</span>
            {isNightShift ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          {/* Action: Clear Cache */}
          <button 
            onClick={handleClearCache} 
            disabled={isClearingCache}
            className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs font-bold transition-all group w-48 justify-between disabled:opacity-50"
          >
            <span>Clear System Cache</span>
            <Trash2 className={`h-4 w-4 text-rose-400 ${isClearingCache ? 'animate-bounce' : ''}`} />
          </button>

          {/* Action: Restart ADB Server */}
          <button 
            onClick={handleRestartAdb} 
            disabled={isRestartingAdb}
            className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl hover:bg-slate-800 hover:border-slate-600 text-slate-200 text-xs font-bold transition-all group w-48 justify-between disabled:opacity-50"
          >
            <span>Restart ADB Server</span>
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${isRestartingAdb ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Floating Action Button */}
        <button 
          onClick={toggleMenu} 
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 ${
            isOpen 
              ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white' 
              : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-cyan-500/30 hover:shadow-cyan-500/40 glow-cyan'
          }`}
          title="Global Quick Actions"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6 fill-current" />}
        </button>
      </div>
    </>
  );
};
