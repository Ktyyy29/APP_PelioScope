
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChatMessage, Emotion, SUPPORTED_EMOTIONS } from '../types';
import { PaperAirplaneIcon } from './Icons';
import { EMOTION_DETAILS } from '../constants';
import { GoogleGenAI } from "@google/genai";

const ChatTab: React.FC = () => {
  const { companionName, currentEmotion, setCurrentEmotion, userName } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  const prevEmotionRef = useRef<Emotion>(currentEmotion);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const key = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
        if (!key) {
          throw new Error("ENVIRONMENT_MISSING: API Key is not detected.");
        }

        const ai = new GoogleGenAI({ apiKey: key });
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are ${companionName || 'Peli'}, a friendly emotion companion. 
            The user (${userName}) is feeling: ${currentEmotion}. 
            Keep responses concise, empathetic, and always acknowledge the user's current emotion.`,
          },
        });
        chatSessionRef.current = chat;
        setAiError(null);

        if (messages.length === 0) {
          setMessages([{
            id: 'welcome',
            text: `Hi ${userName || 'Friend'}! I sense you're feeling ${currentEmotion.toLowerCase()} right now. How can I help you?`,
            sender: 'companion',
            timestamp: Date.now(),
          }]);
        }
      } catch (error: any) {
        setAiError(error.message || "AI Service Unavailable");
      }
    };
    initChat();
  }, [companionName, userName, currentEmotion]);

  useEffect(() => {
    if (prevEmotionRef.current !== currentEmotion && messages.length > 0) {
      handleMoodShiftResponse(currentEmotion);
    }
    prevEmotionRef.current = currentEmotion;
  }, [currentEmotion]);

  const handleMoodShiftResponse = async (newEmotion: Emotion) => {
    setIsTyping(true);
    try {
      if (!chatSessionRef.current) return;
      
      const prompt = `I've just manually updated my mood to ${newEmotion}. Acknowledge this change empathetically as ${companionName}.`;
      const result = await chatSessionRef.current.sendMessage({ message: prompt });
      
      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        text: result.text || `I see you're feeling ${newEmotion.toLowerCase()} now. I'm here for you.`,
        sender: 'companion',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Mood shift reaction failed", error);
    } finally {
      setIsTyping(false);
    }
  };

  const processMessage = async (text: string) => {
    if (text.trim() === '' || isTyping || aiError) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) throw new Error("Not connected");
      const result = await chatSessionRef.current.sendMessage({ message: text });
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: result.text || "I'm listening.",
        sender: 'companion',
        timestamp: Date.now() + 1,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        text: "I'm having trouble connecting right now, but I'm still here for you!",
        sender: 'companion',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (aiError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-950">
        <h1 className="text-xl font-black text-gray-800 dark:text-white mb-2">Neural Link Error</h1>
        <p className="text-gray-500 text-sm mb-6">{aiError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-4 pb-2">
      <div className="flex items-center justify-between mb-2 px-4">
          <div className="flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 italic tracking-tighter">
                PELIO<span className="text-indigo-600">CHAT</span>
              </h1>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Manual Mood Override
              </p>
          </div>
          
          <div className="relative group">
             <select 
               value={currentEmotion}
               onChange={(e) => setCurrentEmotion(e.target.value as Emotion)}
               className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl px-4 py-2 text-sm font-black text-indigo-950 dark:text-indigo-50 shadow-md outline-none appearance-none cursor-pointer pr-10 transition-all hover:border-indigo-400"
             >
                {SUPPORTED_EMOTIONS.map(emo => (
                  <option key={emo} value={emo} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold">
                    {EMOTION_DETAILS[emo].emoji} {emo}
                  </option>
                ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
               </svg>
             </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-hide bg-white/50 dark:bg-transparent rounded-t-[2.5rem] mt-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 animate-fadeInUp ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'companion' && (
              <div className="w-9 h-9 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white text-[11px] font-black shrink-0 mb-1 shadow-lg border-2 border-white dark:border-gray-800">
                {(companionName || 'Peli').charAt(0)}
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1 p-4">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); processMessage(userInput); }} 
        className="p-4 flex items-center gap-2 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800"
      >
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)} 
          placeholder={`Speak with ${companionName || 'Peli'}...`} 
          className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none text-sm font-medium text-gray-900 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/10" 
        />
        <button 
          type="submit" 
          disabled={!userInput.trim() || isTyping} 
          className="p-4 bg-indigo-600 text-white rounded-2xl active:scale-90 transition-transform disabled:opacity-50 shadow-lg"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatTab;
