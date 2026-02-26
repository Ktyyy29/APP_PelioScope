
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import Tts from 'react-native-tts';
import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';

// --- DATA ---
const STORIES = [
  {
    id: 1,
    title: "Peli's Colorful Day",
    icon: "🌈",
    scenes: [
        { text: "Hi there! I am Peli. Today is a very colorful day.", emotion: "Happy" },
        { text: "I walked outside and saw a big gray cloud. Oh no!", emotion: "Sad" },
        { text: "Suddenly, the sun came out! I was so surprised!", emotion: "Surprised" },
        { text: "Then I saw a rainbow. It made me feel calm and peaceful.", emotion: "Relaxed" },
        { text: "Now I feel ready for a great day. Thanks for listening!", emotion: "Love" }
    ]
  },
  {
    id: 2,
    title: "The Brave Little Star",
    icon: "⭐",
    scenes: [
      { text: "Once there was a little star who was afraid of the dark.", emotion: "Fear" },
      { text: "He tried to hide behind a cloud, feeling very small.", emotion: "Sad" },
      { text: "But the moon said, 'You have a light inside you!'", emotion: "Neutral" },
      { text: "The little star took a deep breath and sparkled.", emotion: "Surprised" },
      { text: "He shone brighter than ever before! He felt so proud.", emotion: "Confident" }
    ]
  },
  // ... (Add other stories here)
];

const EMOTION_COLORS = {
  Happy: '#fcd34d',    // Yellow
  Sad: '#93c5fd',      // Blue
  Angry: '#f87171',    // Red
  Fear: '#a5b4fc',     // Indigo
  Surprised: '#d8b4fe',// Purple
  Relaxed: '#f472b6',  // Pink
  Love: '#f472b6',     // Pink
  Neutral: '#FFE8C7',  // Cream
  Disgust: '#84cc16',  // Lime
};

// --- PELI CHARACTER COMPONENT (React Native SVG) ---
const PeliCharacter = ({ emotion, scale = 1 }) => {
  const color = EMOTION_COLORS[emotion] || EMOTION_COLORS.Neutral;

  // Simple eye logic
  const isHappy = ['Happy', 'Excited', 'Love', 'Relaxed'].includes(emotion);
  const isSad = ['Sad', 'Fear', 'Worried'].includes(emotion);
  const isMad = ['Angry', 'Mad'].includes(emotion);
  const isWide = ['Surprised', 'Fear'].includes(emotion);

  return (
    <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
      <Svg height="100%" width="100%" viewBox="0 0 200 200">
        {/* Shadow */}
        <Ellipse cx="140" cy="60" rx="10" ry="5" fill="white" fillOpacity="0.4" transform="rotate(-45 140 60)" />
        
        {/* Body Blob */}
        <Path
          d="M40,160 Q20,100 40,40 Q100,0 160,40 Q180,100 160,160 Q100,190 40,160 Z"
          fill={color}
          stroke="#00000020"
          strokeWidth="2"
        />

        {/* Eyes Group */}
        <G y="10">
          {/* Left Eye */}
          {isHappy ? (
             <Path d="M55,80 Q70,70 85,80" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
             <G>
               <Ellipse cx="70" cy="80" rx={isWide ? "16" : "13"} ry={isWide ? "16" : "15"} fill={isWide ? "white" : "#1e293b"} stroke={isWide ? "#1e293b" : "none"} strokeWidth="2.5" />
               {isWide && <Circle cx="70" cy="80" r="7" fill="#1e293b" />}
               <Circle cx="75" cy="74" r="4.5" fill="white" />
             </G>
          )}

          {/* Right Eye */}
          {isHappy ? (
             <Path d="M115,80 Q130,70 145,80" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
             <G>
               <Ellipse cx="130" cy="80" rx={isWide ? "16" : "13"} ry={isWide ? "16" : "15"} fill={isWide ? "white" : "#1e293b"} stroke={isWide ? "#1e293b" : "none"} strokeWidth="2.5" />
               {isWide && <Circle cx="130" cy="80" r="7" fill="#1e293b" />}
               <Circle cx="135" cy="74" r="4.5" fill="white" />
             </G>
          )}
        </G>

        {/* Eyebrows */}
        {isMad && <Path d="M60,60 L90,70 M140,60 L110,70" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />}
        {isSad && <Path d="M60,65 Q75,60 90,65 M110,65 Q125,60 140,65" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />}

        {/* Mouth */}
        <G x="100" y="120">
          {isHappy ? (
            <Path d="M-25,0 Q0,15 25,0" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : isSad || isMad ? (
            <Path d="M-25,10 Q0,-10 25,10" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
            <Path d="M-25,0 Q0,15 25,0" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
        </G>
      </Svg>
    </View>
  );
};

// --- MAIN STORY COMPONENT ---
const StoryModeNative = ({ onExit }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Setup TTS on Mount
  useEffect(() => {
    const initTts = async () => {
      try {
        // Initialize Tts
        await Tts.getInitStatus();
        
        // 1. Set Rate: 0.45 (Very Slow for ASD friendly)
        await Tts.setDefaultRate(0.45);
        
        // 2. Set Pitch: 1.0 (Standard)
        await Tts.setDefaultPitch(1.0);
        
        // 3. Set Language (Android Native)
        await Tts.setDefaultLanguage('en-US');

        // Listeners for auto-advance
        Tts.addEventListener('tts-start', (event) => console.log("start", event));
        Tts.addEventListener('tts-finish', (event) => handleSentenceFinished());
        
        setIsReady(true);
      } catch (err) {
        console.log('TTS Init Error:', err);
      }
    };

    initTts();

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
    };
  }, []);

  const handleSentenceFinished = () => {
    // We need to use a ref or functional update to access current state in event listener
    // This is a simplified logic representation.
    // In real RN, you might use a useRef to track sceneIndex to avoid closure staleness.
  };
  
  // UseEffect to monitor playing state changes handled by component updates
  const nextScene = () => {
    if (!selectedStory) return;
    
    if (sceneIndex < selectedStory.scenes.length - 1) {
      const nextIdx = sceneIndex + 1;
      setSceneIndex(nextIdx);
      speakScene(nextIdx);
    } else {
      setIsPlaying(false);
      Tts.stop();
    }
  };

  const speakScene = (index) => {
    if (!selectedStory) return;
    Tts.stop();
    
    const text = selectedStory.scenes[index].text;
    
    // Android "Hack" not needed here, react-native-tts handles native queueing.
    Tts.speak(text);
  };

  // Because listeners in useEffect have stale closures, 
  // we actually use the onFinish listener to trigger a state update effect
  useEffect(() => {
    const finishListener = Tts.addListener('tts-finish', () => {
        // Artificial delay for pacing (1 second gap)
        setTimeout(() => {
           if (isPlaying) {
             // Logic to check if we are at the end
             setSceneIndex(prev => {
                const next = prev + 1;
                if (selectedStory && next < selectedStory.scenes.length) {
                    speakScene(next); // This needs to be safe to call here
                    return next;
                } else {
                    setIsPlaying(false);
                    return prev;
                }
             });
           }
        }, 1000);
    });
    
    return () => {
        finishListener.remove();
    };
  }, [selectedStory, isPlaying]);


  const handleStartStory = (story) => {
    setSelectedStory(story);
    setSceneIndex(0);
    setIsPlaying(true);
    
    // Short delay to allow UI to render
    setTimeout(() => {
        Tts.stop();
        Tts.speak(story.scenes[0].text);
    }, 500);
  };

  const handlePause = () => {
    if (isPlaying) {
      Tts.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      Tts.speak(selectedStory.scenes[sceneIndex].text);
    }
  };
  
  const handleBack = () => {
      Tts.stop();
      setSelectedStory(null);
      setIsPlaying(false);
  };

  if (!selectedStory) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Choose a Story</Text>
        <ScrollView style={styles.list}>
          {STORIES.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={styles.card} 
              onPress={() => handleStartStory(story)}
            >
              <Text style={styles.icon}>{story.icon}</Text>
              <View>
                <Text style={styles.cardTitle}>{story.title}</Text>
                <Text style={styles.cardSub}>{story.scenes.length} scenes</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentScene = selectedStory.scenes[sceneIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f0f9ff' }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
         <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.storyTitle}>{selectedStory.title}</Text>
      
      <View style={styles.characterContainer}>
         <PeliCharacter emotion={currentScene.emotion} scale={1.2} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.storyText}>"{currentScene.text}"</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePause} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? "⏸️" : "▶️"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  icon: {
    fontSize: 32,
    marginRight: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardSub: {
    color: '#64748b',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
  },
  storyTitle: {
    marginTop: 60,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 20,
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 24,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    lineHeight: 32,
  },
  controls: {
    marginBottom: 50,
  },
  playBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  playIcon: {
    fontSize: 30,
  },
});

export default StoryModeNative;
