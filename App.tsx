
import React, { useState, useEffect } from 'react';
import LiveTab from './components/LiveTab';
import ChatTab from './components/ChatTab';
import ActivitiesTab from './components/ActivitiesTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import TabNavigator from './components/TabNavigator';
import SplashScreen from './components/SplashScreen';
import { Tab } from './types';
import { useAppContext } from './contexts/AppContext';

const App: React.FC = () => {
  const { theme } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [appState, setAppState] = useState<'splash' | 'main'>('splash');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState('main');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (appState === 'splash') {
    return <SplashScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return <LiveTab />;
      case 'chat':
        return <ChatTab />;
      case 'activities':
        return <ActivitiesTab />;
      case 'stats':
        return <StatsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <LiveTab />;
    }
  };

  return (
    <div key={theme} className="h-screen w-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 dark:from-slate-900 dark:via-indigo-900 dark:to-gray-900 font-sans flex flex-col overflow-hidden transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {renderContent()}
      </main>
      <TabNavigator activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
