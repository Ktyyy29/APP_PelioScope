
import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EMOTION_DETAILS } from '../constants';

const LiveTab: React.FC = () => {
  const { 
    azureEmotion, // This is now fed strictly by Firebase via AppContext
    isSystemRunning,
    toggleSystemState,
    currentConfidence,
    connectionStatus,
    connectionError,
    lastUpdate
  } = useAppContext();

  // -------------------------------
  // IDLE DISPLAY
  // -------------------------------
  const idleDetails = {
    emoji: '😴',
    color: 'text-indigo-500 dark:text-indigo-400',
    pulseColor: '#6366f1'
  };

  const getEmotionDetails = () => {
    if (!isSystemRunning) return idleDetails;
    return EMOTION_DETAILS[azureEmotion] || idleDetails;
  };

  const emotionDetails = getEmotionDetails();

  // -------------------------------
  // STATUS UI HELPERS
  // -------------------------------
  const getStatusLabel = () => {
    if (!isSystemRunning) return 'System Idle';
    if (connectionStatus === 'connecting') return 'Syncing...';
    if (connectionStatus === 'error') return 'Link Error';
    return 'Live Feed Active';
  };

  const getStatusTextColor = () => {
    if (!isSystemRunning) return 'text-slate-500 dark:text-slate-400';
    if (connectionStatus === 'error') return 'text-rose-500 font-bold animate-pulse';
    if (connectionStatus === 'connecting') return 'text-indigo-600 dark:text-indigo-400';
    return 'text-emerald-600 dark:text-emerald-400 font-black';
  };

  return (
    <div className="flex flex-col items-center justify-between h-full overflow-hidden relative">
      {/* Header */}
      <div className="w-full px-6 py-6 flex items-center justify-between z-10">
        <div>
          <h1 className="text-sm font-black uppercase italic tracking-tighter">
            <span className="text-slate-900 dark:text-slate-100">Pelio</span>
            <span className="text-indigo-600 dark:text-indigo-400">Scope</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Firebase Realtime Link
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isSystemRunning
                ? connectionStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span className={`text-[9px] font-black uppercase tracking-widest ${getStatusTextColor()}`}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Main Emoji Display */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
          .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>
        
        <div
          className={`text-[140px] transition-all duration-700 transform ${
            isSystemRunning ? 'animate-float scale-110' : 'opacity-30 grayscale scale-90'
          }`}
          style={{
            filter:
              isSystemRunning && emotionDetails.pulseColor
                ? `drop-shadow(0 0 45px ${emotionDetails.pulseColor})`
                : 'none'
          }}
        >
          {emotionDetails.emoji}
        </div>

        <div className="mt-4">
          <h2 className={`text-5xl font-black uppercase italic tracking-tighter transition-all duration-500 ${emotionDetails.color}`}>
            {isSystemRunning ? azureEmotion : 'Paused'}
          </h2>
          
          {isSystemRunning && (
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="px-4 py-1.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  {currentConfidence !== null ? `Accuracy: ${(currentConfidence * 100).toFixed(0)}%` : 'Awaiting Data...'}
                </span>
              </div>
              
              {lastUpdate && (
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  Last Update: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}

              {connectionStatus === 'error' && (
                <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mt-2 px-4 text-center">
                  Firebase Link Interrupted: {connectionError || 'Retry needed'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full max-w-sm px-6 pb-24 z-10">
        <button
          onClick={() => isSystemRunning ? toggleSystemState('stop') : toggleSystemState('start')}
          className={`group w-full py-5 rounded-[2.2rem] font-black text-lg text-white shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 ${
            isSystemRunning
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
          }`}
        >
          {isSystemRunning ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span>Disable Feed</span>
            </>
          ) : (
            <span>Enable Real-time Feed</span>
          )}
        </button>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-400/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-400/5 blur-[120px]" />
      </div>
    </div>
  );
};

export default LiveTab;
