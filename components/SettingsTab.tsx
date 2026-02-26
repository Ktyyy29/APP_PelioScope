
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ConnectionStatus } from '../types';

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const statusConfig = useMemo(() => {
        switch (status) {
            case 'connected': return { text: 'Connected', color: 'text-green-600 dark:text-green-400' };
            case 'connecting': return { text: 'Connecting...', color: 'text-yellow-600 dark:text-yellow-400' };
            case 'error': return { text: 'Blocked', color: 'text-red-600 dark:text-red-400' };
            default: return { text: 'Disconnected', color: 'text-gray-500 dark:text-gray-400' };
        }
    }, [status]);

    return <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.text}</span>;
};

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useAppContext();
    const isDark = theme === 'dark';
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Dark Mode</span>
            <button
                onClick={toggleTheme}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
        </div>
    );
};

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative text-center transform transition-all scale-100">
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="font-bold text-2xl text-indigo-600 dark:text-indigo-400 mb-6">About PelioScope 🌟</h2>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Why PelioScope?</h3>
                        <p className="flex flex-col items-center justify-center gap-1">
                            <span className="font-bold text-indigo-500">Pelio</span> 
                            <span>Greek god of emotions</span>
                        </p>
                        <p className="flex items-center justify-center gap-2 mt-2">
                            <span className="font-bold text-indigo-500">Scope</span> 
                            <span>→ To see or observe</span>
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium">Created by PelioScope Team</p>
                        <p className="text-xs text-gray-500 mt-1 italic">"Understand emotions, one interaction at a time."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsTab: React.FC = () => {
  const {
    companionName,
    setCompanionName,
    userName,
    setUserName,
    clearHistory,
    emotionHistory,
    activityHistory,
    connectionStatus,
    connectionError
  } = useAppContext();

  const [localCompanionName, setLocalCompanionName] = useState(companionName);
  const [localUserName, setLocalUserName] = useState(userName);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    setLocalCompanionName(companionName);
  }, [companionName]);

  useEffect(() => {
    setLocalUserName(userName);
  }, [userName]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSaveSettings = () => {
      setCompanionName(localCompanionName);
      setUserName(localUserName);
      setToastMessage("Settings Saved!");
  }

  const handleClearData = () => {
    if (isConfirmingClear) {
        clearHistory();
        setToastMessage("History Cleared!");
        setIsConfirmingClear(false);
    } else {
        setIsConfirmingClear(true);
        setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };
  
  return (
    <div className="p-4 space-y-6 pb-24">
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold animate-fadeInUp z-50 whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300">Appearance</h2>
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300">Profile</h2>
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-600 dark:text-gray-300">User Name</label>
          <input
            type="text"
            id="userName"
            value={localUserName}
            placeholder="eg. Zeus"
            onChange={(e) => setLocalUserName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm placeholder:text-gray-400 placeholder:italic"
          />
        </div>
        <div>
          <label htmlFor="companionName" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Companion Name</label>
          <input
            type="text"
            id="companionName"
            value={localCompanionName}
            placeholder="eg. Peli"
            onChange={(e) => setLocalCompanionName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm placeholder:text-gray-400 placeholder:italic"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300">Sync Settings</h2>
         <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sync Link:</span>
            <StatusIndicator status={connectionStatus} />
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
            Azure Web Service Link Active
        </p>
         {connectionStatus === 'error' && connectionError && (
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <p className="text-xs text-red-600 dark:text-red-400 font-mono italic">Sync issue detected. See Live tab for help.</p>
            </div>
        )}
      </div>

       <button onClick={handleSaveSettings} className="w-full bg-indigo-500 text-white font-black py-4 px-4 rounded-2xl shadow-lg hover:bg-indigo-600 active:scale-95 transition-all uppercase tracking-widest text-sm">
            Save Settings
        </button>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md space-y-4">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300">Data Management</h2>
        <button
          onClick={handleClearData}
          className={`w-full font-bold py-3 px-4 rounded-xl transition-colors duration-200 ${
            isConfirmingClear 
              ? 'bg-red-700 text-white' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {isConfirmingClear ? 'Confirm Clear?' : 'Clear History'}
        </button>
      </div>

      <button 
        onClick={() => setShowAbout(true)}
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            <div className="text-left">
                <h2 className="font-bold text-gray-800 dark:text-gray-100">About PelioScope</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">v2.5.0 (WebSocket)</p>
            </div>
        </div>
        <span className="text-gray-400">➔</span>
      </button>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default SettingsTab;
