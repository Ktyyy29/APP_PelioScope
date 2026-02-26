
import React, { useEffect, useRef } from 'react';

const SplashScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;

    const playAudio = async () => {
      if (audio) {
        try {
          audio.volume = 0.3;
          await audio.play();
        } catch (error) {
          console.warn("Audio autoplay was prevented by the browser. A user interaction is required to start audio.", error);
        }
      }
    };

    playAudio();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-sky-100 to-indigo-200 flex flex-col items-center justify-center overflow-hidden">
      {/* The <style> tag has been removed. Animations are now defined in tailwind.config in index.html */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-indigo-800 tracking-widest opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          PelioScope
        </h1>
        <p className="text-lg text-indigo-600 mt-4 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          Welcome to your friendly emotion companion.
        </p>
      </div>

      {/* Use a valid direct MP3 URL to prevent "element has no supported sources" error */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" autoPlay />
    </div>
  );
};

export default SplashScreen;
