
import React from 'react';
import { Tab } from '../types';
import { HomeIcon, ChatBubbleIcon, PuzzlePieceIcon, ChartBarIcon, CogIcon } from './Icons';

interface TabNavigatorProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-indigo-500 dark:text-indigo-400';
  const inactiveClasses = 'text-gray-400 hover:text-indigo-400 dark:text-gray-500 dark:hover:text-indigo-400';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className={`text-xs font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'live', label: 'Live', icon: <HomeIcon className="w-7 h-7" /> },
    { id: 'chat', label: 'Chat', icon: <ChatBubbleIcon className="w-7 h-7" /> },
    { id: 'activities', label: 'Activities', icon: <PuzzlePieceIcon className="w-7 h-7" /> },
    { id: 'stats', label: 'Stats', icon: <ChartBarIcon className="w-7 h-7" /> },
    { id: 'settings', label: 'Settings', icon: <CogIcon className="w-7 h-7" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center z-50 border-t border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => (
        <NavItem
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        />
      ))}
    </nav>
  );
};

export default TabNavigator;