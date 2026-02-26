
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { userName, setUserName, userPin, setUserPin } = useAppContext();
  
  // Local state for inputs
  const [inputName, setInputName] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState('');

  // Initial setup: Determine if we are creating a profile for the first time
  useEffect(() => {
    if (!userName) {
      setIsFirstTime(true);
    } else {
      setInputName(userName);
      setIsFirstTime(false);
    }
  }, [userName]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (inputPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (isFirstTime || isSwitching) {
      // Setup or update profile
      setUserName(inputName.trim());
      setUserPin(inputPin);
      onLoginSuccess();
    } else {
      // Standard login verification
      if (inputName.trim().toLowerCase() === userName.toLowerCase() && inputPin === userPin) {
        onLoginSuccess();
      } else {
         setError('Incorrect Name or PIN');
      }
    }
  };

  const handleSwitchUser = () => {
    setIsSwitching(true);
    setInputName('');
    setInputPin('');
    setError('');
  };

  const isSetupMode = isFirstTime || isSwitching;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-slate-900 dark:via-indigo-900 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden scrollbar-hide">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fadeInUp border border-white/20 relative z-10">
        
        {/* Header Character Icon */}
        <div className="flex justify-center -mt-20 mb-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-3xl shadow-xl flex items-center justify-center text-5xl animate-bounce">
                {isSetupMode ? '👋' : '🔒'}
            </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
            {isSetupMode ? 'Create Profile' : `Hi, ${userName}!`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {isSetupMode 
                ? 'Welcome to PelioScope! Choose a name and 4-digit PIN.' 
                : 'Enter your 4-digit PIN to unlock your companion.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 ml-1">
              Your Name
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              disabled={!isSetupMode}
              className={`w-full px-5 py-4 rounded-2xl border transition-all duration-300 outline-none ${
                !isSetupMode 
                  ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-400 border-transparent cursor-not-allowed font-bold' 
                  : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm'
              }`}
              placeholder="e.g. Alex"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 ml-1">
              4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all tracking-[0.8em] text-center text-2xl font-black shadow-sm"
              placeholder="••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs rounded-2xl text-center font-bold animate-fadeIn border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                {isSetupMode ? 'Begin Journey 🚀' : 'Unlock PelioScope'}
              </button>
          </div>
        </form>

        {!isFirstTime && (
            <div className="mt-8 text-center">
                <button 
                    onClick={isSwitching ? () => setIsSwitching(false) : handleSwitchUser}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors py-2 px-4 rounded-full"
                >
                    {isSwitching ? 'Cancel' : 'Not you? Switch User'}
                </button>
            </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400/60 dark:text-gray-500/60">
             Encrypted & Local
          </p>
      </div>
    </div>
  );
};

export default LoginScreen;
