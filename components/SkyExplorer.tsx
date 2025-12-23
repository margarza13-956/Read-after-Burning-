import React, { useState, useEffect } from 'react';
import { generateAnonymousWhisper } from '../services/geminiService';
import { X, Wind } from 'lucide-react';

interface SkyExplorerProps {
  onClose: () => void;
}

interface Whisper {
  id: string;
  text: string;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export const SkyExplorer: React.FC<SkyExplorerProps> = ({ onClose }) => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);

  useEffect(() => {
    // Add a new whisper every few seconds
    const interval = setInterval(async () => {
      const text = await generateAnonymousWhisper();
      const newWhisper: Whisper = {
        id: crypto.randomUUID(),
        text,
        x: Math.random() * 80 + 10, // 10% to 90% screen width
        y: Math.random() * 80 + 10,
        opacity: 0,
        scale: 0.8
      };

      setWhispers(prev => [...prev, newWhisper]);

      // Fade in
      setTimeout(() => {
        setWhispers(prev => prev.map(w => w.id === newWhisper.id ? { ...w, opacity: 1, scale: 1 } : w));
      }, 100);

      // Fade out and remove
      setTimeout(() => {
        setWhispers(prev => prev.map(w => w.id === newWhisper.id ? { ...w, opacity: 0 } : w));
      }, 6000);

      setTimeout(() => {
        setWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
      }, 7000);

    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center animate-in fade-in duration-1000">
      <div className="absolute top-6 right-6 z-50">
        <button onClick={onClose} className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="absolute top-10 text-center pointer-events-none z-40">
        <h2 className="text-2xl font-serif-display text-indigo-200 tracking-widest opacity-80">SHARED SKY</h2>
        <p className="text-sm text-indigo-400 font-body-text italic">Listen to the wind...</p>
      </div>

      {/* Whispers Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {whispers.map(w => (
          <div 
            key={w.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
            style={{ 
              left: `${w.x}%`, 
              top: `${w.y}%`, 
              opacity: w.opacity,
              transform: `scale(${w.scale}) translate(-50%, -50%)`
            }}
          >
            <p className="text-indigo-100/90 font-serif-display text-lg md:text-xl text-center shadow-black drop-shadow-md blur-sm hover:blur-none transition-all duration-500 cursor-default select-none">
              {w.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
