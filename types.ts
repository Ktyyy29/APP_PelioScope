
import React from 'react';

export type Emotion = 'Happy' | 'Sad' | 'Angry' | 'Mad' | 'Surprised' | 'Fear' | 'Neutral' | 'Disgust';

export const SUPPORTED_EMOTIONS: Emotion[] = ['Happy', 'Sad', 'Angry', 'Mad', 'Surprised', 'Fear', 'Neutral', 'Disgust'];

export interface EmotionData {
  emoji: string;
  color: string;
  pulseColor: string;
}

export type ActivityName = 'Mood Boost' | 'Give Gift' | 'Play Music' | 'Exercise' | 'Meditate' | 'Tell Story' | 'Bath Time' | 'Feeding';

export interface Activity {
  name: ActivityName;
  icon: (props: React.ComponentProps<'svg'>) => React.ReactElement;
  color: string;
  duration: number; // in seconds
  reward: number; // Drachma reward
}

export interface ActivityLog {
  id: string;
  activityName: ActivityName;
  completedAt: number; // timestamp
}

export interface EmotionLog {
    id: string;
    emotion: Emotion;
    detectedAt: number; // timestamp
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'companion';
  timestamp: number;
}

export type Tab = 'live' | 'chat' | 'activities' | 'stats' | 'settings';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// --- SHARED TYPES ---
export type Theme = 'light' | 'dark';

// --- SHOP TYPES ---
export type ItemCategory = 'hat' | 'clothes' | 'food';

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  icon: string; // Emoji or SVG path identifier
  description?: string;
}

export interface EquippedItems {
  hat: string | null;
  clothes: string | null;
}
