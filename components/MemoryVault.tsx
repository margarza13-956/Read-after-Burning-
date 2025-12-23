import React, { useState } from 'react';
import { Letter } from '../types';
import { generateVaultInsights } from '../services/geminiService';
import { ArrowLeft, Search, Calendar, Tag, Image as ImageIcon, Video as VideoIcon, Sparkles } from 'lucide-react';

interface MemoryVaultProps {
  letters: Letter[];
  onBack: () => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ letters, onBack }) => {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [filter, setFilter] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const filteredLetters = letters.filter(l => 
    l.content.toLowerCase().includes(filter.toLowerCase()) ||
    l.emotion.toLowerCase().includes(filter.toLowerCase())
  );

  const handleGenerateInsight = async () => {
    setIsGeneratingInsight(true);
    const result = await generateVaultInsights(letters);
    setInsight(result);
    setIsGeneratingInsight(false);
  };

  return (
    <div className="relative z-10 min-h-screen p-6 md:p-12 flex flex-col">
        {/* Nav */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div className="flex items-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-4">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl md:text-4xl font-serif-display text-slate-200">Memory Vault</h1>
            </div>
            
            {letters.length > 0 && (
                <button 
                    onClick={handleGenerateInsight}
                    disabled={isGeneratingInsight}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-700/50 rounded-full text-indigo-200 text-sm transition-all disabled:opacity-50"
                >
                    <Sparkles size={16} />
                    {isGeneratingInsight ? 'Reading the stars...' : 'Celestial Insights'}
                </button>
            )}
        </div>

        {/* Insight Display */}
        {insight && (
            <div className="mb-8 p-6 bg-indigo-950/40 border border-indigo-500/30 rounded-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
                <div className="flex gap-4">
                    <div className="text-indigo-400 mt-1"><Sparkles size={20} /></div>
                    <div>
                        <h3 className="text-indigo-200 font-serif-display text-sm tracking-widest mb-2">THE STARS WHISPER</h3>
                        <p className="text-slate-300 font-body-text italic leading-relaxed">{insight}</p>
                    </div>
                    <button onClick={() => setInsight(null)} className="ml-auto text-slate-500 hover:text-slate-300 self-start">
                        &times;
                    </button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            
            {/* Sidebar / List */}
            <div className="lg:col-span-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[70vh]">
                <div className="p-4 border-b border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search memories..." 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full bg-slate-950 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-700"
                        />
                    </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {filteredLetters.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No ashes found here.</p>
                        </div>
                    ) : (
                        filteredLetters.map(letter => (
                            <button
                                key={letter.id}
                                onClick={() => setSelectedLetter(letter)}
                                className={`w-full text-left p-4 rounded-lg transition-all duration-200 border ${
                                    selectedLetter?.id === letter.id 
                                    ? 'bg-slate-800 border-slate-600 shadow-md' 
                                    : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        selectedLetter?.id === letter.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                        {letter.emotion}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {letter.attachment && (
                                            <span className="text-slate-500" title="Has attachment">
                                                {letter.attachment.type === 'image' ? <ImageIcon size={12} /> : <VideoIcon size={12} />}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500 font-mono">
                                            {new Date(letter.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm truncate font-body-text opacity-80">
                                    {letter.content}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Reading Pane */}
            <div className="lg:col-span-8">
                {selectedLetter ? (
                    <div className="bg-slate-100 rounded-xl shadow-2xl p-8 md:p-12 h-full min-h-[50vh] transform transition-all duration-500 overflow-y-auto relative animate-in fade-in zoom-in-95">
                         {/* Paper Texture overlay */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none rounded-xl mix-blend-multiply"></div>
                         
                         <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-300 pb-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Tag size={16} />
                                    <span className="uppercase tracking-widest text-sm font-semibold">{selectedLetter.emotion}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar size={16} />
                                    <span className="text-sm font-mono">{new Date(selectedLetter.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="prose prose-slate max-w-none">
                                <p className="font-body-text text-xl md:text-2xl leading-loose text-slate-800 whitespace-pre-wrap">
                                    {selectedLetter.content}
                                </p>
                            </div>

                            {selectedLetter.attachment && (
                                <div className="mt-8 p-4 border-2 border-slate-200 border-dashed rounded-lg bg-slate-50/50">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Attached Memory</h4>
                                    <div className="flex justify-center">
                                        {selectedLetter.attachment.type === 'image' ? (
                                            <img 
                                                src={selectedLetter.attachment.url} 
                                                alt="Attached memory" 
                                                className="max-h-[400px] rounded shadow-lg object-contain"
                                            />
                                        ) : (
                                            <video 
                                                src={selectedLetter.attachment.url} 
                                                controls 
                                                className="max-h-[400px] rounded shadow-lg w-full max-w-2xl"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-slate-300 text-center">
                                <span className="text-slate-400 font-serif-display italic text-sm">
                                    ~ This memory has been preserved from the fire ~
                                </span>
                            </div>
                         </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-10 bg-slate-900/20">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
                            <Search size={32} />
                        </div>
                        <p className="font-serif-display text-xl">Select a memory to revisit</p>
                        <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
                            Only letters that have been burnt and released to the sky can be found here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
