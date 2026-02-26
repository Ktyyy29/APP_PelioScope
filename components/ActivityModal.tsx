
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Activity, Emotion, SUPPORTED_EMOTIONS } from '../types';
import { EMOTION_DETAILS, SHOP_ITEMS } from '../constants';
import { BrainIcon, LightningIcon, BeakerIcon, DrachmaIcon } from './Icons';
import { GoogleGenAI, Modality } from "@google/genai";

// --- HELPERS ---
const getSafeApiKey = () => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
  } catch (e) {
    return null;
  }
};

// --- AUDIO UTILITIES ---
function decodeBase64ToUint8(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Peli Character Component ---
interface PeliProps {
  emotion: string; 
  animationClass?: string;
  showParticles?: string | null; 
  customEyes?: string; 
  isGlowing?: boolean; 
  scale?: number; 
  accessories?: 'headphones' | null;
  isDirty?: boolean; 
  isWet?: boolean; 
  isHungry?: boolean; 
  bubbles?: boolean; 
}

export const PeliCharacter: React.FC<PeliProps> = ({ 
    emotion, 
    animationClass, 
    showParticles, 
    customEyes, 
    isGlowing, 
    scale = 1, 
    accessories = null,
    isDirty = false,
    isWet = false,
    isHungry = false,
    bubbles = false
}) => {
  const { equippedItems } = useAppContext();

  const traits = useMemo(() => {
    let color = '#FFE8C7'; 
    let eyes = 'normal'; 
    let mouth = 'smile'; 
    let eyebrows = 'neutral'; 

    const normEmo = emotion.toLowerCase();

    if (normEmo === 'happy' || normEmo === 'excited' || normEmo === 'proud' || normEmo === 'confident') {
      color = '#fcd34d'; 
      eyes = 'squint';
      mouth = 'open-smile';
      eyebrows = 'up';
    } else if (normEmo === 'sad' || normEmo === 'lonely') {
      color = '#93c5fd'; 
      eyes = 'sad';
      mouth = 'frown';
      eyebrows = 'sad';
    } else if (normEmo === 'angry' || normEmo === 'mad' || normEmo === 'tense') {
      color = '#f87171'; 
      eyes = 'angry';
      mouth = 'frown';
      eyebrows = 'angry';
    } else if (normEmo === 'fear' || normEmo === 'scared' || normEmo === 'nervous' || normEmo === 'worried') {
      color = '#a5b4fc'; 
      eyes = 'wide';
      mouth = 'wavy';
      eyebrows = 'up';
    } else if (normEmo === 'surprised' || normEmo === 'curious') {
      color = '#d8b4fe'; 
      eyes = 'wide';
      mouth = 'o-shape';
      eyebrows = 'up';
    } else if (normEmo === 'disgust') {
      color = '#84cc16'; 
      eyes = 'squint';
      mouth = 'wavy';
      eyebrows = 'angry';
    } else if (normEmo === 'love' || normEmo === 'grateful' || normEmo === 'relaxed' || normEmo === 'calm') {
      color = '#f472b6'; 
      eyes = 'happy-closed';
      mouth = 'smile';
      eyebrows = 'neutral';
    } else {
      color = '#FFE8C7'; 
      eyes = 'normal';
      mouth = 'smile';
      eyebrows = 'neutral';
    }

    if (customEyes) eyes = customEyes;

    return { color, eyes, mouth, eyebrows };
  }, [emotion, customEyes]);

  return (
    <div className={`relative w-full h-full shrink-0 flex items-center justify-center transition-all duration-500 ${animationClass}`}>
      {showParticles === 'hearts' && <div className="absolute inset-0 text-4xl animate-ping opacity-50 z-10 pointer-events-none">❤️</div>}
      {showParticles === 'stars' && <div className="absolute -top-4 -right-4 text-4xl animate-bounce z-10 pointer-events-none">⭐</div>}
      {showParticles === 'notes' && <div className="absolute -top-4 -left-4 text-4xl animate-pulse z-10 pointer-events-none">🎵</div>}
      {showParticles === 'bubbles' && <div className="absolute inset-0 text-2xl z-10 pointer-events-none overflow-hidden">
        <span className="absolute animate-bounce left-1/4 top-1/4">🫧</span>
        <span className="absolute animate-pulse right-1/4 bottom-1/4">🫧</span>
        <span className="absolute animate-ping left-1/2 bottom-1/2">🫧</span>
      </div>}

      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full transition-all duration-500 ease-in-out ${isGlowing ? 'drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] brightness-110' : 'drop-shadow-2xl'}`}
        style={{ transform: `scale(${scale})` }}
      >
        <path
          d="M40,160 Q20,100 40,40 Q100,0 160,40 Q180,100 160,160 Q100,190 40,160 Z"
          fill={traits.color}
          className="transition-colors duration-500 ease-in-out"
        />
        <ellipse cx="140" cy="60" rx="10" ry="5" fill="white" fillOpacity="0.4" transform="rotate(-45 140 60)" />
        
        {isDirty && (
          <g fill="#78350f" fillOpacity="0.6">
             <circle cx="60" cy="140" r="8" />
             <circle cx="150" cy="130" r="10" />
             <circle cx="100" cy="50" r="6" />
          </g>
        )}

        <g transform="translate(0, 10)">
           {traits.eyes === 'normal' && (
             <g>
               <ellipse cx="70" cy="80" rx="13" ry="15" fill="#1e293b" />
               <circle cx="75" cy="74" r="4.5" fill="white" />
             </g>
           )}
           {traits.eyes === 'wide' && (
             <g>
               <circle cx="70" cy="80" r="16" fill="white" stroke="#1e293b" strokeWidth="2.5" />
               <circle cx="70" cy="80" r="7" fill="#1e293b" />
             </g>
           )}
           {traits.eyes === 'squint' && <path d="M55,85 Q70,70 85,85" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'happy-closed' && <path d="M55,80 Q70,70 85,80" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'sad' && <path d="M55,75 Q70,85 85,75" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'angry' && (
             <g>
                <path d="M55,72 L85,82" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="70" cy="85" r="8" fill="#1e293b" />
             </g>
           )}
           
           {traits.eyes === 'normal' && (
             <g>
               <ellipse cx="130" cy="80" rx="13" ry="15" fill="#1e293b" />
               <circle cx="135" cy="74" r="4.5" fill="white" />
             </g>
           )}
           {traits.eyes === 'wide' && (
             <g>
                <circle cx="130" cy="80" r="16" fill="white" stroke="#1e293b" strokeWidth="2.5" />
                <circle cx="130" cy="80" r="7" fill="#1e293b" />
             </g>
           )}
           {traits.eyes === 'squint' && <path d="M115,85 Q130,70 145,85" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'happy-closed' && <path d="M115,80 Q130,70 145,80" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'sad' && <path d="M115,75 Q130,85 145,75" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.eyes === 'angry' && (
             <g>
                <path d="M115,82 L145,72" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="130" cy="85" r="8" fill="#1e293b" />
             </g>
           )}
        </g>

        {traits.eyebrows === 'angry' && <path d="M60,60 L90,70 M140,60 L110,70" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />}
        {traits.eyebrows === 'sad' && <path d="M60,65 Q75,60 90,65 M110,65 Q125,60 140,65" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {traits.eyebrows === 'up' && <path d="M60,55 Q75,45 90,55 M110,55 Q125,45 140,55" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />}
        
        <g transform="translate(100, 120)">
           {traits.mouth === 'smile' && <path d="M-25,0 Q0,15 25,0" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.mouth === 'open-smile' && <path d="M-25,-5 Q0,25 25,-5 Z" fill="white" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />}
           {traits.mouth === 'frown' && <path d="M-25,10 Q0,-10 25,10" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
           {traits.mouth === 'o-shape' && <circle cx="0" cy="5" r="10" fill="#1e293b" />}
           {traits.mouth === 'wavy' && <path d="M-25,5 Q-12,15 0,5 Q12,-5 25,5" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />}
        </g>

        {accessories === 'headphones' && (
          <g>
            <path d="M45,80 Q45,5 100,5 Q155,5 155,80" fill="none" stroke="#374151" strokeWidth="10" strokeLinecap="round" />
            <rect x="30" y="70" width="25" height="50" rx="8" fill="#4b5563" />
            <rect x="145" y="70" width="25" height="50" rx="8" fill="#4b5563" />
          </g>
        )}
      </svg>
    </div>
  );
};

// --- MOOD BOOST ---
const MoodBoost: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [bgIndex, setBgIndex] = useState(0);
  const touchStartX = useRef(0);
  const [peliEmotion, setPeliEmotion] = useState('Neutral');
  const [customEyes, setCustomEyes] = useState<string | undefined>(undefined);
  const [isGlowing, setIsGlowing] = useState(false);
  const [stickers, setStickers] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);
  const [progress, setProgress] = useState(0);
  const GOAL = 10;
  const gradients = ['from-yellow-400 to-orange-400', 'from-pink-400 to-rose-400', 'from-sky-400 to-indigo-400', 'from-emerald-300 to-teal-400'];

  const addInteraction = () => {
    const newProgress = Math.min(progress + 1, GOAL);
    setProgress(newProgress);
    if (newProgress === GOAL) { setTimeout(onComplete, 1500); }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      setBgIndex((prev) => (prev + (diff > 0 ? 1 : -1) + gradients.length) % gradients.length);
      setPeliEmotion('Excited'); setTimeout(() => setPeliEmotion('Neutral'), 1000);
      addInteraction();
    }
  };

  const handleBodyTap = (e: React.MouseEvent) => {
    e.stopPropagation(); setIsGlowing(true); setPeliEmotion('Love'); addInteraction();
    setTimeout(() => { setIsGlowing(false); setPeliEmotion('Neutral'); }, 1500);
  };
  const handleForeheadTap = (e: React.MouseEvent) => {
    e.stopPropagation(); setCustomEyes('happy-closed'); setPeliEmotion('Happy'); addInteraction();
    setTimeout(() => setCustomEyes(undefined), 200); setTimeout(() => setCustomEyes('happy-closed'), 400); setTimeout(() => { setCustomEyes(undefined); setPeliEmotion('Neutral'); }, 600);
  };
  const handleAddSticker = (icon: string) => {
    const id = Date.now(); setStickers((prev) => [...prev, { id, icon, x: Math.random() * 80 + 10, y: Math.random() * 40 + 15 }]);
    setPeliEmotion('Surprised'); setTimeout(() => setPeliEmotion('Neutral'), 1000); addInteraction();
    setTimeout(() => { setStickers((prev) => prev.filter((s) => s.id !== id)); }, 2000);
  };

  return (
    <div className={`absolute inset-0 w-full h-full flex flex-col transition-colors duration-700 bg-gradient-to-br ${gradients[bgIndex]} overflow-hidden`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <style>{` @keyframes floatUp { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { opacity: 1; transform: translateY(-20px) scale(1.2); } 100% { transform: translateY(-150px) scale(1); opacity: 0; } } .animate-float { animation: floatUp 2s ease-out forwards; } `}</style>
      <div className="absolute top-16 left-0 right-0 text-center z-10 px-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-md">Mood Boost</h2>
        <p className="text-white/90 text-sm mt-1">Tap, Swipe, or send Stickers!</p>
        <div className="w-32 h-2 bg-black/20 rounded-full mx-auto mt-3 overflow-hidden"><div className="h-full bg-white transition-all duration-500" style={{ width: `${(progress / GOAL) * 100}%` }} /></div>
      </div>
      {stickers.map((s) => (<div key={s.id} className="absolute text-5xl animate-float pointer-events-none z-20" style={{ left: `${s.x}%`, top: `${s.y}%` }}>{s.icon}</div>))}
      <div className="flex-grow flex items-center justify-center relative">
        <div className="relative transform scale-125">
          <div onClick={handleForeheadTap} className="absolute top-0 left-[20%] right-[20%] h-[40%] z-30 cursor-pointer rounded-t-full active:scale-95 transition-transform"></div>
          <div onClick={handleBodyTap} className="cursor-pointer active:scale-105 transition-transform"><div className="w-48 h-48"><PeliCharacter emotion={peliEmotion} customEyes={customEyes} isGlowing={isGlowing} /></div></div>
        </div>
      </div>
      <div className="h-24 bg-white/20 backdrop-blur-md flex items-center justify-center gap-6 pb-safe z-30 rounded-2xl mx-4 mb-24 shadow-lg transition-all duration-300">
          <button onClick={() => handleAddSticker('⭐')} className="text-4xl hover:scale-125 transition-transform active:scale-90 bg-white/30 p-3 rounded-full shadow-sm">⭐</button>
          <button onClick={() => handleAddSticker('🌸')} className="text-4xl hover:scale-125 transition-transform active:scale-90 bg-white/30 p-3 rounded-full shadow-sm">🌸</button>
          <button onClick={() => handleAddSticker('😊')} className="text-4xl hover:scale-125 transition-transform active:scale-90 bg-white/30 p-3 rounded-full shadow-sm">😊</button>
          <button onClick={() => handleAddSticker('💖')} className="text-4xl hover:scale-125 transition-transform active:scale-90 bg-white/30 p-3 rounded-full shadow-sm">💖</button>
      </div>
    </div>
  );
};

// --- GIVE GIFT ---
const GiveGift: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { userName, spendDrachma, drachma } = useAppContext();
  const [step, setStep] = useState<'selection' | 'interaction'>('selection');
  const [displayEmotion, setDisplayEmotion] = useState<string>('Neutral');
  const [interactionState, setInteractionState] = useState<'idle' | 'reacting'>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [animation, setAnimation] = useState('');
  const [particles, setParticles] = useState<string | null>(null);

  const emotionsToSelect: Emotion[] = ['Happy', 'Sad', 'Angry', 'Fear', 'Surprised', 'Neutral'];
  const handleSelectEmotion = (emotion: string) => {
    setDisplayEmotion(emotion); setStep('interaction');
    if (emotion === 'Happy') setAnimation('animate-bounce'); else if (emotion === 'Fear') setAnimation('animate-shake'); else if (emotion === 'Angry') setAnimation('animate-pulse'); else setAnimation('animate-pulse-slow');
    setFeedbackText(`PELI is feeling ${emotion}.`);
  };

  const gifts = [
    { id: 'star', label: 'Star', icon: '⭐', price: 15, bg: 'bg-yellow-400/20 border-yellow-400', action: () => triggerReaction('Proud', 'animate-bounce', 'stars', 'I feel like a star!', 15) },
    { id: 'hug', label: 'Hug', icon: '🤗', price: 0, bg: 'bg-pink-400/20 border-pink-400', action: () => triggerReaction('Love', 'animate-pulse', 'hearts', 'I feel so loved!', 0) },
    { id: 'highfive', label: 'High 5', icon: '✋', price: 0, bg: 'bg-green-400/20 border-green-400', action: () => triggerReaction('Excited', 'animate-bounce', 'notes', 'High five! Yeah!', 0) },
    { id: 'note', label: 'Note', icon: '💌', price: 5, bg: 'bg-purple-400/20 border-purple-400', action: () => triggerReaction('Grateful', 'animate-pulse', 'hearts', 'Thank you so much!', 5) },
  ];

  const triggerReaction = (emo: string, anim: string, part: string, text: string, cost: number) => {
    if (cost > 0 && !spendDrachma(cost)) {
       setFeedbackText("Need more Drachma!"); setAnimation('animate-shake'); setTimeout(() => setFeedbackText(`PELI is feeling ${displayEmotion}.`), 1500); return;
    }
    setInteractionState('reacting'); setDisplayEmotion(emo as any); setAnimation(anim); setParticles(part); setFeedbackText(text);
    setTimeout(() => { onComplete(); }, 3500);
  };

  if (step === 'selection') {
    return (
      <div className="flex flex-col w-full flex-grow items-center justify-center animate-fadeIn">
        <div className="flex justify-center mb-6"><div className="w-40 h-40 transform hover:scale-105 transition-transform"><PeliCharacter emotion="Neutral" /></div></div>
        <h2 className="text-2xl font-bold mb-8 shrink-0 text-center">How is {userName} feeling?</h2>
        <div className="grid grid-cols-2 gap-4 w-full pb-4">{emotionsToSelect.map((emo) => (<button key={emo} onClick={() => handleSelectEmotion(emo)} className="bg-white/20 hover:bg-white/40 border-2 border-white/30 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 transition-transform transform active:scale-95 shrink-0"><span className="text-5xl filter drop-shadow-md pb-2">{EMOTION_DETAILS[emo].emoji}</span><span className="font-bold text-xl">{emo}</span></button>))}</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center flex-grow justify-between py-4 animate-fadeIn">
      <div className="flex-grow flex flex-col items-center justify-center min-h-0 relative">
         <div className="transform scale-125 mb-6"><div className="w-48 h-48"><PeliCharacter emotion={displayEmotion} animationClass={animation} showParticles={particles} /></div></div>
         <div className="mt-6 p-4 bg-white/20 rounded-2xl backdrop-blur-sm min-h-[80px] flex items-center justify-center w-full max-w-xs shadow-lg"><p className="text-2xl font-bold text-center animate-fadeIn leading-tight">{feedbackText}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-4 shrink-0 pb-2">{gifts.map((gift) => (<button key={gift.id} disabled={interactionState === 'reacting'} onClick={gift.action} className={`${gift.bg} ${interactionState === 'reacting' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} border-2 rounded-2xl p-4 flex flex-col items-center justify-start gap-1 transition-all transform duration-200 bg-white/10 backdrop-blur-md shadow-md`}><div className="flex items-center gap-2"><span className="text-4xl filter drop-shadow-md">{gift.icon}</span><span className="font-bold text-xl">{gift.label}</span></div>{gift.price > 0 ? (<span className="text-xs bg-white/50 px-2 rounded-full font-bold flex items-center gap-1">{gift.price} <DrachmaIcon className="w-3 h-3" /></span>) : (<span className="text-xs bg-white/50 px-2 rounded-full font-bold">Free</span>)}</button>))}</div>
      <p className="mt-2 text-sm opacity-80 flex items-center gap-1">You have: {drachma} <DrachmaIcon className="w-4 h-4" /></p>
    </div>
  );
};

// --- BATH TIME ---
const BathTime: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { setLastShowerTime } = useAppContext();
    const [phase, setPhase] = useState<'lather'|'rinse'|'dry'>('lather');
    const [progress, setProgress] = useState(0); 
    const [peliState, setPeliState] = useState<{dirty: boolean, bubbles: boolean, wet: boolean}>({ dirty: true, bubbles: false, wet: false });

    const handleLatherMove = () => {
        if(phase !== 'lather') return;
        setProgress(p => Math.min(p + 2, 100));
        if(progress > 10) setPeliState(prev => ({...prev, bubbles: true}));
    };

    const handleRinseStart = () => {
        if(phase !== 'rinse') return;
        const interval = setInterval(() => {
            setProgress(p => {
                const next = Math.min(p + 5, 100);
                if(next > 20) setPeliState({ dirty: false, bubbles: false, wet: true }); 
                return next;
            });
        }, 100);
        (window as any).rinseInterval = interval;
    };
    const handleRinseEnd = () => clearInterval((window as any).rinseInterval);

    const handleDryMove = () => {
        if(phase !== 'dry') return;
        setProgress(p => {
            const next = Math.min(p + 2, 100);
            if(next > 50) setPeliState({ dirty: false, bubbles: false, wet: false }); 
            return next;
        });
    };

    useEffect(() => {
        if(progress >= 100) {
            setProgress(0);
            if(phase === 'lather') setPhase('rinse');
            else if(phase === 'rinse') setPhase('dry');
            else if(phase === 'dry') {
                setLastShowerTime(Date.now());
                onComplete();
            }
        }
    }, [progress, phase, onComplete, setLastShowerTime]);

    return (
        <div
            className="flex flex-col w-full h-full items-center justify-center animate-fadeIn select-none"
            onTouchMove={phase === 'lather' ? handleLatherMove : phase === 'dry' ? handleDryMove : undefined}
        >
            <h2 className="text-2xl font-bold mb-2">Bath Time 🛁</h2>
            <p className="mb-8 opacity-90 font-medium">
                {phase === 'lather' && "Rub screen to scrub!"}
                {phase === 'rinse' && "Hold button to rinse!"}
                {phase === 'dry' && "Rub screen to dry!"}
            </p>

            <div className="relative w-56 h-56 mb-8">
                <PeliCharacter emotion={phase === 'dry' && progress > 90 ? "Love" : "Neutral"} isDirty={peliState.dirty} bubbles={peliState.bubbles} isWet={peliState.wet} />

                {phase === 'rinse' && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl animate-bounce">🚿</div>
                )}
            </div>

            <div className="w-48 h-4 bg-black/20 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-white transition-all duration-200" style={{width: `${progress}%`}} />
            </div>

            {phase === 'rinse' && (
                <button
                    onMouseDown={handleRinseStart} onMouseUp={handleRinseEnd} onMouseLeave={handleRinseEnd}
                    onTouchStart={handleRinseStart} onTouchEnd={handleRinseEnd}
                    className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg active:scale-95 transition-transform"
                >
                    Hold to Rinse 💧
                </button>
            )}
        </div>
    );
};

// --- MUSIC PLAYER ---
const MusicPlayer: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    { title: "Ocean Calm", emotion: "Relaxed", color: "bg-blue-400", src: "https://assets.mixkit.co/active_storage/sfx/1196/1196-preview.mp3" },
    { title: "Forest Rain", emotion: "Peaceful", color: "bg-green-400", src: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3" },
    { title: "Soft Clouds", emotion: "Focus", color: "bg-indigo-400", src: "https://assets.mixkit.co/active_storage/sfx/1175/1175-preview.mp3" },
    { title: "Nature Sounds", emotion: "Nature", color: "bg-teal-400", src: "https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3" },
    { title: "Bird Sounds", emotion: "Bird", color: "bg-teal-400", src: "https://assets.mixkit.co/active_storage/sfx/2472/2472-preview.mp3" },
  ];

  useEffect(() => {
    audioRef.current = new Audio(tracks[currentTrack].src);
    audioRef.current.loop = true;

    const updateTime = () => setCurrentTime(audioRef.current?.currentTime || 0);
    const updateDuration = () => setDuration(audioRef.current?.duration || 0);

    audioRef.current.addEventListener('timeupdate', updateTime);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);

    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Autoplay prevented", e));
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (index: number) => {
    setIsPlaying(true);
    setCurrentTrack(index);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex flex-col items-center justify-between h-full w-full animate-fadeIn">
      <div className="w-full text-center mt-2">
        <h2 className="text-2xl font-bold">Music Player</h2>
        <p className="opacity-80 text-sm">Nature & Calm Vibes</p>
      </div>

      <div className="flex-grow flex items-center justify-center relative w-full">
         <div className={`absolute inset-0 flex items-center justify-center gap-2 opacity-30 ${isPlaying ? '' : 'hidden'}`}>
             {[...Array(5)].map((_, i) => (
                 <div key={i} className="w-8 bg-white rounded-full animate-pulse"
                      style={{
                        height: '100%',
                        animationDuration: `${1.5 + Math.random()}s`
                      }}></div>
             ))}
         </div>

         <div className={`w-56 h-56 transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
            <style>{`
              @keyframes sway {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
              }
              .animate-sway { animation: sway 4s infinite ease-in-out; }
            `}</style>
            <PeliCharacter
                emotion={tracks[currentTrack].emotion}
                accessories="headphones"
                animationClass={isPlaying ? 'animate-sway' : ''}
                showParticles={isPlaying ? 'notes' : null}
            />
         </div>
      </div>

      <div className="w-full bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-2">
          <h3 className="text-xl font-bold text-center mb-1">{tracks[currentTrack].title}</h3>
          <p className="text-center text-sm opacity-80 mb-4">{tracks[currentTrack].emotion} Mode</p>

          <div className="w-full h-1 bg-black/20 rounded-full mb-2">
              <div className="h-full bg-white rounded-full relative" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
              </div>
          </div>
          <div className="flex justify-between text-xs font-mono opacity-70 mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-6">
               <button
                  onClick={() => changeTrack((currentTrack - 1 + tracks.length) % tracks.length)}
                  className="text-3xl hover:scale-110 transition-transform"
               >
                 ⏮️
               </button>
               <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white text-indigo-500 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-105 active:scale-95 transition-all"
               >
                 {isPlaying ? '⏸️' : '▶️'}
               </button>
               <button
                  onClick={() => changeTrack((currentTrack + 1) % tracks.length)}
                  className="text-3xl hover:scale-110 transition-transform"
               >
                 ⏭️
               </button>
          </div>
      </div>

      <div className="w-full flex flex-col gap-2 overflow-y-auto max-h-48 scrollbar-hide px-1">
          {tracks.map((t, idx) => (
             <button
               key={idx}
               onClick={() => changeTrack(idx)}
               className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${currentTrack === idx ? 'bg-white text-indigo-600 border-white shadow-md' : 'bg-white/10 border-transparent hover:bg-white/20 text-white'}`}
             >
               <span className="truncate mr-2">{t.title}</span>
               {currentTrack === idx && <span className="text-xs animate-pulse whitespace-nowrap">Playing 🎵</span>}
             </button>
          ))}
      </div>
    </div>
  );
};

// --- EXERCISE ---
const PhysicalExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'active' | 'outro'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);

  const movements = useMemo(() => [
    { name: "Stretch Arms Up", text: "Reach high… feel your chest open.", duration: 8, animation: "scale-y-125 transition-transform duration-[2000ms] ease-in-out", peliEmotion: "Neutral" },
    { name: "Shake Hands", text: "Release tightness from your fingers.", duration: 6, animation: "animate-shake", peliEmotion: "Happy" },
    { name: "Slow Neck Roll", text: "Move gently… front → side → back.", duration: 8, animation: "animate-pulse-slow rotate-6 transition-transform", peliEmotion: "Relaxed" },
    { name: "Step in Place", text: "Warm your feet, loosen your legs.", duration: 8, animation: "animate-bounce", peliEmotion: "Excited" }
  ], []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (phase === 'intro') { setPhase('active'); setTimeLeft(movements[0].duration); }
      else if (phase === 'active') {
        if (currentStep < movements.length - 1) { setCurrentStep(c => c + 1); setTimeLeft(movements[currentStep + 1].duration); }
        else { setPhase('outro'); setTimeLeft(5); }
      } else if (phase === 'outro') { onComplete(); }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, phase, currentStep, movements, onComplete]);

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center flex-grow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6">Let's Move!</h2>
        <div className="w-40 h-40 mb-6 relative"><div className="absolute -top-8 -right-8 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">Before</div><PeliCharacter emotion="Tense" /></div>
        <p className="text-xl font-medium opacity-90">Feeling Tense or Low Energy?</p>
        <p className="mt-4 text-4xl font-bold">{timeLeft}</p>
      </div>
    );
  }
  if (phase === 'active') {
    const move = movements[currentStep];
    return (
      <div className="flex flex-col items-center justify-center flex-grow text-center animate-fadeIn">
         <style>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.2s infinite; } .animate-pulse-slow { animation: pulse 3s infinite; } `}</style>
        <h2 className="text-2xl font-bold mb-2">{move.name}</h2>
        <div className="w-48 h-48 my-6 flex items-center justify-center"><div className={`w-full h-full transition-all ${move.animation}`}><PeliCharacter emotion={move.peliEmotion} /></div></div>
        <p className="text-xl px-6 min-h-[3rem]">{move.text}</p>
        <div className="w-full max-w-xs bg-white/30 rounded-full h-2 mt-8"><div className="bg-white h-2 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${((move.duration - timeLeft) / move.duration) * 100}%` }} /></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6">All Done!</h2>
        <div className="w-40 h-40 mb-6 relative"><div className="absolute -top-8 -right-8 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">After</div><PeliCharacter emotion="Relaxed" isGlowing /></div>
        <p className="text-xl font-medium opacity-90">Feeling Awake and Calm.</p>
    </div>
  );
};

// --- BRAIN GAMES ---
interface GameProps { onComplete: () => void; setPeliReaction: (emo: string) => void; setFeedback: (text: string) => void; peliReaction: string; }
const FindFaceGame: React.FC<GameProps> = ({ onComplete, setPeliReaction, setFeedback, peliReaction }) => {
    const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('easy');
    const [grid, setGrid] = useState<Emotion[]>([]);
    useEffect(() => {
        const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
        const distractors: Emotion[] = ['Sad', 'Angry', 'Fear', 'Surprised', 'Disgust', 'Neutral'];
        const newGrid: Emotion[] = [];
        for(let i=0; i<count-1; i++) newGrid.push(distractors[Math.floor(Math.random() * distractors.length)]);
        const insertIdx = Math.floor(Math.random() * count);
        newGrid.splice(insertIdx, 0, 'Happy');
        setGrid(newGrid);
        setPeliReaction('Neutral');
        setFeedback("Tap the Happy face!");
    }, [difficulty, setPeliReaction, setFeedback]);
    const handleTap = (emo: Emotion) => {
        if (emo === 'Happy') {
            setPeliReaction('Excited');
            setFeedback("You found it!");
            setTimeout(() => { if (difficulty === 'easy') setDifficulty('medium'); else if (difficulty === 'medium') setDifficulty('hard'); else onComplete(); }, 1000);
        } else { setPeliReaction('Sad'); setFeedback("Try again — look for the smiling eyes!"); }
    };
    const levelText = difficulty === 'easy' ? "Level 1/3" : difficulty === 'medium' ? "Level 2/3" : "Level 3/3";
    return (
        <div className="flex flex-col items-center w-full">
            <h3 className="text-xl font-bold mb-1">Find the Happy Face!</h3>
            <span className="text-xs uppercase tracking-widest opacity-80 mb-4">{levelText}</span>
            <div className="w-24 h-24 mb-4"><PeliCharacter emotion={peliReaction} animationClass={peliReaction === 'Excited' ? 'animate-bounce' : ''} /></div>
            <p className="mb-6 font-medium bg-white/20 px-4 py-2 rounded-xl">{peliReaction === 'Excited' ? 'Great Job!' : 'Tap the Happy face!'}</p>
            <div className="flex flex-wrap gap-4 justify-center items-center max-w-xs">{grid.map((emo, idx) => (<button key={`${difficulty}-${idx}`} onClick={() => handleTap(emo)} className="text-5xl bg-white/20 p-4 rounded-2xl hover:scale-110 transition-transform active:scale-95 w-20 h-20 flex items-center justify-center">{EMOTION_DETAILS[emo].emoji}</button>))}</div>
        </div>
    );
};

const NameEmotionGame: React.FC<GameProps> = ({ onComplete, setPeliReaction, setFeedback, peliReaction }) => {
    const [targetEmotion, setTargetEmotion] = useState<Emotion>('Happy');
    const [options, setOptions] = useState<string[]>([]);
    useEffect(() => {
        const supported: Emotion[] = ['Happy', 'Sad', 'Angry', 'Fear', 'Surprised', 'Neutral', 'Disgust'];
        const target = supported[Math.floor(Math.random() * supported.length)];
        setTargetEmotion(target);
        const wrong = supported.filter(e => e !== target).sort(() => 0.5 - Math.random()).slice(0, 3);
        const choices = [...wrong, target].sort(() => 0.5 - Math.random());
        setOptions(choices);
        setPeliReaction(target);
        setFeedback("What is Peli feeling?");
    }, [setPeliReaction, setFeedback]);
    const handleGuess = (guess: string) => {
        if (guess === targetEmotion) { setPeliReaction('Love'); setFeedback("Correct!"); setTimeout(onComplete, 1500); }
        else { setFeedback("Let’s check the eyes and mouth—try again!"); }
    };
    return (
        <div className="flex flex-col items-center w-full">
            <h3 className="text-xl font-bold mb-4">Name the Emotion</h3>
            <div className="w-40 h-40 mb-6 bg-white/10 rounded-full p-4"><PeliCharacter emotion={peliReaction} isGlowing={peliReaction === 'Love'} /></div>
            <p className="mb-6 font-medium min-h-[1.5em] px-4">{peliReaction === 'Love' ? 'Correct!' : 'What is Peli feeling?'}</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">{options.map(opt => (<button key={opt} onClick={() => handleGuess(opt)} className="bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold transition-colors">{opt}</button>))}</div>
        </div>
    );
};

const MemoryMatchGame: React.FC<GameProps> = ({ onComplete, setPeliReaction, setFeedback, peliReaction }) => {
    const [cards, setCards] = useState<{id: number, emotion: Emotion, isFlipped: boolean, isMatched: boolean}[]>([]);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    useEffect(() => {
        const emotions: Emotion[] = ['Happy', 'Sad', 'Angry', 'Surprised', 'Fear', 'Neutral'];
        const deck = [...emotions, ...emotions].sort(() => 0.5 - Math.random()).map((emo, idx) => ({ id: idx, emotion: emo, isFlipped: false, isMatched: false }));
        setCards(deck); setPeliReaction('Neutral'); setFeedback("Find the pairs!");
    }, [setPeliReaction, setFeedback]);
    const handleCardClick = (id: number) => {
        if (flippedIds.length >= 2) return;
        const clickedCard = cards.find(c => c.id === id);
        if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;
        const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
        setCards(newCards);
        const newFlipped = [...flippedIds, id];
        setFlippedIds(newFlipped);
        if (newFlipped.length === 2) {
            const card1 = newCards.find(c => c.id === newFlipped[0]);
            const card2 = newCards.find(c => c.id === newFlipped[1]);
            if (card1 && card2) {
                if (card1.emotion === card2.emotion) {
                    setTimeout(() => {
                        setCards(prev => {
                            const updated = prev.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true, isFlipped: true } : c);
                            if (updated.every(c => c.isMatched)) { setPeliReaction('Excited'); setFeedback("Amazing memory!"); setTimeout(onComplete, 1500); }
                            else { setPeliReaction('Happy'); }
                            return updated;
                        });
                        setFlippedIds([]);
                    }, 500);
                } else {
                    setTimeout(() => {
                        setCards(prev => prev.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isFlipped: false } : c));
                        setFlippedIds([]); setPeliReaction('Sad');
                    }, 1000);
                }
            }
        }
    };
    return (
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-between w-full px-4 mb-2"><h3 className="text-xl font-bold">Match Pairs</h3><div className="w-12 h-12"><PeliCharacter emotion={peliReaction} animationClass={peliReaction === 'Excited' ? 'animate-bounce' : ''} /></div></div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs">{cards.map(card => (<button key={card.id} onClick={() => handleCardClick(card.id)} className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-300 transform ${card.isFlipped || card.isMatched ? 'bg-white text-black scale-100' : 'bg-white/30 text-transparent hover:bg-white/40 scale-95'}`}>{(card.isFlipped || card.isMatched) ? EMOTION_DETAILS[card.emotion].emoji : '?'}</button>))}</div>
          <div className="mt-4 h-6 text-sm font-semibold opacity-90">{peliReaction === 'Excited' ? 'Amazing memory!' : 'Find the pairs!'}</div>
        </div>
    );
};

const BrainExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [gameMode, setGameMode] = useState<'menu' | 'find' | 'name' | 'match'>('menu');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [peliReaction, setPeliReaction] = useState<string>('Neutral');
  if (gameMode === 'menu') {
      return (
          <div className="flex flex-col w-full items-center gap-4 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4">Brain Power</h2>
              <button onClick={() => setGameMode('find')} className="w-full bg-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/30 transition-colors text-left"><span className="text-3xl">🧐</span><div><div className="font-bold">Find Happy Face</div><div className="text-xs opacity-80">Builds attention</div></div></button>
              <button onClick={() => setGameMode('name')} className="w-full bg-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/30 transition-colors text-left"><span className="text-3xl">🗣️</span><div><div className="font-bold">Name Emotion</div><div className="text-xs opacity-80">Builds vocabulary</div></div></button>
              <button onClick={() => setGameMode('match')} className="w-full bg-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/30 transition-colors text-left"><span className="text-3xl">🃏</span><div><div className="font-bold">Memory Match</div><div className="text-xs opacity-80">Builds pattern recognition</div></div></button>
          </div>
      );
  }
  return (
      <div className="flex-grow w-full flex flex-col items-center animate-fadeIn">
          <button onClick={() => setGameMode('menu')} className="self-start mb-2 text-sm opacity-70 hover:opacity-100">← Back</button>
          {gameMode === 'find' && <FindFaceGame onComplete={onComplete} setPeliReaction={setPeliReaction} setFeedback={setFeedback as any} peliReaction={peliReaction} />}
          {gameMode === 'name' && <NameEmotionGame onComplete={onComplete} setPeliReaction={setPeliReaction} setFeedback={setFeedback as any} peliReaction={peliReaction} />}
          {gameMode === 'match' && <MemoryMatchGame onComplete={onComplete} setPeliReaction={setPeliReaction} setFeedback={setFeedback as any} peliReaction={peliReaction} />}
      </div>
  );
};

const ExerciseHub: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [mode, setMode] = useState<'menu' | 'physical' | 'brain'>('menu');
    if (mode === 'menu') {
        return (
            <div className="flex flex-col w-full h-full items-center justify-center gap-6 animate-fadeIn">
                <h2 className="text-3xl font-bold text-center mb-4">Choose Your Workout</h2>
                <button onClick={() => setMode('physical')} className="w-full max-w-sm bg-gradient-to-r from-orange-400/30 to-red-400/30 border-2 border-white/40 p-6 rounded-3xl flex items-center gap-6 hover:scale-105 transition-transform active:scale-95 shadow-lg"><div className="bg-white/20 p-4 rounded-full"><LightningIcon className="w-10 h-10 text-white" /></div><div className="text-left"><h3 className="text-xl font-bold">Body Moving</h3><p className="text-sm opacity-90">Release energy & tension</p></div></button>
                <button onClick={() => setMode('brain')} className="w-full max-w-sm bg-gradient-to-r from-blue-400/30 to-indigo-400/30 border-2 border-white/40 p-6 rounded-3xl flex items-center gap-6 hover:scale-105 transition-transform active:scale-95 shadow-lg"><div className="bg-white/20 p-4 rounded-full"><BrainIcon className="w-10 h-10 text-white" /></div><div className="text-left"><h3 className="text-xl font-bold">Brain Power</h3><p className="text-sm opacity-90">Emotion puzzles & games</p></div></button>
            </div>
        );
    }
    if (mode === 'physical') { return <PhysicalExercise onComplete={onComplete} />; }
    return <BrainExercise onComplete={onComplete} />;
};

// --- BREATHING MODE ---
const BreathingMode: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4); 
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (cycles >= 3) { onComplete(); return; }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') { setPhase('hold'); return 4; }
          else if (phase === 'hold') { setPhase('exhale'); return 4; }
          else { setPhase('inhale'); setCycles(c => c + 1); return 4; }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, cycles, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full py-8 text-center animate-fadeIn">
      <h2 className="text-3xl font-black mb-12 drop-shadow-md uppercase italic tracking-tighter text-white">Breathe Deeply</h2>
      
      <div className="relative mb-12 flex items-center justify-center">
        <div className={`absolute rounded-full border-4 border-white/30 transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'w-64 h-64 scale-150 opacity-100' : phase === 'exhale' ? 'w-32 h-32 scale-75 opacity-20' : 'w-64 h-64 scale-150 opacity-60'}`} />
        <div className="w-48 h-48 relative z-10">
          <PeliCharacter 
            emotion={phase === 'exhale' ? 'Calm' : 'Relaxed'} 
            scale={phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1.2} 
            animationClass="transition-all duration-[4000ms] ease-in-out"
          />
        </div>
      </div>

      <p className="text-3xl font-black mb-2 uppercase tracking-widest text-indigo-100">{phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out'}</p>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i <= cycles ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>
      <p className="text-5xl font-mono font-black mt-4 text-white">{timeLeft}</p>
    </div>
  );
};

// --- STORY MODE ---
const MAX_VOICEOVERS_PER_DAY = 10;
const STORIES = [
  { id: 1, title: "Peli's Colorful Day", icon: "🌈", scenes: [{ text: "Hi there! I am Peli. Today is a very colorful day.", emotion: "Happy" }, { text: "I walked outside and saw a big gray cloud. Oh no!", emotion: "Sad" }, { text: "Suddenly, the sun came out! I was so surprised!", emotion: "Surprised" }, { text: "Then I saw a rainbow. It made me feel calm and peaceful.", emotion: "Relaxed" }, { text: "Now I feel ready for a great day. Thanks for listening!", emotion: "Love" }] },
  { id: 2, title: "The Brave Little Star", icon: "⭐", scenes: [{ text: "Once there was a little star who was afraid of the dark.", emotion: "Fear" }, { text: "He tried to hide behind a cloud, feeling very small.", emotion: "Sad" }, { text: "But the moon said, 'You have a light inside you!'", emotion: "Neutral" }, { text: "The little star took a deep breath and sparkled.", emotion: "Surprised" }, { text: "He shone brighter than ever before! He felt so proud.", emotion: "Neutral" }] }
];

const StoryMode: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { currentEmotion, userName, companionName } = useAppContext();
    const [storyList, setStoryList] = useState(STORIES);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
    const [sceneIndex, setSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isNarrating, setIsNarrating] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPickingTheme, setIsPickingTheme] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [quotaData, setQuotaData] = useState(() => {
        const saved = localStorage.getItem('story_quota');
        const today = new Date().toLocaleDateString();
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.date === today) return parsed;
        }
        return { date: today, count: 0 };
    });

    useEffect(() => { localStorage.setItem('story_quota', JSON.stringify(quotaData)); }, [quotaData]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const isCancelledRef = useRef(false);

    const initAudio = () => {
        if (!audioContextRef.current) { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); }
        if (audioContextRef.current.state === 'suspended') { audioContextRef.current.resume(); }
    };

    const stopPlayback = useCallback(() => {
        isCancelledRef.current = true;
        if (sourceNodeRef.current) { try { sourceNodeRef.current.stop(); } catch(e) {} sourceNodeRef.current = null; }
        setIsPlaying(false); setIsNarrating(false);
    }, []);

    const speakSceneGemini = async (index: number) => {
        if (selectedStoryIndex === null || isCancelledRef.current) return;
        if (quotaData.count >= MAX_VOICEOVERS_PER_DAY) { setIsNarrating(false); return; }
        
        const key = getSafeApiKey();
        if (!key) {
           setErrorMsg("API Key Missing");
           setIsNarrating(false);
           return;
        }

        const currentStory = storyList[selectedStoryIndex];
        const scene = currentStory.scenes[index];
        setIsNarrating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: scene.text }] }],
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
            });
            if (isCancelledRef.current) return;
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                initAudio();
                const ctx = audioContextRef.current!;
                const audioData = decodeBase64ToUint8(base64Audio);
                const buffer = await decodePCM(audioData, ctx, 24000, 1);
                const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination); sourceNodeRef.current = source;
                source.onended = () => {
                    setIsNarrating(false); if (isCancelledRef.current) return;
                    setTimeout(() => { if (isCancelledRef.current) return; if (index < currentStory.scenes.length - 1) { setSceneIndex(index + 1); speakSceneGemini(index + 1); } else { onComplete(); } }, 1200);
                };
                source.start(); if (index === 0) { setQuotaData(prev => ({ ...prev, count: prev.count + 1 })); }
            }
        } catch (error) { 
           setIsNarrating(false); 
           setTimeout(() => { 
             if (index < currentStory.scenes.length - 1) { setSceneIndex(index + 1); speakSceneGemini(index + 1); } else { onComplete(); } 
           }, 3000); 
        }
    };

    const handleGenerateStory = async (selectedTheme: string) => {
        const key = getSafeApiKey();
        if (!key) {
          setErrorMsg("No API Key");
          return;
        }

        setIsPickingTheme(false); setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Create an 8-scene children's story for ${userName}. Theme: ${selectedTheme}. Response in JSON: { "title": "Story Title", "scenes": [ { "text": "...", "emotion": "..." } ] }`,
                config: { responseMimeType: "application/json" }
            });
            const storyData = JSON.parse(result.text);
            const newStory = { id: Date.now(), title: storyData.title, icon: "✨", scenes: storyData.scenes };
            setStoryList(prev => [newStory, ...prev]); setSelectedStoryIndex(0); setHasStarted(false); setSceneIndex(0);
        } catch (e) { 
           console.error("Generation failed", e); 
           setErrorMsg("Generation Error");
        } finally { setIsGenerating(false); }
    };

    const handleStart = () => { initAudio(); isCancelledRef.current = false; setHasStarted(true); setIsPlaying(true); setIsPaused(false); if (quotaData.count < MAX_VOICEOVERS_PER_DAY) { speakSceneGemini(0); } else { setIsPlaying(false); } };
    const handleTogglePause = () => { if (isPaused) { setIsPaused(false); isCancelledRef.current = false; if (quotaData.count < MAX_VOICEOVERS_PER_DAY) speakSceneGemini(sceneIndex); } else { setIsPaused(true); stopPlayback(); isCancelledRef.current = true; } };
    const handleExitToLibrary = () => { stopPlayback(); isCancelledRef.current = true; setSelectedStoryIndex(null); setHasStarted(false); setIsPlaying(false); setIsPickingTheme(false); };

    if (isPickingTheme) {
        return (
            <div className="flex flex-col items-center w-full h-full animate-fadeIn p-4 overflow-y-auto scrollbar-hide text-white">
                <div className="w-full flex justify-between items-center mb-6">
                    <button onClick={() => setIsPickingTheme(false)} className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-white border border-white/20 shadow-xl text-2xl">📚</button>
                    <span className="text-xl font-black">Themes</span>
                </div>
                <h2 className="text-3xl font-black mb-2 text-center drop-shadow-md">What theme?</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm pb-10 mt-6">
                    {['Brave', 'Happy', 'Calm', 'Curious', 'Kind', 'Proud', 'Safe', 'Strong'].map(emo => (
                        <button key={emo} onClick={() => handleGenerateStory(emo)} className="bg-white/10 hover:bg-white/30 backdrop-blur-md p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all active:scale-95 border-2 border-white/10 shadow-xl group text-white">
                            <span className="text-5xl group-hover:scale-125 transition-transform">{emo === 'Brave' ? '🛡️' : emo === 'Happy' ? '🎈' : emo === 'Calm' ? '☁️' : emo === 'Curious' ? '🔍' : emo === 'Kind' ? '💗' : emo === 'Safe' ? '🏠' : emo === 'Strong' ? '⚡' : '🏆'}</span>
                            <span className="font-black text-lg uppercase tracking-tighter">{emo}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (selectedStoryIndex === null) {
        const keyMissing = !getSafeApiKey();
        const quotaExceeded = quotaData.count >= MAX_VOICEOVERS_PER_DAY;
        
        return (
            <div className="flex flex-col items-center w-full h-full animate-fadeIn p-4 text-white">
                <h2 className="text-3xl font-black mb-6 text-center drop-shadow-md">Story Library 📚</h2>
                <button 
                  disabled={isGenerating || keyMissing} 
                  onClick={() => setIsPickingTheme(true)} 
                  className={`w-full p-6 rounded-3xl flex items-center gap-4 transition-all text-left shadow-2xl mb-8 border-2 border-white/20 text-white ${keyMissing ? 'bg-gray-500/50 opacity-50 grayscale' : 'bg-gradient-to-r from-violet-600 to-indigo-600 active:scale-95'}`}
                >
                    <span className="text-5xl">{isGenerating ? "🌀" : "✨"}</span>
                    <div>
                        <h3 className="font-black text-xl leading-tight">Magic AI Story</h3>
                        <p className="text-sm font-bold opacity-90 italic">
                          {keyMissing ? "Setup Required (No API Key)" : quotaExceeded ? "Narrator sleeping 😴" : `${MAX_VOICEOVERS_PER_DAY - quotaData.count} narrations left today`}
                        </p>
                    </div>
                </button>
                {errorMsg && <p className="mb-4 text-rose-300 font-bold text-xs uppercase animate-pulse">⚠️ {errorMsg}</p>}
                <div className="w-full space-y-4 overflow-y-auto pr-1 scrollbar-hide pb-10">
                    {storyList.map((story, idx) => (
                        <button key={story.id} onClick={() => { setSelectedStoryIndex(idx); setHasStarted(false); setSceneIndex(0); }} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md p-5 rounded-3xl flex items-center gap-5 transition-all active:scale-95 text-left border border-white/10 shadow-lg group text-white">
                            <span className="text-4xl group-hover:scale-110 transition-transform">{story.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-black text-lg leading-tight">{story.title}</h3>
                                <p className="text-xs font-bold opacity-60 uppercase">{story.scenes.length} Scenes</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentStory = storyList[selectedStoryIndex];
    const currentScene = currentStory.scenes[sceneIndex];
    const progress = ((sceneIndex + 1) / currentStory.scenes.length) * 100;
    const keyAvailable = !!getSafeApiKey();
    const quotaExceeded = quotaData.count >= MAX_VOICEOVERS_PER_DAY;

    if (!hasStarted) {
        return (
            <div className="flex flex-col items-center justify-center flex-grow text-center relative w-full h-full p-6 text-white">
                <button onClick={() => setSelectedStoryIndex(null)} className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all text-white border border-white/20 shadow-xl text-2xl">📚</button>
                <span className="text-8xl mb-6">{currentStory.icon}</span>
                <h2 className="text-4xl font-black mb-3 drop-shadow-lg">{currentStory.title}</h2>
                <div className="w-48 h-48 mb-6"><PeliCharacter emotion="Happy" /></div>
                <button onClick={handleStart} className="bg-white text-indigo-600 px-12 py-6 rounded-full font-black text-2xl shadow-2xl transform active:scale-90 transition-all hover:bg-indigo-50">READ NOW 📖</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between flex-grow h-full py-4 w-full relative px-4 text-white">
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-white transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <div className="w-full flex justify-between items-center mb-2">
                <button onClick={handleExitToLibrary} className="w-10 h-10 flex items-center justify-center bg-rose-500 hover:bg-rose-600 rounded-full transition-colors text-white shadow-lg text-xl">📚</button>
                <div className="text-[10px] font-black bg-black/30 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">Scene {sceneIndex + 1} of {currentStory.scenes.length}</div>
            </div>
            <div className="flex-grow flex items-center justify-center w-full max-h-[35%] my-4"><PeliCharacter emotion={currentScene.emotion} animationClass={(isNarrating && !isPaused) ? 'animate-pulse' : ''} /></div>
            <div className="flex items-center w-full gap-2 mb-6">
                <button onClick={() => { stopPlayback(); setSceneIndex(prev => Math.max(0, prev - 1)); }} disabled={sceneIndex === 0} className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl transition-all ${sceneIndex === 0 ? 'opacity-20' : 'hover:bg-white/20 active:scale-90'}`}>⬅️</button>
                <div className="flex-1 bg-white/20 backdrop-blur-lg p-6 rounded-[40px] shadow-2xl border-2 border-white/20 flex flex-col justify-center min-h-[160px]">
                    <p className="text-xl font-black text-center text-white leading-relaxed drop-shadow-sm font-serif italic">"{currentScene.text}"</p>
                </div>
                <button onClick={() => { stopPlayback(); setSceneIndex(prev => Math.min(currentStory.scenes.length - 1, prev + 1)); }} disabled={sceneIndex === currentStory.scenes.length - 1} className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl transition-all ${sceneIndex === currentStory.scenes.length - 1 ? 'opacity-20' : 'hover:bg-white/20 active:scale-90'}`}>➡️</button>
            </div>
            <div className="bg-white/10 p-6 rounded-[3rem] backdrop-blur-xl border border-white/10 flex items-center gap-10 shadow-2xl mb-6">
                <button onClick={handleTogglePause} disabled={!keyAvailable || (quotaExceeded && !isPlaying)} className={`w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center text-4xl shadow-2xl transform active:scale-90 transition-all ${(!keyAvailable || (quotaExceeded && !isPlaying)) ? 'opacity-50 grayscale' : ''}`}>{isPaused ? '▶️' : '⏸️'}</button>
                <button onClick={handleExitToLibrary} className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center text-3xl shadow-xl transform active:scale-90 transition-all">⏹️</button>
            </div>
            {!keyAvailable && <p className="text-[10px] font-bold uppercase opacity-60">AI Narrator Unavailable (Offline)</p>}
        </div>
    );
};

// --- FEEDING ---
const FeedingTime: React.FC<{ onComplete: () => void; onOpenShop?: () => void }> = ({ onComplete, onOpenShop }) => {
    const { setLastFedTime, inventory, consumeItem, hungerLevel } = useAppContext();
    const [mode, setMode] = useState<'menu'|'pouring'|'eating'>('menu');
    const [pourLevel, setPourLevel] = useState(0); 

    const ownedFoods = SHOP_ITEMS.filter(item =>
        item.category === 'food' && inventory.includes(item.id)
    ).map(item => ({
        ...item,
        quantity: inventory.filter(id => id === item.id).length
    })).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

    const startPour = () => { (window as any).pourInterval = setInterval(() => { setPourLevel(p => Math.min(p + 2, 100)); }, 50); };
    const stopPour = () => { clearInterval((window as any).pourInterval); if(pourLevel >= 60 && pourLevel <= 80) setMode('eating'); else setPourLevel(0); };

    useEffect(() => { if(mode === 'eating') { setLastFedTime(Date.now()); setTimeout(() => onComplete(), 2500); } }, [mode, onComplete, setLastFedTime]);

    return (
        <div className="flex flex-col items-center w-full h-full justify-between animate-fadeIn text-white pt-2 pb-6">
            <div className="w-full px-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Hunger Meter</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{hungerLevel > 80 ? 'Full' : hungerLevel > 40 ? 'Satisfied' : 'Starving'}</span>
              </div>
              <div className="w-full h-4 bg-black/20 rounded-full border border-white/10 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${hungerLevel > 60 ? 'bg-emerald-400' : hungerLevel > 25 ? 'bg-yellow-400' : 'bg-rose-500'}`} 
                    style={{ width: `${hungerLevel}%` }}
                  />
              </div>
            </div>

            {mode === 'menu' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <h2 className="text-2xl font-bold mb-2">Feeding Time 🍽️</h2>
                <div className="w-32 h-32 mb-4"><PeliCharacter emotion="Neutral" isHungry={hungerLevel < 30} /></div>

                {ownedFoods.length === 0 ? (
                    <div className="text-center bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-sm max-w-[280px] shadow-xl">
                        <p className="font-bold mb-3 text-lg">Peli is hungry!</p>
                        <p className="text-sm opacity-80 mb-6 italic">You don't have any food in your inventory right now.</p>
                        <button 
                            onClick={onOpenShop}
                            className="bg-white text-indigo-600 font-black px-8 py-3 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-tight"
                        >
                            Go to Shop 🛍️
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 w-full px-2 max-h-[35vh] overflow-y-auto scrollbar-hide">
                        {ownedFoods.map(f => (
                            <button key={f.id} onClick={() => { consumeItem(f.id); if(f.id === 'water' || f.id === 'juice') setMode('pouring'); else setMode('eating'); }} className="bg-white/10 p-3 rounded-2xl flex flex-col items-center border-2 border-transparent hover:border-white/30 transition-all text-white backdrop-blur-sm">
                                <span className="text-3xl filter drop-shadow-sm mb-1">{f.icon}</span>
                                <span className="font-black text-sm">{f.name}</span>
                                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full mt-1 font-bold">x{f.quantity} Owned</span>
                            </button>
                        ))}
                    </div>
                )}
              </div>
            )}

            {mode === 'pouring' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <h2 className="text-2xl font-bold mb-8">Pour the Drink!</h2>
                <div className="relative w-24 h-48 border-4 border-white rounded-b-xl overflow-hidden bg-white/10 mb-8 shadow-inner">
                    <div className="absolute left-0 right-0 bg-green-400/30 border-y border-green-400" style={{bottom: `60%`, height: `20%` }} />
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-100" style={{height: `${pourLevel}%`}} />
                </div>
                <button onMouseDown={startPour} onMouseUp={stopPour} onTouchStart={startPour} onTouchEnd={stopPour} className="bg-white text-indigo-600 px-12 py-5 rounded-full font-black text-xl shadow-xl active:scale-95 transition-transform uppercase tracking-widest">Hold to Pour</button>
              </div>
            )}

            {mode === 'eating' && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <h2 className="text-3xl font-black mb-6 drop-shadow-md">Yummy!</h2>
                  <div className="w-56 h-56 animate-bounce"><PeliCharacter emotion="Happy" isGlowing /></div>
                  <p className="mt-8 text-xl font-bold italic opacity-90">Peli is full!</p>
              </div>
            )}
        </div>
    );
};

// --- GENERIC TIMER ---
const GenericTimer: React.FC<{ activity: Activity; onComplete: () => void }> = ({ activity, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(activity.duration);
  useEffect(() => {
    if (timeLeft <= 0) { onComplete(); return; }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onComplete]);
  const progress = ((activity.duration - timeLeft) / activity.duration) * 100;
  const Icon = activity.icon;
  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full py-8 text-white text-center">
      <Icon className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" />
      <h2 className="text-3xl font-bold mb-2">{activity.name}</h2>
      <p className="text-6xl font-mono font-bold my-8 tracking-wider">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
      <div className="w-full bg-white/30 rounded-full h-3 max-w-xs overflow-hidden">
        <div className="bg-white h-3 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onOpenShop?: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ activity, onClose, onOpenShop }) => {
  const { addActivityLog, earnDrachma } = useAppContext();
  const [isComplete, setIsComplete] = useState(false);
  const handleComplete = () => { if (!isComplete) { setIsComplete(true); addActivityLog(activity.name); earnDrachma(activity.reward); setTimeout(onClose, 2500); } };
  
  const renderContent = () => {
    if (isComplete) return <div className="flex flex-col items-center justify-center flex-grow text-white"><span className="text-9xl mb-8 animate-bounce">🌟</span><p className="text-4xl font-black italic tracking-tighter uppercase">GREAT JOB!</p><p className="text-2xl font-bold text-yellow-300 mt-4 flex items-center gap-2">+{activity.reward} <DrachmaIcon className="w-6 h-6" /></p></div>;
    
    switch (activity.name) {
      case 'Mood Boost': return <MoodBoost onComplete={handleComplete} />;
      case 'Give Gift': return <GiveGift onComplete={handleComplete} />;
      case 'Bath Time': return <BathTime onComplete={handleComplete} />;
      case 'Feeding': return <FeedingTime onComplete={handleComplete} onOpenShop={onOpenShop} />;
      case 'Play Music': return <MusicPlayer onComplete={handleComplete} />;
      case 'Exercise': return <ExerciseHub onComplete={handleComplete} />;
      case 'Meditate': return <BreathingMode onComplete={handleComplete} />;
      case 'Tell Story': return <StoryMode onComplete={handleComplete} />;
      default: return <GenericTimer activity={activity} onComplete={handleComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4">
      <div className={`relative w-full h-full sm:h-[85vh] sm:max-h-[800px] sm:max-w-md flex flex-col sm:rounded-[3rem] p-6 text-white shadow-2xl bg-gradient-to-br ${activity.color} transition-all duration-500 overflow-hidden border-2 border-white/10`}>
        {!isComplete && (
          <button onClick={onClose} className="absolute top-4 right-4 text-white opacity-60 p-3 z-20 bg-black/20 rounded-full hover:bg-black/40 transition-colors" aria-label="Close">&times;</button>
        )}
        <div className="flex-1 w-full overflow-y-auto pt-4 pb-4 scrollbar-hide flex flex-col">{renderContent()}</div>
      </div>
    </div>
  );
};

export default ActivityModal;
