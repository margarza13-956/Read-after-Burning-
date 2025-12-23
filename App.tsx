import React, { useState, useEffect } from 'react';
import { AppView, Letter, Emotion } from './types';
import { ParticleSky } from './components/ParticleSky';
import { WritingDesk } from './components/WritingDesk';
import { BurnRitual } from './components/BurnRitual';
import { MemoryVault } from './components/MemoryVault';
import { SkyExplorer } from './components/SkyExplorer';
import { Button } from './components/Button';
import { PenTool, Archive, Wind, User, Settings, Sparkles } from 'lucide-react';
import { generateDailyPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState("What words would you release today?");
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rab_letters');
    if (saved) {
      try {
        setLetters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load letters", e);
      }
    }
    
    // Load daily prompt
    generateDailyPrompt().then(setDailyPrompt);
  }, []);

  // Save to local storage whenever letters change
  useEffect(() => {
    localStorage.setItem('rab_letters', JSON.stringify(letters));
  }, [letters]);

  const handleStartWriting = (emotion?: Emotion) => {
    if (emotion) setSelectedEmotion(emotion);
    else setSelectedEmotion(null);
    setView(AppView.WRITE);
  };
  
  const handleBurn = (letter: Letter) => {
    setCurrentLetter(letter);
    setView(AppView.BURNING);
  };

  const handleBurnComplete = () => {
    if (currentLetter) {
        const archivedLetter = { ...currentLetter, burnedAt: Date.now() };
        setLetters(prev => [archivedLetter, ...prev]);
        setCurrentLetter(null);
    }
    setView(AppView.SKY);
  };

  const renderView = () => {
    switch (view) {
      case AppView.LANDING:
        return (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-6 animate-in fade-in duration-1000">
            {/* Top Navigation */}
            <div className="absolute top-6 right-6 flex gap-4">
                <button className="p-2 rounded-full bg-slate-800/30 hover:bg-slate-800/60 text-slate-400 hover:text-indigo-200 transition-all backdrop-blur-md">
                   <Settings size={20} />
                </button>
            </div>

            {/* Bottom Navigation */}
             <div className="absolute bottom-6 right-6 z-20">
                <button 
                  onClick={() => setView(AppView.VAULT)}
                  className="p-3 rounded-full bg-slate-900/40 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white transition-all backdrop-blur-md group flex items-center gap-2 pr-4"
                >
                   <Archive size={20} />
                   <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-sm">Memory Vault</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full animate-pulse"></div>
                <h1 className="relative text-5xl md:text-7xl font-serif-display text-transparent bg-clip-text bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-200 drop-shadow-lg tracking-wide leading-tight mb-6">
                  Some words weigh heavy.
                </h1>
                <p className="text-xl md:text-2xl text-indigo-200/80 font-body-text italic">
                    Write them. Watch them burn. <br/> Let them drift into the endless sky.
                </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4 mb-16 w-full max-w-md">
              <Button 
                onClick={() => handleStartWriting()} 
                size="lg" 
                className="w-full py-4 text-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
              >
                <span className="flex items-center gap-2">
                    <PenTool size={20} />
                    Write a Letter
                </span>
              </Button>
              
              <Button 
                onClick={() => setView(AppView.EXPLORE)} 
                variant="ghost" 
                className="text-indigo-300 hover:text-white hover:bg-indigo-900/30 w-full"
              >
                <span className="flex items-center gap-2">
                    <Wind size={18} />
                    Explore the Sky
                </span>
              </Button>
            </div>

            {/* Daily Prompt */}
            <div className="absolute bottom-20 md:bottom-12 left-0 right-0 text-center px-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500">
               <p className="text-indigo-400/60 text-xs uppercase tracking-widest mb-2">Daily Reflection</p>
               <p className="text-slate-300 font-body-text italic text-lg opacity-80 hover:opacity-100 transition-opacity cursor-default">
                  {dailyPrompt}
               </p>
            </div>

            {/* Emotion Selector (Optional Quick Start) */}
             <div className="hidden md:flex gap-3 absolute bottom-6 left-6 opacity-60 hover:opacity-100 transition-opacity">
                 {[Emotion.GRIEF, Emotion.HOPE, Emotion.LOVE].map(e => (
                     <button 
                        key={e}
                        onClick={() => handleStartWriting(e)}
                        className="px-3 py-1 rounded-full bg-slate-900/40 border border-slate-700/50 text-xs text-slate-400 hover:bg-indigo-900/40 hover:text-indigo-200 transition-all"
                     >
                         {e}
                     </button>
                 ))}
             </div>
          </div>
        );

      case AppView.WRITE:
        return (
          <WritingDesk 
            initialEmotion={selectedEmotion}
            onBurn={handleBurn} 
            onCancel={() => setView(AppView.LANDING)} 
          />
        );

      case AppView.BURNING:
        return currentLetter ? (
          <BurnRitual 
            letter={currentLetter} 
            onComplete={handleBurnComplete} 
          />
        ) : null;

      case AppView.SKY:
        return (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-6 animate-in fade-in duration-1000">
                <h2 className="text-3xl font-serif-display text-indigo-100 mb-4 tracking-widest">RELEASED</h2>
                <p className="text-indigo-300 mb-12 font-body-text italic">Your words are now part of the stars.</p>
                
                <div className="flex gap-4">
                     <Button onClick={() => setView(AppView.LANDING)} variant="secondary">
                        Return Home
                     </Button>
                     <Button onClick={() => setView(AppView.EXPLORE)} variant="ghost">
                        Linger in the Sky
                     </Button>
                </div>
            </div>
        );
        
      case AppView.EXPLORE:
        return <SkyExplorer onClose={() => setView(AppView.LANDING)} />;

      case AppView.VAULT:
        return (
            <MemoryVault 
                letters={letters} 
                onBack={() => setView(AppView.LANDING)} 
            />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0f0c29] text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      {/* Background Layer - Higher density for Explore view */}
      <ParticleSky density={view === AppView.SKY || view === AppView.EXPLORE ? 'high' : 'low'} interactive={true} />
      
      {/* Main Content */}
      <main className="relative w-full h-full">
        {renderView()}
      </main>

      {/* Sound Toggle Placeholder (Visual only) */}
      {view !== AppView.LANDING && view !== AppView.EXPLORE && (
         <div className="fixed top-6 right-6 z-50">
             <button className="p-3 rounded-full bg-slate-900/30 hover:bg-slate-800/50 text-slate-500 hover:text-indigo-200 transition-all backdrop-blur-md">
                <Wind size={20} />
             </button>
         </div>
      )}
    </div>
  );
};

export default App;
