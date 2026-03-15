
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';

import useLocalStorage from '../hooks/useLocalStorage';
import {
  Emotion,
  ActivityLog,
  EmotionLog,
  ConnectionStatus,
  SUPPORTED_EMOTIONS,
  EquippedItems,
} from '../types';
import { SHOP_ITEMS } from '../constants';

type Theme = 'light' | 'dark';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface AppContextType {
  companionName: string;
  setCompanionName: (name: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  userPin: string;
  setUserPin: (pin: string) => void;
  userCountry: string;
  setUserCountry: (country: string) => void;

  // Decoupled Emotion States
  currentEmotion: Emotion; // For Chat/Manual
  setCurrentEmotion: (emo: Emotion) => void;
  azureEmotion: Emotion;   // Strictly for Live Remote Feed
  setAzureEmotion: (emo: Emotion) => void;
  
  currentConfidence: number | null;
  setCurrentConfidence: (conf: number | null) => void;
  lastUpdate: number | null;

  emotionHistory: EmotionLog[];
  setEmotionHistory: React.Dispatch<React.SetStateAction<EmotionLog[]>>;
  activityHistory: ActivityLog[];
  addActivityLog: (activityName: ActivityLog['activityName']) => void;
  clearHistory: () => void;

  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  retryConnection: () => void;
  toggleSystemState: (state: 'start' | 'stop') => void;
  updateFirebaseEmotion: (label: string, confidence: number) => Promise<void>;
  isSystemRunning: boolean;
  isDemoMode: boolean;
  setIsDemoMode: (mode: boolean) => void;

  theme: Theme;
  toggleTheme: () => void;

  lastShowerTime: number;
  setLastShowerTime: (time: number) => void;
  isPeliDirty: boolean;

  lastFedTime: number;
  setLastFedTime: (time: number) => void;
  isPeliHungry: boolean;
  hungerLevel: number;

  drachma: number;
  earnDrachma: (amount: number) => void;
  spendDrachma: (amount: number) => boolean;
  inventory: string[];
  equippedItems: EquippedItems;
  buyItem: (itemId: string, price: number) => boolean;
  equipItem: (category: keyof EquippedItems, itemId: string | null) => void;
  consumeItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companionName, setCompanionName] = useLocalStorage('companionName', 'PELI');
  const [userName, setUserName] = useUserName(); 
  const [userPin, setUserPin] = useLocalStorage('userPin', '');
  const [userCountry, setUserCountry] = useLocalStorage('userCountry', 'Philippines');
  const [activityHistory, setActivityHistory] = useLocalStorage<ActivityLog[]>('activityHistory', []);
  const [emotionHistory, setEmotionHistory] = useLocalStorage<EmotionLog[]>('emotionHistory', []);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [lastShowerTime, setLastShowerTime] = useLocalStorage<number>('lastShowerTime', 0);
  const [lastFedTime, setLastFedTime] = useLocalStorage<number>('lastFedTime', 0);
  const [drachma, setDrachma] = useLocalStorage<number>('drachma', 250);
  const [inventory, setInventory] = useLocalStorage<string[]>('inventory', []);
  const [equippedItems, setEquippedItems] = useLocalStorage<EquippedItems>('equippedItems', {
    hat: null,
    clothes: null,
  });

  // Decoupled states
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('Happy'); 
  const [azureEmotion, setAzureEmotion] = useState<Emotion>('Neutral');  
  const lastEmotionRef = useRef<Emotion | null>(null);
  
  const [currentConfidence, setCurrentConfidence] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset lastEmotionRef when system stops so the next start gets a fresh timestamp
  useEffect(() => {
    if (!isSystemRunning) {
      lastEmotionRef.current = null;
    }
  }, [isSystemRunning]);

  const isPeliDirty = useMemo(() => Date.now() - lastShowerTime > 3 * 60 * 60 * 1000, [lastShowerTime]);
  const isPeliHungry = useMemo(() => Date.now() - lastFedTime > 30 * 60 * 1000, [lastFedTime]);
  const hungerLevel = useMemo(() => {
    const window = 30 * 60 * 1000;
    const elapsed = Date.now() - lastFedTime;
    return Math.max(0, Math.min(100, 100 - (elapsed / window) * 100));
  }, [lastFedTime]);

  useEffect(() => {
    const root = document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => (t === 'light' ? 'dark' : 'light')), [setTheme]);

  // Simulation Logic for Demo Mode
  useEffect(() => {
    if (!isDemoMode || !isSystemRunning) return;

    const interval = setInterval(() => {
      const emotions: Emotion[] = ['Happy', 'Sad', 'Angry', 'Shocked', 'Neutral', 'Disgust'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      // Stay on the same emotion for a LONG time to test the "1 min ago" logic
      // 95% chance to stay on the same emotion
      if (lastEmotionRef.current && Math.random() < 0.95) {
        return;
      }

      if (randomEmotion !== lastEmotionRef.current) {
        setAzureEmotion(randomEmotion);
        setLastUpdate(Date.now());
        lastEmotionRef.current = randomEmotion;
        
        setEmotionHistory(prev => {
          if (prev.length === 0 || prev[0].emotion !== randomEmotion) {
            return [{ id: Date.now().toString(), emotion: randomEmotion, detectedAt: Date.now() }, ...prev].slice(0, 100);
          }
          return prev;
        });
      }
      
      setCurrentConfidence(0.7 + Math.random() * 0.25);
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, [isDemoMode, isSystemRunning, setEmotionHistory]);

  // Firebase Realtime Database Listener - NEW PATH: live_monitoring/current
  useEffect(() => {
    if (isDemoMode) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    // Path updated to match provided structure
    const emotionRef = ref(db, 'live_monitoring/current');
    
    const unsubscribe = onValue(emotionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setConnectionStatus('connected');
        setConnectionError(null);

        // Update detection state mapping to 'emotion' and 'last_updated' keys
        const rawLabel = data.emotion || data.label;
        if (rawLabel) {
          const normalized = String(rawLabel).toLowerCase();
          const synonymMap: Record<string, Emotion> = {
            happy: 'Happy', sad: 'Sad', angry: 'Angry', mad: 'Angry', 
            shocked: 'Shocked', fear: 'Shocked', disgust: 'Disgust', neutral: 'Neutral'
          };
          const matchedEmotion = synonymMap[normalized] || SUPPORTED_EMOTIONS.find(e => e.toLowerCase() === normalized);
          
          if (matchedEmotion) {
            // Only update lastUpdate if the emotion has actually changed
            if (matchedEmotion !== lastEmotionRef.current) {
              setAzureEmotion(matchedEmotion);
              
              // Force numeric conversion and validate timestamp sanity (must be after year 2001)
              const rawTs = data.last_updated || data.timestamp || Date.now();
              const numericTs = Number(rawTs);
              const validTs = (numericTs > 1000000000) ? numericTs : Date.now();
              
              setLastUpdate(validTs);
              lastEmotionRef.current = matchedEmotion;
            }
            
            setCurrentConfidence(data.confidence ?? null);
            
            setEmotionHistory(prev => {
              if (prev.length === 0 || prev[0].emotion !== matchedEmotion) {
                return [{ id: Date.now().toString(), emotion: matchedEmotion, detectedAt: Date.now() }, ...prev].slice(0, 100);
              }
              return prev;
            });
          }
        }

        // Sync system status
        if (data.systemStatus !== undefined) {
          setIsSystemRunning(data.systemStatus === 'active');
        } else {
            // If systemStatus isn't explicitly in this node, we assume it's running if we are getting data
            setIsSystemRunning(true);
        }
      } else {
        setConnectionStatus('connected');
        setIsSystemRunning(false);
      }
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setConnectionStatus('error');
      setConnectionError('Database Link Failed');
    });

    return () => unsubscribe();
  }, [isDemoMode, setEmotionHistory]);

  const retryConnection = useCallback(() => {
    setIsDemoMode(false);
  }, [setIsDemoMode]);

  const toggleSystemState = useCallback(async (state: 'start' | 'stop') => {
    if (isDemoMode) {
      setIsSystemRunning(state === 'start');
      if (state === 'start') {
        setLastUpdate(Date.now());
        lastEmotionRef.current = null; // Reset to allow first detection to set its own time if needed
      }
      return;
    }
    try {
      const systemRef = ref(db, 'live_monitoring/current');
      if (state === 'start') {
        setLastUpdate(Date.now());
        lastEmotionRef.current = null;
      }
      await update(systemRef, { 
        systemStatus: state === 'start' ? 'active' : 'idle',
        last_request: Date.now()
      });
    } catch (e) {
      console.error("Failed to update system state", e);
    }
  }, [isDemoMode]);

  const updateFirebaseEmotion = useCallback(async (label: string, confidence: number) => {
    if (isDemoMode) return;
    try {
      const emotionRef = ref(db, 'live_monitoring/current');
      await update(emotionRef, {
        emotion: label,
        confidence,
        last_updated: Date.now()
      });
    } catch (e) {
      console.error("Failed to push emotion", e);
    }
  }, [isDemoMode]);

  const earnDrachma = useCallback((amount: number) => setDrachma(d => d + amount), [setDrachma]);
  const spendDrachma = useCallback((amount: number) => {
    if (drachma >= amount) {
      setDrachma(d => d - amount);
      return true;
    }
    return false;
  }, [drachma, setDrachma]);

  const buyItem = useCallback((itemId: string, price: number) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (item?.category !== 'food' && inventory.includes(itemId)) return true;
    if (drachma < price) return false;
    setDrachma(d => d - price);
    setInventory(inv => [...inv, itemId]);
    return true;
  }, [drachma, inventory, setDrachma, setInventory]);

  const consumeItem = useCallback((itemId: string) => {
    setInventory(inv => {
      const idx = inv.indexOf(itemId);
      if (idx === -1) return inv;
      const copy = [...inv];
      copy.splice(idx, 1);
      return copy;
    });
  }, [setInventory]);

  const equipItem = useCallback((category: keyof EquippedItems, itemId: string | null) => {
    setEquippedItems(prev => ({ ...prev, [category]: itemId }));
  }, [setEquippedItems]);

  const addActivityLog = useCallback((activityName: ActivityLog['activityName']) => {
    setActivityHistory(prev => [{ id: Date.now().toString(), activityName, completedAt: Date.now() }, ...prev]);
  }, [setActivityHistory]);

  const clearHistory = useCallback(() => {
    setActivityHistory([]);
    setEmotionHistory([]);
  }, [setActivityHistory, setEmotionHistory]);

  const value: AppContextType = {
    companionName, setCompanionName, userName, setUserName, userPin, setUserPin,
    userCountry, setUserCountry,
    currentEmotion, setCurrentEmotion, azureEmotion, setAzureEmotion,
    currentConfidence, setCurrentConfidence,
    lastUpdate, emotionHistory, setEmotionHistory, activityHistory,
    addActivityLog, clearHistory, connectionStatus, connectionError, retryConnection,
    toggleSystemState, updateFirebaseEmotion, isSystemRunning, isDemoMode, setIsDemoMode, theme, toggleTheme,
    lastShowerTime, setLastShowerTime, isPeliDirty, lastFedTime, setLastFedTime,
    isPeliHungry, hungerLevel, drachma, earnDrachma, spendDrachma, inventory,
    equippedItems, buyItem, equipItem, consumeItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

function useUserName() {
    return useLocalStorage('userName', '');
}

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
